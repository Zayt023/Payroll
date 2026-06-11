"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import {
  Bell, LogOut, Settings, ChevronDown, Search, ChevronRight, CheckCheck, Circle
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

const pageTitles: Record<string, { label: string; parent?: string }> = {
  "/dashboard": { label: "Dashboard" },
  "/employees": { label: "Employees", parent: "Management" },
  "/employees/new": { label: "Add Employee", parent: "Employees" },
  "/practice": { label: "Practice", parent: "Management" },
  "/payroll": { label: "Payroll", parent: "Management" },
  "/payslips": { label: "Payslips", parent: "Reports" },
  "/audit-logs": { label: "Audit Logs", parent: "Reports" },
  "/settings": { label: "Settings", parent: "System" },
}

interface NotificationItem {
  id: string
  type: string
  title: string
  message?: string
  link?: string
  read: boolean
  createdAt: string
}

export function Navbar() {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showNotif, setShowNotif] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch("/api/notifications")
      .then(r => r.json())
      .then(d => { setNotifications(d.notifications || []); setUnreadCount(d.unread || 0) })
      .catch(() => {})
    const interval = setInterval(() => {
      fetch("/api/notifications")
        .then(r => r.json())
        .then(d => { setNotifications(d.notifications || []); setUnreadCount(d.unread || 0) })
        .catch(() => {})
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!showNotif) return
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false)
    }
    document.addEventListener("mousedown", handleClick, true)
    return () => document.removeEventListener("mousedown", handleClick, true)
  }, [showNotif])

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH" })
    setNotifications(n => n.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  async function markRead(n: NotificationItem) {
    if (n.read) return
    await fetch(`/api/notifications/${n.id}`, { method: "PATCH" })
    setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))
    setUnreadCount(c => Math.max(0, c - 1))
    if (n.link) router.push(n.link)
    setShowNotif(false)
  }

  const user = session?.user
  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U"

  let pageInfo = pageTitles[pathname]
  if (!pageInfo) {
    if (pathname.startsWith("/employees/")) pageInfo = { label: "Employee Detail", parent: "Employees" }
    else if (pathname.startsWith("/payroll/")) pageInfo = { label: "Payroll Detail", parent: "Payroll" }
    else pageInfo = { label: "Dashboard" }
  }

  return (
    <header className="h-14 shrink-0 border-b border-default surface-base flex items-center justify-between px-5 sticky top-0 z-30">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-[13px] font-semibold text-primary truncate">{pageInfo.label}</span>
        {pageInfo.parent && (
          <>
            <ChevronRight className="h-3 w-3 text-muted shrink-0" />
            <span className="text-[11px] text-muted truncate hidden sm:inline">{pageInfo.parent}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
          <input
            className="input h-8 w-56 text-xs"
            style={{ paddingLeft: "36px" }}
            placeholder="Search employees, payroll..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && searchQuery.trim()) { router.push("/employees"); setSearchQuery("") } }}
          />
        </div>

        <div className="v-divider hidden sm:block" />

        <div className="relative" ref={notifRef}>
          <button onClick={() => setShowNotif(!showNotif)} className="relative h-8 w-8 flex items-center justify-center rounded-md text-secondary hover:surface-raised transition-all cursor-pointer" aria-label="Notifications">
            <Bell className="h-3.5 w-3.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[14px] px-1 flex items-center justify-center rounded-full text-[9px] font-bold text-white" style={{ background: "#3d766d" }}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 top-full mt-1.5 w-80 surface-base border border-default rounded-xl z-20 shadow-xl animate-slide-down" style={{ maxHeight: "400px" }}>
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-default">
                <span className="text-xs font-semibold text-primary">Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="flex items-center gap-1 text-[10px] text-accent hover:underline cursor-pointer">
                    <CheckCheck size={12} /> Mark all read
                  </button>
                )}
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: "340px" }}>
                {notifications.length === 0 ? (
                  <p className="text-xs text-muted text-center py-8">No notifications yet</p>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => markRead(n)}
                      className="w-full flex items-start gap-3 px-4 py-2.5 text-left hover:surface-raised transition-colors cursor-pointer border-b border-[var(--border-subtle)] last:border-0"
                      style={{ background: n.read ? "transparent" : "var(--surface-sunken)" }}
                    >
                      <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5" style={{ background: n.read ? "var(--surface-raised)" : "#3d766d18" }}>
                        <Bell size={13} style={{ color: n.read ? "var(--text-muted)" : "#3d766d" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-primary truncate">{n.title}</span>
                          {!n.read && <Circle size={6} className="shrink-0" style={{ color: "#3d766d", fill: "#3d766d" }} />}
                        </div>
                        {n.message && <p className="text-[11px] text-muted mt-0.5 truncate">{n.message}</p>}
                        <p className="text-[10px] text-muted mt-1">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="v-divider" />

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 h-8 px-2 rounded-md hover:surface-raised transition-all cursor-pointer"
          >
            <div className="h-6 w-6 rounded-md flex items-center justify-center text-[10px] font-semibold shrink-0 text-white" style={{ background: "#3d766d" }}>
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-medium text-primary leading-tight">{user?.name || "User"}</p>
              <p className="text-[10px] text-muted leading-tight capitalize">{user?.role?.toLowerCase() || "Employee"}</p>
            </div>
            <ChevronDown className="h-3 w-3 text-secondary hidden sm:block" />
          </button>

          {showDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
              <div className="absolute right-0 top-full mt-1.5 w-48 surface-base border border-default rounded-xl z-20 py-1 animate-slide-down">
                <div className="px-3 py-2 border-b border-default mb-1">
                  <p className="text-xs font-medium text-primary">{user?.name || "User"}</p>
                  <p className="text-[10px] text-muted">{user?.email}</p>
                </div>
                <button onClick={() => { router.push("/settings"); setShowDropdown(false) }} className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-secondary hover:surface-raised transition-colors cursor-pointer">
                  <Settings className="h-3.5 w-3.5" />
                  Settings
                </button>
                <button onClick={() => { signOut({ callbackUrl: "/login" }); setShowDropdown(false) }} className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-error hover:surface-raised transition-colors cursor-pointer">
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
