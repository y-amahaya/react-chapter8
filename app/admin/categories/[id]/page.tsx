"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Category = {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
};

type CategoryShowResponse = {
  category: Category;
};

type UpdateCategoryRequestBody = {
  name: string;
};

export default function AdminCategoryEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const categoryId = useMemo(() => Number(params?.id), [params]);

  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(categoryId)) return;

    const run = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const res = await fetch(`/api/admin/categories/${categoryId}`, {
          method: "GET",
          cache: "no-store",
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
  }, [categoryId]);

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
        headers: { "Content-Type": "application/json" },
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
      <div style={{ padding: "24px 32px" }}>
        <p style={{ margin: 0 }}>読み込み中...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px 32px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 24px" }}>
        カテゴリー編集
      </h1>

      <div style={{ maxWidth: 720 }}>
        <label
          htmlFor="category-name"
          style={{ display: "block", fontSize: 14, color: "#374151", marginBottom: 8 }}
        >
          カテゴリー名
        </label>

        <input
          id="category-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: "100%",
            height: 44,
            padding: "0 12px",
            borderRadius: 6,
            border: "1px solid #d1d5db",
            outline: "none",
          }}
        />

        {errorMessage && (
          <p style={{ marginTop: 10, marginBottom: 0, color: "crimson", fontSize: 14 }}>
            {errorMessage}
          </p>
        )}

        <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
          <button
            type="button"
            onClick={onUpdate}
            disabled={isUpdating || isDeleting}
            style={{
              height: 40,
              padding: "0 18px",
              borderRadius: 6,
              border: "none",
              background: isUpdating ? "#4b5563" : "#4f46e5",
              color: "#fff",
              fontWeight: 700,
              cursor: isUpdating || isDeleting ? "not-allowed" : "pointer",
            }}
          >
            {isUpdating ? "更新中..." : "更新"}
          </button>

          <button
            type="button"
            onClick={onDelete}
            disabled={isUpdating || isDeleting}
            style={{
              height: 40,
              padding: "0 18px",
              borderRadius: 6,
              border: "none",
              background: isDeleting ? "#4b5563" : "#dc2626",
              color: "#fff",
              fontWeight: 700,
              cursor: isUpdating || isDeleting ? "not-allowed" : "pointer",
            }}
          >
            {isDeleting ? "削除中..." : "削除"}
          </button>
        </div>
      </div>
    </div>
  );
}
