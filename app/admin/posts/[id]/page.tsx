"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PostShowResponse } from "@/app/_types/AdminPosts";
import { Category, CategoriesIndexResponse } from "@/app/_types/Category";
import PostForm from "@/app/admin/_components/PostForm";

type CategoryOption = Pick<Category, "id" | "name">;

export default function AdminPostEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const postId = useMemo(() => Number(params?.id), [params]);

  const [postTitle, setPostTitle] = useState("");
  const [content, setContent] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("https://placehold.jp/800x400.png");

  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "">("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!postId || Number.isNaN(postId)) {
      setErrorMessage("URLのidが不正です。");
      setIsLoading(false);
      return;
    }

    const fetchAll = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const catRes = await fetch("/api/admin/categories", { cache: "no-store" });
        if (!catRes.ok) throw new Error(`Failed to fetch categories: ${catRes.status}`);
        const catData: CategoriesIndexResponse = await catRes.json();
        setCategories((catData.categories ?? []).map(({ id, name }) => ({ id, name })));

        const postRes = await fetch(`/api/admin/posts/${postId}`, { cache: "no-store" });
        if (!postRes.ok) {
          const d = await postRes.json().catch(() => null);
          throw new Error(d?.message ?? `Failed to fetch post: ${postRes.status}`);
        }

        const postData: PostShowResponse = await postRes.json();
        const post = postData.post;

        setPostTitle(post.title ?? "");
        setContent(post.content ?? "");
        setThumbnailUrl(post.thumbnailUrl ?? "https://placehold.jp/800x400.png");

        const first = post.postCategories?.[0]?.category?.id;
        setSelectedCategoryId(typeof first === "number" ? first : "");
      } catch (e) {
        setErrorMessage(e instanceof Error ? e.message : "取得に失敗しました。");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, [postId]);

  const onSubmit = async () => {
    if (!postId || Number.isNaN(postId)) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const body = {
        title: postTitle,
        content,
        thumbnailUrl,
        categories: selectedCategoryId === "" ? [] : [{ id: selectedCategoryId }],
      };

      const res = await fetch(`/api/admin/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const msg = data?.message ?? `更新に失敗しました (status: ${res.status})`;
        throw new Error(msg);
      }

      router.push("/admin/posts");
      router.refresh();
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "更新に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDelete = async () => {
    if (!postId || Number.isNaN(postId)) return;

    const ok = window.confirm("この記事を削除しますか？");
    if (!ok) return;

    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/admin/posts/${postId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const msg = data?.message ?? `削除に失敗しました (status: ${res.status})`;
        throw new Error(msg);
      }

      router.push("/admin/posts");
      router.refresh();
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "削除に失敗しました。");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="max-w-[900px] p-4 mx-auto">
        <p>読み込み中...</p>
      </main>
    );
  }

  return (
    <PostForm
      title="記事編集"
      submitLabel="更新"
      submittingLabel="更新中..."
      postTitle={postTitle}
      onChangePostTitle={setPostTitle}
      content={content}
      onChangeContent={setContent}
      thumbnailUrl={thumbnailUrl}
      onChangeThumbnailUrl={setThumbnailUrl}
      categories={categories}
      selectedCategoryId={selectedCategoryId}
      onChangeSelectedCategoryId={setSelectedCategoryId}
      errorMessage={errorMessage}
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      onDelete={onDelete}
      isDeleting={isDeleting}
    />
  );
}
