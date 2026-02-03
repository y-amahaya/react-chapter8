"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Category = {
  id: number;
  name: string;
};

export default function AdminPostNewPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("https://placehold.jp/800x400.png");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/admin/categories", { cache: "no-store" });
        if (!res.ok) {
          throw new Error(`Failed to fetch categories: ${res.status}`);
        }
        const data: { categories: Category[] } = await res.json();
        setCategories(data.categories ?? []);
      } catch (e) {
        setErrorMessage(e instanceof Error ? e.message : "カテゴリー取得に失敗しました。");
      }
    };

    fetchCategories();
  }, []);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const body = {
        title,
        content,
        thumbnailUrl,
        categories: selectedCategoryId === "" ? [] : [{ id: selectedCategoryId }],
      };

      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    <div className="max-w-[900px] p-4 mx-auto">
      <h1 className="text-2xl font-bold mb-6">記事作成</h1>

      {errorMessage && (
        <p className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">タイトル</label>
          <input
            className="w-full rounded border border-gray-200 px-3 py-2 outline-none focus:border-gray-400"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder=""
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">内容</label>
          <textarea
            className="w-full min-h-[120px] rounded border border-gray-200 px-3 py-2 outline-none focus:border-gray-400"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder=""
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">サムネイルURL</label>
          <input
            className="w-full rounded border border-gray-200 px-3 py-2 outline-none focus:border-gray-400"
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            placeholder="https://placehold.jp/800x400.png"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">カテゴリー</label>
          <select
            className="w-full rounded border border-gray-200 bg-white px-3 py-2 outline-none focus:border-gray-400"
            value={selectedCategoryId}
            onChange={(e) => {
              const v = e.target.value;
              setSelectedCategoryId(v === "" ? "" : Number(v));
            }}
          >
            <option value="">選択してください</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {isSubmitting ? "作成中..." : "作成"}
        </button>
      </form>
    </div>
  );
}
