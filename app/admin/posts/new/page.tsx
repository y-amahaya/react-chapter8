"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Category, CategoriesIndexResponse } from "@/app/_types/Category";
import PostForm from "@/app/admin/_components/PostForm";
import { useSupabaseSession } from "@/app/_hooks/useSupabaseSession";
import { useFetch } from "@/app/_hooks/useFetch";
import { supabase } from "@/app/_libs/supabase";
import { v4 as uuidv4 } from "uuid";
import { useForm } from "react-hook-form";
import useSWRMutation from "swr/mutation";

type CategoryOption = Pick<Category, "id" | "name">;

type FormValues = {
  postTitle: string;
  content: string;
};

export default function AdminPostNewPage() {
  const router = useRouter();

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
  } = useFetch<CategoriesIndexResponse>(token ? "/api/admin/categories" : null);

  const categories: CategoryOption[] =
    (categoriesData?.categories ?? []).map(({ id, name }) => ({ id, name }));

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

  const createPost = async (
    [url, token]: [string, string],
    { arg }: { arg: any }
  ) => {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify(arg),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      const msg = data?.message ?? `作成に失敗しました (status: ${res.status})`;
      throw new Error(msg);
    }
  };

  const { trigger, isMutating, error: submitError } = useSWRMutation(
    token ? ["/api/admin/posts", token] : null,
    createPost
  );

  const onSubmit = async () => {
    if (!token) return;

    const body = {
      title: postTitle,
      content,
      thumbnailImageKey,
      categories: selectedCategoryId === "" ? [] : [{ id: selectedCategoryId }],
    };

    try {
      await trigger(body);
      router.push("/admin/posts");
      router.refresh();
    } catch {
    }
  };

  const isSubmitting = isMutating;

  const errorMessage = useMemo(() => {
    if (categoriesError instanceof Error) return categoriesError.message;
    if (submitError instanceof Error) return submitError.message;
    if (categoriesError) return "カテゴリー取得に失敗しました。";
    if (submitError) return "作成に失敗しました。";
    return null;
  }, [categoriesError, submitError]);

  return (
    <PostForm
      title="記事作成"
      submitLabel="作成"
      submittingLabel="作成中..."
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
      thumbnailImageKey={thumbnailImageKey}
    />
  );
}
