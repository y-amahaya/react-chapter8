"use client";

import { usePathname } from "next/navigation";
import GuestHeader from "./GuestHeader";
import AdminHeader from "@/app/_components/AdminHeader";
import { useSupabaseSession } from "../_hooks/useSupabaseSession";

export default function Header() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  const { session, isLoading } = useSupabaseSession();

  if (isAdmin) {
    return <AdminHeader isLoading={isLoading} />;
  }

  return <GuestHeader isLoading={isLoading} />;
}