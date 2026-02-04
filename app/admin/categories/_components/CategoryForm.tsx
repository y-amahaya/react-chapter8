"use client";

import { useEffect, useState } from "react";

type Props = {
  title: string;

  name: string;
  onChangeName: (v: string) => void;

  errorMessage: string | null;

  onSubmit?: () => void;
  isSubmitting?: boolean;

  onUpdate?: () => void;
  onDelete?: () => void;
  isUpdating?: boolean;
  isDeleting?: boolean;

  syncNameFromProps?: boolean;
};

export default function CategoryForm(props: Props) {
  const {
    title,
    name,
    onChangeName,
    errorMessage,
    onSubmit,
    isSubmitting,
    onUpdate,
    onDelete,
    isUpdating,
    isDeleting,
    syncNameFromProps = false,
  } = props;

  const [localName, setLocalName] = useState(name);

  useEffect(() => {
    if (syncNameFromProps) setLocalName(name);
  }, [name, syncNameFromProps]);

  const value = syncNameFromProps ? localName : name;

  const handleChange = (v: string) => {
    if (syncNameFromProps) setLocalName(v);
    onChangeName(v);
  };

  const disabled = Boolean(isSubmitting || isUpdating || isDeleting);

  const body = (
    <div className="max-w-[720px]">
      <label htmlFor="category-name" className="block text-sm text-gray-700 mb-2">
        カテゴリー名
      </label>

      <input
        id="category-name"
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        disabled={disabled}
        className={`w-full h-11 px-3 rounded-md border border-gray-300 outline-none       focus:border-gray-400 ${
          disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"
        }`}
      />

      {errorMessage && (
        <p className="mt-2.5 mb-0 text-red-600 text-sm">{errorMessage}</p>
      )}

      {onSubmit && (
        <button
          type="submit"
          disabled={disabled}
          className={[
            "mt-5 h-10 px-[18px] rounded-md border-0 text-white font-bold",
            disabled ? "bg-gray-600 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 cursor-pointer",
          ].join(" ")}
        >
          {isSubmitting ? "作成中..." : "作成"}
        </button>
      )}

      {onUpdate && onDelete && (
        <div className="flex gap-3 mt-5">
          <button
            type="button"
            onClick={onUpdate}
            disabled={disabled}
            className={[
              "h-10 px-[18px] rounded-md border-0 text-white font-bold",
              disabled ? "bg-gray-600 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 cursor-pointer",
            ].join(" ")}
          >
            {isUpdating ? "更新中..." : "更新"}
          </button>

          <button
            type="button"
            onClick={onDelete}
            disabled={disabled}
            className={[
              "h-10 px-[18px] rounded-md border-0 text-white font-bold",
              disabled ? "bg-gray-600 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 cursor-pointer",
            ].join(" ")}
          >
            {isDeleting ? "削除中..." : "削除"}
          </button>
        </div>
      )}
    </div>
  );

  if (onSubmit) {
    return (
      <div className="py-6 px-8">
        <h1 className="text-[28px] font-extrabold mb-6">{title}</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          {body}
        </form>
      </div>
    );
  }

  return (
    <div className="py-6 px-8">
      <h1 className="text-[28px] font-extrabold mb-6">{title}</h1>
      {body}
    </div>
  );
}
