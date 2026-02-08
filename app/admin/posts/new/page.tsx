"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Category, CategoriesIndexResponse } from "@/app/_types/Category";
import PostForm from "@/app/admin/_components/PostForm";
import { useSupabaseSession } from "@/app/_hooks/useSupabaseSession";
import { supabase } from "@/app/_libs/supabase";
import { v4 as uuidv4 } from "uuid";

type CategoryOption = Pick<Category, "id" | "name">;

export default function AdminPostNewPage() {
  const router = useRouter();

  const [postTitle, setPostTitle] = useState("");
  const [content, setContent] = useState("");
  const [thumbnailImageKey, setThumbnailImageKey] = useState<string>("");

  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "">("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { token } = useSupabaseSession();

  useEffect(() => {
    if (!token) return;

    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/admin/categories", {
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        });

        if (!res.ok) throw new Error(`Failed to fetch categories: ${res.status}`);

        const data: CategoriesIndexResponse = await res.json();
        setCategories((data.categories ?? []).map(({ id, name }) => ({ id, name })));
      } catch (e) {
        setErrorMessage(e instanceof Error ? e.message : "カテゴリー取得に失敗しました。");
      }
    };

    fetchCategories();
    }, [token]);

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

  const onSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const body = {
        title: postTitle,
        content,
        thumbnailImageKey,
        categories: selectedCategoryId === "" ? [] : [{ id: selectedCategoryId }],
      };

      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: token } : {}),
        },
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
