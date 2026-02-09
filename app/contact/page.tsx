"use client";

import { useForm } from "react-hook-form";
import useSWRMutation from "swr/mutation";

const CONTACT_API =
  "https://1hmfpsvto6.execute-api.ap-northeast-1.amazonaws.com/dev/contacts";

type ContactForm = {
  name: string;
  email: string;
  message: string;
};

const initialForm: ContactForm = {
  name: "",
  email: "",
  message: "",
};

export default function ContactPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactForm>({
    defaultValues: initialForm,
  });

  const { trigger, isMutating } = useSWRMutation(
    CONTACT_API,
    async (url, { arg }: { arg: ContactForm }) => {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(arg),
      });

      if (!res.ok) throw new Error("Request failed");
    }
  );

  const handleClear = () => {
    reset(initialForm);
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      await trigger({
        name: data.name,
        email: data.email,
        message: data.message,
      });

      alert("送信しました。");
      handleClear();
    } catch {
    }
  });

  return (
    <main className="w-full max-w-[960px] mx-auto px-6 py-16">
      <h1 className="text-left text-[20px] font-bold mb-[70px]">
        問い合わせフォーム
      </h1>

      <form className="w-full" onSubmit={onSubmit}>
        <div className="grid grid-cols-[160px_1fr] gap-x-6 items-center mb-6">
          <label htmlFor="name" className="text-[14px] font-semibold">
            お名前
          </label>
          <div className="w-full">
            <input
              id="name"
              type="text"
              disabled={isMutating}
              className="w-full box-border border border-[#cfd4dc] rounded-[6px] px-[14px] py-3 text-[14px] outline-none bg-white disabled:opacity-60"
              {...register("name", {
                required: "お名前は必須です。",
                maxLength: {
                  value: 30,
                  message: "お名前は30文字以内で入力してください。",
                },
              })}
            />
            {errors.name?.message && (
              <p className="mt-2 mb-0 text-[12px] text-[#d93025]">
                {errors.name.message}
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
              type="email"
              disabled={isMutating}
              className="w-full box-border border border-[#cfd4dc] rounded-[6px] px-[14px] py-3 text-[14px] outline-none bg-white disabled:opacity-60"
              {...register("email", {
                required: "メールアドレスは必須です。",
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: "メールアドレスの形式が正しくありません。",
                },
              })}
            />
            {errors.email?.message && (
              <p className="mt-2 mb-0 text-[12px] text-[#d93025]">
                {errors.email.message}
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
              disabled={isMutating}
              rows={8}
              className="w-full box-border border border-[#cfd4dc] rounded-[6px] px-[14px] py-3 text-[14px] outline-none bg-white min-h-[200px] resize-y disabled:opacity-60"
              {...register("message", {
                required: "本文は必須です。",
                maxLength: {
                  value: 500,
                  message: "本文は500文字以内で入力してください。",
                },
              })}
            />
            {errors.message?.message && (
              <p className="mt-2 mb-0 text-[12px] text-[#d93025]">
                {errors.message.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-8">
          <button
            type="submit"
            disabled={isMutating}
            className="border-0 bg-[#111] text-white px-[22px] py-3 rounded-[8px] text-[14px] font-bold cursor-pointer disabled:opacity-60"
          >
            送信
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={isMutating}
            className="border-0 bg-[#e5e7eb] text-[#111] px-[22px] py-3 rounded-[8px] text-[14px] font-bold cursor-pointer disabled:opacity-60"
          >
            クリア
          </button>
        </div>
      </form>
    </main>
  );
}
