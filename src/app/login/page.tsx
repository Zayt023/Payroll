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
      <div className="hidden lg:flex flex-col relative w-[42%] p-12 overflow-hidden" style={{ background: "linear-gradient(180deg, var(--surface-base) 0%, #f4f8f7 100%)" }}>
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(circle at 20px 20px, var(--border-subtle) 1px, transparent 0)",
          backgroundSize: "40px 40px"
        }} />
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full opacity-[0.06]" style={{ background: "#3d766d", filter: "blur(60px)" }} />
        <div className="absolute bottom-20 right-10 w-48 h-48 rounded-full opacity-[0.05]" style={{ background: "#3d766d", filter: "blur(50px)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.03]" style={{ background: "#3d766d", filter: "blur(80px)" }} />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md" style={{ background: "#3d766d", color: "#fff" }}>
            <Building2 className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>A3MB Medical Billing</span>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center max-w-sm">
          <div className="mb-8">
            <div className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#3d766d" }}>Platform Overview</div>
            <h1 className="text-2xl font-bold tracking-tight leading-tight" style={{ color: "var(--text-primary)" }}>
              Enterprise Payroll<br />Management Platform
            </h1>
          </div>

          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0 mt-0.5" style={{ background: "rgba(61,118,109,0.1)" }}>
                <svg className="h-4 w-4" style={{ color: "#3d766d" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <div>
                <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>SOC2 Compliant</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Enterprise-grade security &amp; data protection</div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0 mt-0.5" style={{ background: "rgba(61,118,109,0.1)" }}>
                <svg className="h-4 w-4" style={{ color: "#3d766d" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
              </div>
              <div>
                <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Full Audit Trail</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Immutable records with complete traceability</div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0 mt-0.5" style={{ background: "rgba(61,118,109,0.1)" }}>
                <svg className="h-4 w-4" style={{ color: "#3d766d" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>PH Deductions Engine</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Automated SSS, PhilHealth, Pag-IBIG &amp; tax</div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
          <span>&copy; 2026 A3MB Medical Billing Services</span>
          <span className="w-1 h-1 rounded-full" style={{ background: "var(--border-default)" }} />
          <span>v1.0</span>
        </div>
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
