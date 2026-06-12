"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useSession, signOut } from "next-auth/react"
import {
  LayoutDashboard, Users, DollarSign, FileText, Clock, Settings, Building2, LogOut, Briefcase
} from "lucide-react"

const nav = [
  { section: "Overview", items: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ]},
  { section: "Management", items: [
    { href: "/employees", label: "Employees", icon: Users },
    { href: "/timesheet", label: "Timesheet", icon: Clock },
    { href: "/practice", label: "Practice", icon: Briefcase },
    { href: "/payroll", label: "Payroll", icon: DollarSign },
  ]},
  { section: "Reports", items: [
    { href: "/payslips", label: "Payslips", icon: FileText },
    { href: "/audit-logs", label: "Audit Logs", icon: Clock },
  ]},
  { section: "System", items: [
    { href: "/settings", label: "Settings", icon: Settings },
  ]},
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(href)
  }

  const user = session?.user
  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U"

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-40 w-56 border-r border-default surface-base flex flex-col">
      <div className="flex h-14 items-center gap-3 px-4 border-b border-default shrink-0">
        <div className="flex h-7 w-7 items-center justify-center rounded-md" style={{ background: "#3d766d" }}>
          <Building2 className="h-3.5 w-3.5 text-white" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-bold text-primary leading-none">A3MB Medical</span>
          <span className="text-[9px] font-medium text-muted leading-tight mt-0.5">Billing Services</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-5">
        {nav.map((group) => (
          <div key={group.section}>
            <p className="px-3 pb-1 text-[10px] font-semibold text-muted uppercase tracking-wider">
              {group.section}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 h-8 rounded-md text-sm font-medium transition-all duration-100 focus:outline-none",
                      active
                        ? "text-primary" : "text-secondary hover:surface-raised hover:text-primary"
                    )}
                    style={active ? { background: "rgba(61, 118, 109, 0.08)" } : {}}
                  >
                    <item.icon
                      className="h-4 w-4 shrink-0"
                      style={active ? { color: "#3d766d" } : {}}
                    />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-default shrink-0">
        <div className="flex items-center gap-3 px-1 py-2">
          <div
            className="h-7 w-7 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 text-white"
            style={{ background: "#3d766d" }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-primary truncate">{user?.name || "User"}</p>
            <p className="text-[10px] text-muted truncate">{user?.email || ""}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="h-6 w-6 flex items-center justify-center rounded text-muted hover:text-error hover:surface-raised transition-all shrink-0 cursor-pointer"
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
