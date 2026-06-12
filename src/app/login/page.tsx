"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Eye, EyeOff, Loader2, Building2 } from "lucide-react"
import { signIn } from "next-auth/react"
import { toast } from "sonner"

function LoginForm() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (searchParams.get("error") === "CredentialsSignin") toast.error("Invalid credentials")
    else if (searchParams.get("error")) toast.error("Login failed")
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const result = await signIn("credentials", { email, password, redirect: false })
    if (!result?.error) {
      window.location.href = "/dashboard"
    } else {
      toast.error("Invalid credentials")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="form-group">
        <label htmlFor="email" className="text-xs font-semibold tracking-wide uppercase" style={{ color: "var(--text-secondary)" }}>Email</label>
        <input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="name@company.com" required autoComplete="email" className="input h-11" />
      </div>

      <div className="form-group">
        <label htmlFor="password" className="text-xs font-semibold tracking-wide uppercase" style={{ color: "var(--text-secondary)" }}>Password</label>
        <div className="relative">
          <input id="password" name="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" required autoComplete="current-password" className="input h-11 pr-10" />
          <button type="button" onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity" style={{ color: "var(--text-muted)" }}>
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full justify-center text-sm h-11">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? "Signing in\u2026" : "Sign in"}
      </button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen" style={{ background: "var(--surface-base)" }}>
      <div className="hidden lg:flex flex-col relative w-[42%] p-12 overflow-hidden" style={{ background: "var(--surface-base)" }}>
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: "radial-gradient(circle at 20px 20px, var(--border-default) 1px, transparent 0)",
          backgroundSize: "40px 40px"
        }} />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full opacity-[0.04]" style={{ background: "#3d766d", transform: "translate(-40%, -30%)" }} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-[0.04]" style={{ background: "#3d766d", transform: "translate(40%, 30%)" }} />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md" style={{ background: "#3d766d", color: "#fff" }}>
            <Building2 className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>A3MB Medical Billing</span>
        </div>
        <div className="relative z-10 flex-1 flex flex-col justify-center max-w-sm">
          <h1 className="text-2xl font-bold tracking-tight leading-tight" style={{ color: "var(--text-primary)" }}>
            Enterprise Payroll<br />Management Platform
          </h1>
          <p className="text-sm mt-3 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            High-precision financial automation for modern enterprise workflows.
          </p>
          <div className="mt-10 space-y-3">
            <div className="flex items-center gap-3 text-sm" style={{ color: "var(--text-secondary)" }}>
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#3d766d" }} />
              SOC2 Compliant &amp; Enterprise Grade
            </div>
            <div className="flex items-center gap-3 text-sm" style={{ color: "var(--text-secondary)" }}>
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#3d766d" }} />
              Full Audit Trail with Immutable Records
            </div>
            <div className="flex items-center gap-3 text-sm" style={{ color: "var(--text-secondary)" }}>
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#3d766d" }} />
              Automated PH Government Deductions
            </div>
          </div>
        </div>
        <p className="relative z-10 text-xs" style={{ color: "var(--text-muted)" }}>&copy; 2026 A3MB Medical Billing Services</p>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12" style={{ background: "var(--surface-sunken)" }}>
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-10">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: "#3d766d", color: "#fff" }}>
              <Building2 className="h-[18px] w-[18px]" />
            </div>
            <div>
              <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>A3MB Medical Billing</div>
              <div className="text-[11px]" style={{ color: "var(--text-secondary)" }}>Enterprise Payroll Platform</div>
            </div>
          </div>

          <div className="relative rounded-2xl p-10" style={{
            background: "var(--surface-base)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)"
          }}>
            <div className="absolute top-0 left-8 right-8 h-[3px] rounded-b-full" style={{ background: "#3d766d" }} />

            <div className="mb-8">
              <h2 className="text-xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>Sign in</h2>
              <p className="text-sm mt-1.5" style={{ color: "var(--text-secondary)" }}>Enter your credentials to access the dashboard.</p>
            </div>

            <Suspense fallback={null}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
