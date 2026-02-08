"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../_libs/supabase";

type Props = {
  isLoading: boolean;
};

export default function AdminHeader({ isLoading }: Props) {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="flex justify-between bg-[#242424] text-white p-6 font-bold">
      <Link href="/" className="text-white no-underline hover:no-underline font-bold">
        Blog
      </Link>

      {!isLoading && (
        <div className="flex gap-6 items-center">
          <Link href="/admin/posts">
            管理画面
          </Link>
          <button type="button" onClick={handleLogout}>
            ログアウト
          </button>
        </div>
      )}
    </header>
  );
}
