"use client"

import { useSession } from "next-auth/react"
import { usePathname, redirect } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Navbar } from "@/components/layout/navbar"
import { Loader2 } from "lucide-react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center surface-sunken">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#3d766d" }} />
      </div>
    )
  }

  if (!session) redirect("/login")

  return (
    <div className="flex h-screen overflow-hidden surface-sunken">
      <Sidebar />
      <div className="flex flex-1 flex-col ml-56">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
              {children}
        </main>
      </div>
    </div>
  )
}
