"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CreateCategoryRequestBody } from "@/app/_types/Category";

export default function AdminCategoryNewPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) {
      setErrorMessage("カテゴリー名を入力してください");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

  const body: CreateCategoryRequestBody = { name: trimmed };

  const res = await fetch("/api/admin/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
    <div style={{ padding: "24px 32px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 24px" }}>
        カテゴリー作成
      </h1>

      <form onSubmit={onSubmit}>
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
            placeholder=""
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

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              marginTop: 18,
              height: 40,
              padding: "0 18px",
              borderRadius: 6,
              border: "none",
              background: isSubmitting ? "#4b5563" : "#4f46e5",
              color: "#fff",
              fontWeight: 700,
              cursor: isSubmitting ? "not-allowed" : "pointer",
            }}
          >
            {isSubmitting ? "作成中..." : "作成"}
          </button>
        </div>
      </form>
    </div>
  );
}
