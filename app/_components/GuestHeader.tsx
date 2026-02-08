"use client";

import Link from "next/link";

type Props = {
  isLoading: boolean;
};

export default function GuestHeader({ isLoading }: Props) {
  return (
    <header className="flex justify-between bg-[#242424] text-white p-6 font-bold">
      <Link href="/" className="text-white no-underline hover:no-underline font-bold">
        Blog
      </Link>

      {!isLoading && (
        <div className="flex items-center gap-4">
          <Link href="/contact" className="text-white no-underline hover:no-underline font-bold">
            お問い合わせ
          </Link>
          <Link href="/sign_in" className="header-link">
            ログイン
          </Link>
        </div>
      )}
    </header>
  );
}
