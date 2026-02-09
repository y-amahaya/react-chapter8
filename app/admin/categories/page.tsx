"use client";

import Link from "next/link";
import useSWR from "swr";
import type { CategoriesIndexResponse, Category } from "@/app/_types/Category";
import { useSupabaseSession } from "@/app/_hooks/useSupabaseSession";

const fetcherWithToken = async (
  url: string,
  token: string
): Promise<CategoriesIndexResponse> => {
  const res = await fetch(url, {
    method: "GET",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch categories: ${res.status}`);
  }

  return res.json();
};

export default function AdminCategoriesPage() {
  const { token } = useSupabaseSession();

  const { data, isLoading, error } = useSWR<CategoriesIndexResponse>(
    token ? (["/api/admin/categories", token] as const) : null,
    ([url, t]: [string, string]) => fetcherWithToken(url, t)
  );

  const categories: Category[] = data?.categories ?? [];
  const errorMessage: string | null = error
    ? error instanceof Error
      ? error.message
      : "Unknown error"
    : null;

  return (
    <div style={{ padding: "24px 32px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>
          カテゴリー一覧
        </h1>

        <Link
          href="/admin/categories/new"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            height: 40,
            padding: "0 16px",
            background: "#2563eb",
            color: "#fff",
            borderRadius: 6,
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          新規作成
        </Link>
      </div>

      <div style={{ marginTop: 24 }}>
        {isLoading && <p style={{ margin: 0 }}>読み込み中...</p>}
        {errorMessage && (
          <p style={{ margin: 0, color: "crimson" }}>{errorMessage}</p>
        )}

        {!isLoading && !errorMessage && (
          <div style={{ marginTop: 8 }}>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/admin/categories/${c.id}`}
                style={{
                  display: "block",
                  padding: "18px 0",
                  borderBottom: "1px solid #e5e7eb",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <div style={{ fontSize: 20, fontWeight: 700 }}>{c.name}</div>
              </Link>
            ))}

            {categories.length === 0 && (
              <p style={{ marginTop: 16, color: "#6b7280" }}>
                カテゴリーがまだありません
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
