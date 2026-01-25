"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="flex justify-between bg-[#242424] text-white p-6 font-bold">
      <Link href="/" className="text-white no-underline hover:no-underline font-bold">
        Blog
      </Link>

      <Link href="/contact" className="text-white no-underline hover:no-underline font-bold">
        お問い合わせ
      </Link>
    </header>
  );
}
