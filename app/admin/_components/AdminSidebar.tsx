"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const linkClass = (href: string) =>
    [
      "block px-4 py-3 font-medium",
      isActive(href) ? "bg-[#dbeafe]" : "hover:bg-[#f3f4f6]",
    ].join(" ");

  return (
    <aside className="w-64 h-full bg-white border-r border-[#e5e7eb]">
      <nav>
        <Link href="/admin/posts" className={linkClass("/admin/posts")}>
          記事一覧
        </Link>

        <Link
          href="/admin/categories"
          className={linkClass("/admin/categories")}
        >
          カテゴリー一覧
        </Link>
      </nav>
    </aside>
  );
}
