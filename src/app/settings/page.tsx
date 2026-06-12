"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { User, Building2, Save, Shield, Loader2, KeyRound, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

export default function SettingsPage() {
  const { data: session } = useSession()
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState("A3MB Medical Services")
  const [address, setAddress] = useState("")
  const [tin, setTin] = useState("")

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [changingPassword, setChangingPassword] = useState(false)
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false })

  useEffect(() => {
    fetch("/api/settings").then(async (r) => {
      try {
        const s = await r.json()
        setName(s.name || "A3MB Medical Services")
        setAddress(s.address || "Unit 7, Future 7 Building, Good Earth, Tondo, Manila, Philippines 1013")
        setTin(s.tin || "000-000-000-000")
      } catch {}
    }).finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, address, tin }),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Failed to save")
      toast.success("Settings saved")
    } catch (e: any) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  async function handleChangePassword() {
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return }
    if (newPassword.length < 6) { toast.error("New password must be at least 6 characters"); return }
    setChangingPassword(true)
    try {
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Failed")
      toast.success("Password changed successfully")
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("")
    } catch (e: any) { toast.error(e.message) }
    finally { setChangingPassword(false) }
  }

  return (
    <div className="space-y-5">

      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your account and company preferences.</p>
      </div>

      <div className="section-card">
        <div className="section-card-body">
          <h3 className="text-sm font-semibold text-primary mb-5 flex items-center gap-2">
            <User className="h-4 w-4" style={{ color: "#3d766d" }} /> Profile
          </h3>
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold" style={{ background: "#3d766d", color: "#fff" }}>
              {session?.user?.name?.charAt(0) || "U"}
            </div>
            <div>
              <p className="text-base font-semibold text-primary">{session?.user?.name || "Admin User"}</p>
              <p className="text-sm text-muted">{session?.user?.email || "admin@company.com"}</p>
              <span className="badge badge-neutral mt-1 text-[9px]">
                <Shield className="h-3 w-3" /> {session?.user?.role || "ADMIN"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        <div className="section-card">
          <div className="section-card-header">
            <h2 className="flex items-center gap-2"><Building2 className="h-4 w-4" style={{ color: "#3d766d" }} /> Company Information</h2>
          </div>
          <div className="section-card-body">
            {loading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => <div key={i} className="skeleton h-10" />)}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="form-group">
                  <label>Company Name</label>
                  <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>TIN</label>
                  <input className="input" value={tin} onChange={(e) => setTin(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <textarea className="input" rows={3} value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>
              </div>
            )}
            <button onClick={handleSave} disabled={saving || loading} className="btn btn-primary btn-md mt-5">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </button>
          </div>
        </div>

        <div className="section-card">
          <div className="section-card-header">
            <h2 className="flex items-center gap-2"><KeyRound className="h-4 w-4" style={{ color: "#3d766d" }} /> Change Password</h2>
          </div>
          <div className="section-card-body space-y-4">
            <div className="form-group">
              <label>Current Password</label>
              <div className="relative">
                <input type={showPass.current ? "text" : "password"} className="input w-full pr-9" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                <button type="button" onMouseDown={() => setShowPass(p => ({ ...p, current: true }))} onMouseUp={() => setShowPass(p => ({ ...p, current: false }))} onMouseLeave={() => setShowPass(p => ({ ...p, current: false }))} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-primary cursor-pointer select-none">
                  {showPass.current ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>New Password</label>
              <div className="relative">
                <input type={showPass.new ? "text" : "password"} className="input w-full pr-9" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                <button type="button" onMouseDown={() => setShowPass(p => ({ ...p, new: true }))} onMouseUp={() => setShowPass(p => ({ ...p, new: false }))} onMouseLeave={() => setShowPass(p => ({ ...p, new: false }))} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-primary cursor-pointer select-none">
                  {showPass.new ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <div className="relative">
                <input type={showPass.confirm ? "text" : "password"} className="input w-full pr-9" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                <button type="button" onMouseDown={() => setShowPass(p => ({ ...p, confirm: true }))} onMouseUp={() => setShowPass(p => ({ ...p, confirm: false }))} onMouseLeave={() => setShowPass(p => ({ ...p, confirm: false }))} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-primary cursor-pointer select-none">
                  {showPass.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button onClick={handleChangePassword} disabled={changingPassword} className="btn btn-primary btn-md">
              {changingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
              Change Password
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
