"use client";

import { useState } from "react";

const CONTACT_API =
  "https://1hmfpsvto6.execute-api.ap-northeast-1.amazonaws.com/dev/contacts";

type ContactForm = {
  name: string;
  email: string;
  message: string;
};

type ContactErrors = Partial<Record<keyof ContactForm, string>>;

const initialForm: ContactForm = {
  name: "",
  email: "",
  message: "",
};

export default function ContactPage() {
  const [form, setForm] = useState<ContactForm>(initialForm);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = (values: ContactForm): ContactErrors => {
    const nextErrors: ContactErrors = {};

    if (!values.name.trim()) {
      nextErrors.name = "お名前は必須です。";
    } else if (values.name.length > 30) {
      nextErrors.name = "お名前は30文字以内で入力してください。";
    }

    if (!values.email.trim()) {
      nextErrors.email = "メールアドレスは必須です。";
    } else if (!/^\S+@\S+\.\S+$/.test(values.email)) {
      nextErrors.email = "メールアドレスの形式が正しくありません。";
    }

    if (!values.message.trim()) {
      nextErrors.message = "本文は必須です。";
    } else if (values.message.length > 500) {
      nextErrors.message = "本文は500文字以内で入力してください。";
    }


    return nextErrors;
  };

  const handleClear = () => {
    setForm(initialForm);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const nextErrors = validate(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);

    try {
      const res = await fetch(CONTACT_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: form.message,
        }),
      });

      if (!res.ok) return;

      alert("送信しました。");
      handleClear();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="w-full max-w-[960px] mx-auto px-6 py-16">
      <h1 className="text-left text-[20px] font-bold mb-[70px]">
        問い合わせフォーム
      </h1>

      <form className="w-full" onSubmit={handleSubmit}>
        <div className="grid grid-cols-[160px_1fr] gap-x-6 items-center mb-6">
          <label htmlFor="name" className="text-[14px] font-semibold">
            お名前
          </label>
          <div className="w-full">
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full box-border border border-[#cfd4dc] rounded-[6px] px-[14px] py-3 text-[14px] outline-none bg-white disabled:opacity-60"
            />
            {errors.name && (
              <p className="mt-2 mb-0 text-[12px] text-[#d93025]">
                {errors.name}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-[160px_1fr] gap-x-6 items-center mb-6">
          <label htmlFor="email" className="text-[14px] font-semibold">
            メールアドレス
          </label>
          <div className="w-full">
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full box-border border border-[#cfd4dc] rounded-[6px] px-[14px] py-3 text-[14px] outline-none bg-white disabled:opacity-60"
            />
            {errors.email && (
              <p className="mt-2 mb-0 text-[12px] text-[#d93025]">
                {errors.email}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-[160px_1fr] gap-x-6 items-start mb-6">
          <label htmlFor="message" className="text-[14px] font-semibold">
            本文
          </label>
          <div className="w-full">
            <textarea
              id="message"
              name="message"
              value={form.message}
              onChange={handleChange}
              disabled={isSubmitting}
              rows={8}
              className="w-full box-border border border-[#cfd4dc] rounded-[6px] px-[14px] py-3 text-[14px] outline-none bg-white min-h-[200px] resize-y disabled:opacity-60"
            />
            {errors.message && (
              <p className="mt-2 mb-0 text-[12px] text-[#d93025]">
                {errors.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-8">
          <button
            type="submit"
            disabled={isSubmitting}
            className="border-0 bg-[#111] text-white px-[22px] py-3 rounded-[8px] text-[14px] font-bold cursor-pointer disabled:opacity-60"
          >
            送信
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={isSubmitting}
            className="border-0 bg-[#e5e7eb] text-[#111] px-[22px] py-3 rounded-[8px] text-[14px] font-bold cursor-pointer disabled:opacity-60"
          >
            クリア
          </button>
        </div>
      </form>
    </main>
  );
}
