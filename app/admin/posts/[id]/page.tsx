"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Category = {
  id: number;
  name: string;
};

type PostShowResponse = {
  post: {
    id: number;
    title: string;
    content: string;
    thumbnailUrl: string;
    createdAt: string;
    updatedAt: string;
    postCategories: {
      category: Category;
    }[];
  };
};

export default function AdminPostEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const postId = useMemo(() => Number(params?.id), [params]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("https://placehold.jp/800x400.png");

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "">("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!postId || Number.isNaN(postId)) {
      setErrorMessage("URLのidが不正です。");
      setIsLoading(false);
      return;
    }

    const fetchAll = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const catRes = await fetch("/api/admin/categories", { cache: "no-store" });
        if (!catRes.ok) throw new Error(`Failed to fetch categories: ${catRes.status}`);
        const catData: { categories: Category[] } = await catRes.json();
        setCategories(catData.categories ?? []);

        const postRes = await fetch(`/api/admin/posts/${postId}`, { cache: "no-store" });
        if (!postRes.ok) {
          const d = await postRes.json().catch(() => null);
          throw new Error(d?.message ?? `Failed to fetch post: ${postRes.status}`);
        }

        const postData: PostShowResponse = await postRes.json();
        const post = postData.post;

        setTitle(post.title ?? "");
        setContent(post.content ?? "");
        setThumbnailUrl(post.thumbnailUrl ?? "https://placehold.jp/800x400.png");

        const first = post.postCategories?.[0]?.category?.id;
        setSelectedCategoryId(typeof first === "number" ? first : "");
      } catch (e) {
        setErrorMessage(e instanceof Error ? e.message : "取得に失敗しました。");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, [postId]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!postId || Number.isNaN(postId)) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const body = {
        title,
        content,
        thumbnailUrl,
        categories: selectedCategoryId === "" ? [] : [{ id: selectedCategoryId }],
      };

      const res = await fetch(`/api/admin/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const msg = data?.message ?? `更新に失敗しました (status: ${res.status})`;
        throw new Error(msg);
      }

      router.push("/admin/posts");
      router.refresh();
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "更新に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDelete = async () => {
    if (!postId || Number.isNaN(postId)) return;

    const ok = window.confirm("この記事を削除しますか？");
    if (!ok) return;

    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/admin/posts/${postId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const msg = data?.message ?? `削除に失敗しました (status: ${res.status})`;
        throw new Error(msg);
      }

      router.push("/admin/posts");
      router.refresh();
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "削除に失敗しました。");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="max-w-[900px] p-4 mx-auto">
        <p>読み込み中...</p>
      </main>
    );
  }

  return (
    <div className="max-w-[900px] p-4 mx-auto">
      <h1 className="text-2xl font-bold mb-6">記事編集</h1>

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
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">内容</label>
          <textarea
            className="w-full min-h-[120px] rounded border border-gray-200 px-3 py-2 outline-none focus:border-gray-400"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">サムネイルURL</label>
          <p className="text-xs text-gray-500"></p>
          <input
            className="w-full rounded border border-gray-200 px-3 py-2 outline-none focus:border-gray-400"
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            placeholder="https://placehold.jp/800x400.png"
          />

          {thumbnailUrl && (
            <img
              src={thumbnailUrl}
              alt="thumbnail preview"
              className="mt-3 max-w-full rounded border border-gray-200"
            />
          )}
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

          {selectedCategoryId !== "" && (
            <div className="pt-2">
              <span className="inline-flex text-[#4c6ef5] border border-[#4c6ef5] px-2 py-1 text-[12px] rounded">
                {categories.find((c) => c.id === selectedCategoryId)?.name ?? ""}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting || isDeleting}
            className="inline-flex items-center justify-center rounded bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {isSubmitting ? "更新中..." : "更新"}
          </button>

          <button
            type="button"
            onClick={onDelete}
            disabled={isSubmitting || isDeleting}
            className="inline-flex items-center justify-center rounded bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {isDeleting ? "削除中..." : "削除"}
          </button>
        </div>
      </form>
    </div>
  );
}
