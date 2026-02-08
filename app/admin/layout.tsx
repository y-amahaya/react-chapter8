'use client'

import { usePathname } from 'next/navigation'
import { useRouteGuard } from '../_hooks/useRouteGuard'
import AdminSidebar from "./_components/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useRouteGuard()

  const pathname = usePathname()

  return (
      <div className="h-screen flex flex-1 bg-[#f6f7fb]">
        <AdminSidebar />
        <main className="flex-1 p-4 pt-16">{children}</main>
      </div>
  )
}