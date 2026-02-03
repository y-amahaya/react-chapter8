"use client";

import Link from "next/link";

export default function AdminHeader() {
  return (
    <header className="flex justify-between bg-[#242424] text-white p-6 font-bold">
      <Link href="/" className="text-white no-underline hover:no-underline font-bold">
        Blog
      </Link>

      <div className="flex gap-6 items-center">
        <Link href="/admin/posts">管理画面</Link>
        <button type="button">ログアウト</button>
      </div>
    </header>
  );
}
