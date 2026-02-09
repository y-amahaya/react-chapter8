"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import type {
  CategoryShowResponse,
  UpdateCategoryRequestBody,
} from "@/app/_types/Category";
import CategoryForm from "../_components/CategoryForm";
import { useSupabaseSession } from "@/app/_hooks/useSupabaseSession";

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

  const fetchCategory = async ([url, token]: [string, string]) => {
    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });

    if (!res.ok) {
      const maybe = await res.json().catch(() => null);
      const msg = maybe?.message ?? `取得に失敗しました (${res.status})`;
      throw new Error(msg);
    }

    const data: CategoryShowResponse = await res.json();
    return data.category;
  };

  const {
    data: category,
    error: categoryError,
    isLoading,
  } = useSWR(
    token && Number.isFinite(categoryId)
      ? [`/api/admin/categories/${categoryId}`, token]
      : null,
    fetchCategory
  );

  useEffect(() => {
    if (!category) return;
    setValue("name", category.name ?? "");
  }, [category, setValue]);

  const updateCategory = async (
    [url, token]: [string, string],
    { arg }: { arg: UpdateCategoryRequestBody }
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
  } = useSWRMutation(
    token && Number.isFinite(categoryId)
      ? [`/api/admin/categories/${categoryId}`, token]
      : null,
    updateCategory
  );

  const onUpdate = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      alert("カテゴリー名を入力してください");
      return;
    }
    if (!token) return;

    try {
      const body: UpdateCategoryRequestBody = { name: trimmed };
      await updateTrigger(body);
      router.refresh();
    } catch {
    }
  };

  const deleteCategory = async ([url, token]: [string, string]) => {
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
  } = useSWRMutation(
    token && Number.isFinite(categoryId)
      ? [`/api/admin/categories/${categoryId}`, token]
      : null,
    deleteCategory
  );

  const onDelete = async () => {
    const ok = window.confirm("このカテゴリーを削除しますか？");
    if (!ok) return;
    if (!token) return;

    try {
      await deleteTrigger();
      router.push("/admin/categories");
      router.refresh();
    } catch {
    }
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
