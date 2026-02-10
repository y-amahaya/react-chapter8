"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import useSWRMutation from "swr/mutation";

import { PostShowResponse } from "@/app/_types/AdminPosts";
import { Category, CategoriesIndexResponse } from "@/app/_types/Category";
import PostForm from "@/app/admin/_components/PostForm";
import { useSupabaseSession } from "@/app/_hooks/useSupabaseSession";
import { useFetch } from "@/app/_hooks/useFetch";
import { supabase } from "@/app/_libs/supabase";
import { v4 as uuidv4 } from "uuid";

type CategoryOption = Pick<Category, "id" | "name">;

type FormValues = {
  postTitle: string;
  content: string;
};

export default function AdminPostEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const postId = useMemo(() => Number(params?.id), [params]);
  const isInvalidId = !postId || Number.isNaN(postId);

  const { watch, setValue } = useForm<FormValues>({
    defaultValues: { postTitle: "", content: "" },
  });

  const postTitle = watch("postTitle");
  const content = watch("content");

  const setPostTitle = (v: string) => setValue("postTitle", v);
  const setContent = (v: string) => setValue("content", v);

  const [thumbnailImageKey, setThumbnailImageKey] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "">("");

  const { token } = useSupabaseSession();

  const {
    data: categoriesData,
    error: categoriesError,
    isLoading: isCategoriesLoading,
  } = useFetch<CategoriesIndexResponse>(token ? "/api/admin/categories" : null);

  const categories: CategoryOption[] =
    (categoriesData?.categories ?? []).map(({ id, name }) => ({ id, name }));

  const postEndpoint =
    token && !isInvalidId ? `/api/admin/posts/${postId}` : null;

  const {
    data: postData,
    error: postError,
    isLoading: isPostLoading,
  } = useFetch<PostShowResponse>(postEndpoint);

  const post = postData?.post;

  useEffect(() => {
    if (!post) return;

    setValue("postTitle", post.title ?? "");
    setValue("content", post.content ?? "");
    setThumbnailImageKey(post.thumbnailImageKey ?? "");

    const first = post.postCategories?.[0]?.category?.id;
    setSelectedCategoryId(typeof first === "number" ? first : "");
  }, [post, setValue]);

  const onChangeThumbnailFile = async (file: File | null) => {
    if (!file) return;

    const filePath = `private/${uuidv4()}`;

    const { data, error } = await supabase.storage
      .from("post_thumbnail")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      alert(error.message);
      return;
    }

    setThumbnailImageKey(data.path);
  };

  const updatePost = async (
    [url, token]: [string, string],
    { arg }: { arg: any }
  ) => {
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify(arg),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      const msg = data?.message ?? `更新に失敗しました (status: ${res.status})`;
      throw new Error(msg);
    }
  };

  const {
    trigger: updateTrigger,
    isMutating: isSubmitting,
    error: updateError,
  } = useSWRMutation(
    token && !isInvalidId ? [`/api/admin/posts/${postId}`, token] : null,
    updatePost
  );

  const onSubmit = async () => {
    if (isInvalidId) return;
    if (!token) return;

    const body = {
      title: postTitle,
      content,
      thumbnailImageKey,
      categories: selectedCategoryId === "" ? [] : [{ id: selectedCategoryId }],
    };

    try {
      await updateTrigger(body);
      router.push("/admin/posts");
      router.refresh();
    } catch {
    }
  };

  const deletePost = async ([url, token]: [string, string]) => {
    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      const msg = data?.message ?? `削除に失敗しました (status: ${res.status})`;
      throw new Error(msg);
    }
  };

  const {
    trigger: deleteTrigger,
    isMutating: isDeleting,
    error: deleteError,
  } = useSWRMutation(
    token && !isInvalidId ? [`/api/admin/posts/${postId}`, token] : null,
    deletePost
  );

  const onDelete = async () => {
    if (isInvalidId) return;
    if (!token) return;

    const ok = window.confirm("この記事を削除しますか？");
    if (!ok) return;

    try {
      await deleteTrigger();
      router.push("/admin/posts");
      router.refresh();
    } catch {
    }
  };

  const isLoading =
    !token || (!isInvalidId && (isCategoriesLoading || isPostLoading));

  const errorMessage = useMemo(() => {
    if (isInvalidId) return "URLのidが不正です。";
    if (categoriesError instanceof Error) return categoriesError.message;
    if (postError instanceof Error) return postError.message;
    if (updateError instanceof Error) return updateError.message;
    if (deleteError instanceof Error) return deleteError.message;
    if (categoriesError) return "カテゴリー取得に失敗しました。";
    if (postError) return "取得に失敗しました。";
    if (updateError) return "更新に失敗しました。";
    if (deleteError) return "削除に失敗しました。";
    return null;
  }, [isInvalidId, categoriesError, postError, updateError, deleteError]);

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
      onChangeThumbnailFile={onChangeThumbnailFile}
      categories={categories}
      selectedCategoryId={selectedCategoryId}
      onChangeSelectedCategoryId={setSelectedCategoryId}
      errorMessage={errorMessage}
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      onDelete={onDelete}
      isDeleting={isDeleting}
      thumbnailImageKey={thumbnailImageKey}
    />
  );
}
