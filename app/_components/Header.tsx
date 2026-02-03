"use client";

import { usePathname } from "next/navigation";
import GuestHeader from "./GuestHeader";
import AdminHeader from "../admin/_components/AdminHeader";

export default function Header() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return isAdmin ? <AdminHeader /> : <GuestHeader />;
}
