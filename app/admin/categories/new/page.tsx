"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutationAuth } from "@/app/_hooks/useMutationAuth";
import { CreateCategoryRequestBody } from "@/app/_types/Category";
import CategoryForm from "../_components/CategoryForm";
import { useSupabaseSession } from "@/app/_hooks/useSupabaseSession";

type FormValues = { name: string };

export default function AdminCategoryNewPage() {
  const router = useRouter();
  const { token } = useSupabaseSession();

  const { watch, setValue } = useForm<FormValues>({
    defaultValues: { name: "" },
  });

  const name = watch("name");
  const setName = (v: string) => setValue("name", v);

  const createCategory = async (
    url: string,
    token: string,
    arg: CreateCategoryRequestBody
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
      const maybe = await res.json().catch(() => null);
      const msg = maybe?.message ?? `作成に失敗しました (${res.status})`;
      throw new Error(msg);
    }
  };

  const { trigger, isMutating, error: submitError, isReady } =
    useMutationAuth<void, CreateCategoryRequestBody>(
      "/api/admin/categories",
      createCategory
    );

  const isSubmitting = isMutating;
  const errorMessage =
    submitError instanceof Error ? submitError.message : submitError ? "Unknown error" : null;

  const onSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      alert("カテゴリー名を入力してください");
      return;
    }

  if (!isReady) return;

  try {
    const body: CreateCategoryRequestBody = { name: trimmed };
    await trigger(body);
    router.push("/admin/categories");
    router.refresh();
  } catch {}
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
