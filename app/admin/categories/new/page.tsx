"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreateCategoryRequestBody } from "@/app/_types/Category";
import CategoryForm from "../_components/CategoryForm";
import { useSupabaseSession } from "@/app/_hooks/useSupabaseSession";

export default function AdminCategoryNewPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { token } = useSupabaseSession();

  const onSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setErrorMessage("カテゴリー名を入力してください");
      return;
    }

    if (!token) return;

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const body: CreateCategoryRequestBody = { name: trimmed };

      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const maybe = await res.json().catch(() => null);
        const msg = maybe?.message ?? `作成に失敗しました (${res.status})`;
        throw new Error(msg);
      }

      router.push("/admin/categories");
      router.refresh();
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CategoryForm
      title="カテゴリー作成"
      name={name}
      onChangeName={setName}
      errorMessage={errorMessage}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    />
  );
}
