"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Category, CategoriesIndexResponse } from "@/app/_types/Category";
import PostForm from "@/app/admin/_components/PostForm";

type CategoryOption = Pick<Category, "id" | "name">;

export default function AdminPostNewPage() {
  const router = useRouter();

  const [postTitle, setPostTitle] = useState("");
  const [content, setContent] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("https://placehold.jp/800x400.png");

  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "">("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/admin/categories", { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed to fetch categories: ${res.status}`);

        const data: CategoriesIndexResponse = await res.json();

        setCategories((data.categories ?? []).map(({ id, name }) => ({ id, name })));
      } catch (e) {
        setErrorMessage(e instanceof Error ? e.message : "カテゴリー取得に失敗しました。");
      }
    };

    fetchCategories();
  }, []);

  const onSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const body = {
        title: postTitle,
        content,
        thumbnailUrl,
        categories: selectedCategoryId === "" ? [] : [{ id: selectedCategoryId }],
      };

      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const msg = data?.message ?? `作成に失敗しました (status: ${res.status})`;
        throw new Error(msg);
      }

      router.push("/admin/posts");
      router.refresh();
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "作成に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PostForm
      title="記事作成"
      submitLabel="作成"
      submittingLabel="作成中..."
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
    />
  );
}
