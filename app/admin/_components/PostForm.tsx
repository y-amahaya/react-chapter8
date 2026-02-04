"use client";

import type { AdminPostCategory } from "@/app/_types/AdminPosts";

type CategoryOption = AdminPostCategory["category"];

type Props = {
  title: string;

  submitLabel: string;
  submittingLabel?: string;

  postTitle: string;
  onChangePostTitle: (v: string) => void;

  content: string;
  onChangeContent: (v: string) => void;

  thumbnailUrl: string;
  onChangeThumbnailUrl: (v: string) => void;

  categories: CategoryOption[];
  selectedCategoryId: number | "";
  onChangeSelectedCategoryId: (v: number | "") => void;

  errorMessage: string | null;
  isSubmitting: boolean;

  onSubmit: () => void | Promise<void>;

  onDelete?: () => void | Promise<void>;
  isDeleting?: boolean;
};

export default function PostForm({
  title,

  submitLabel,
  submittingLabel = "送信中...",

  postTitle,
  onChangePostTitle,
  content,
  onChangeContent,
  thumbnailUrl,
  onChangeThumbnailUrl,
  categories,
  selectedCategoryId,
  onChangeSelectedCategoryId,
  errorMessage,
  isSubmitting,
  onSubmit,
  onDelete,
  isDeleting = false,
}: Props) {
  const disabled = isSubmitting || isDeleting;

  const selectedCategoryName =
    selectedCategoryId === ""
      ? ""
      : categories.find((c) => c.id === selectedCategoryId)?.name ?? "";

  return (
    <div className="max-w-[900px] p-4 mx-auto">
      <h1 className="text-2xl font-bold mb-6">{title}</h1>

      {errorMessage && (
        <p className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="space-y-6"
      >
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">タイトル</label>
          <input
            disabled={disabled}
            className="w-full rounded border border-gray-200 px-3 py-2 outline-none focus:border-gray-400"
            value={postTitle}
            onChange={(e) => onChangePostTitle(e.target.value)}
            placeholder=""
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">内容</label>
          <textarea
            disabled={disabled}
            className="w-full min-h-[120px] rounded border border-gray-200 px-3 py-2 outline-none focus:border-gray-400"
            value={content}
            onChange={(e) => onChangeContent(e.target.value)}
            placeholder=""
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">サムネイルURL</label>
          <input
            disabled={disabled}
            className="w-full rounded border border-gray-200 px-3 py-2 outline-none focus:border-gray-400"
            value={thumbnailUrl}
            onChange={(e) => onChangeThumbnailUrl(e.target.value)}
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
            disabled={disabled}
            className="w-full rounded border border-gray-200 bg-white px-3 py-2 outline-none focus:border-gray-400"
            value={selectedCategoryId}
            onChange={(e) => {
              const v = e.target.value;
              onChangeSelectedCategoryId(v === "" ? "" : Number(v));
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
                {selectedCategoryName}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={disabled}
            className="inline-flex items-center justify-center rounded bg-indigo-600 px-5 py-2 text-sm           font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {isSubmitting ? submittingLabel : submitLabel}
          </button>

          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete()}
              disabled={disabled}
              className="inline-flex items-center justify-center rounded bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            >
              {isDeleting ? "削除中..." : "削除"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
