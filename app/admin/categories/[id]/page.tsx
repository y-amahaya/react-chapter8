"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutationAuth } from "@/app/_hooks/useMutationAuth";

import type {
  CategoryShowResponse,
  UpdateCategoryRequestBody,
} from "@/app/_types/Category";
import CategoryForm from "../_components/CategoryForm";
import { useSupabaseSession } from "@/app/_hooks/useSupabaseSession";
import { useFetchAuth } from "@/app/_hooks/useFetchAuth";

type FormValues = { name: string };

export default function AdminCategoryEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const categoryId = useMemo(() => Number(params?.id), [params]);

  const { token } = useSupabaseSession();

  const { watch, setValue } = useForm<FormValues>({
    defaultValues: { name: "" },
  });

  const name = watch("name");
  const setName = (v: string) => setValue("name", v);

  const endpoint =
    Number.isFinite(categoryId)
      ? `/api/admin/categories/${categoryId}`
      : null;

  const {
    data: categoryData,
    error: categoryError,
    isLoading,
  } = useFetchAuth<CategoryShowResponse>(endpoint);

  const category = categoryData?.category;

  useEffect(() => {
    if (!category) return;
    setValue("name", category.name ?? "");
  }, [category, setValue]);

  const updateCategory = async (
    url: string,
    token: string,
    arg: UpdateCategoryRequestBody
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
      const maybe = await res.json().catch(() => null);
      const msg = maybe?.message ?? `更新に失敗しました (${res.status})`;
      throw new Error(msg);
    }
  };

  const {
    trigger: updateTrigger,
    isMutating: isUpdating,
    error: updateError,
    isReady: canUpdate,
  } = useMutationAuth<void, UpdateCategoryRequestBody>(endpoint, updateCategory);

  const onUpdate = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      alert("カテゴリー名を入力してください");
      return;
    }
    if (!canUpdate) return;

    try {
      const body: UpdateCategoryRequestBody = { name: trimmed };
      await updateTrigger(body);
      router.refresh();
    } catch {
    }
  };

  const deleteCategory = async (url: string, token: string, _arg: undefined) => {
    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });

    if (!res.ok) {
      const maybe = await res.json().catch(() => null);
      const msg = maybe?.message ?? `削除に失敗しました (${res.status})`;
      throw new Error(msg);
    }
  };

  const {
    trigger: deleteTrigger,
    isMutating: isDeleting,
    error: deleteError,
    isReady: canDelete,
  } = useMutationAuth<void, undefined>(endpoint, deleteCategory);

  const onDelete = async () => {
    const ok = window.confirm("このカテゴリーを削除しますか？");
    if (!ok) return;
    if (!canDelete) return;

    try {
      await deleteTrigger(undefined);
      router.push("/admin/categories");
      router.refresh();
    } catch {}
  };

  const errorMessage = useMemo(() => {
    if (categoryError instanceof Error) return categoryError.message;
    if (updateError instanceof Error) return updateError.message;
    if (deleteError instanceof Error) return deleteError.message;
    if (categoryError) return "Unknown error";
    if (updateError) return "Unknown error";
    if (deleteError) return "Unknown error";
    return null;
  }, [categoryError, updateError, deleteError]);

  if (isLoading) {
    return (
      <div className="px-8 py-6">
        <p className="m-0">読み込み中...</p>
      </div>
    );
  }

  return (
    <CategoryForm
      title="カテゴリー編集"
      name={name}
      onChangeName={setName}
      errorMessage={errorMessage}
      onUpdate={onUpdate}
      onDelete={onDelete}
      isUpdating={isUpdating}
      isDeleting={isDeleting}
      syncNameFromProps={true}
    />
  );
}
