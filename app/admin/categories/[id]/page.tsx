"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { CategoryShowResponse, UpdateCategoryRequestBody } from "@/app/_types/Category";
import CategoryForm from "../_components/CategoryForm";
import { useSupabaseSession } from "@/app/_hooks/useSupabaseSession";

export default function AdminCategoryEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const categoryId = useMemo(() => Number(params?.id), [params]);

  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { token } = useSupabaseSession();

  useEffect(() => {
    if (!token) return;
    if (!Number.isFinite(categoryId)) return;

    const run = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const res = await fetch(`/api/admin/categories/${categoryId}`, {
          method: "GET",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: token } : {}),
          },
        });

        if (!res.ok) {
          const maybe = await res.json().catch(() => null);
          const msg = maybe?.message ?? `取得に失敗しました (${res.status})`;
          throw new Error(msg);
        }

        const data: CategoryShowResponse = await res.json();
        setName(data.category.name ?? "");
      } catch (e) {
        setErrorMessage(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    run();
  }, [categoryId, token]);

  const onUpdate = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setErrorMessage("カテゴリー名を入力してください");
      return;
    }

    try {
      setIsUpdating(true);
      setErrorMessage(null);

      const body: UpdateCategoryRequestBody = { name: trimmed };

      const res = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: token } : {}),
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const maybe = await res.json().catch(() => null);
        const msg = maybe?.message ?? `更新に失敗しました (${res.status})`;
        throw new Error(msg);
      }

      router.refresh();
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setIsUpdating(false);
    }
  };

  const onDelete = async () => {
    const ok = window.confirm("このカテゴリーを削除しますか？");
    if (!ok) return;

    try {
      setIsDeleting(true);
      setErrorMessage(null);

      const res = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: token } : {}),
        },
      });

      if (!res.ok) {
        const maybe = await res.json().catch(() => null);
        const msg = maybe?.message ?? `削除に失敗しました (${res.status})`;
        throw new Error(msg);
      }

      router.push("/admin/categories");
      router.refresh();
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setIsDeleting(false);
    }
  };

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
