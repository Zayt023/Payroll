"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Eye, EyeOff, Loader2, Building2, ShieldCheck, FileText, Calculator } from "lucide-react"
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
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-xs font-medium tracking-wide uppercase" style={{ color: "var(--text-secondary)" }}>Work Email</label>
        <input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="name@company.com" required autoComplete="email" className="input h-11" />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-xs font-medium tracking-wide uppercase" style={{ color: "var(--text-secondary)" }}>Password</label>
        <div className="relative">
          <input id="password" name="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" required autoComplete="current-password" className="input h-11 pr-10" />
          <button type="button" onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}>
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <button type="submit" disabled={loading}
        className="btn btn-primary btn-lg w-full justify-center text-sm h-11 rounded-xl"
        style={{ background: "#3d766d" }}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Sign in
      </button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex flex-col relative w-[45%] items-center justify-center p-12 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #f0f3f5 0%, #eaf3f1 50%, #f0f3f5 100%)" }}>
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: "radial-gradient(circle at 25% 25%, #3d766d 1px, transparent 1px), radial-gradient(circle at 75% 75%, #3d766d 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }} />
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-[0.08]" style={{ background: "#3d766d", transform: "translate(-30%, -30%)", filter: "blur(80px)" }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-[0.08]" style={{ background: "#3d766d", transform: "translate(30%, 30%)", filter: "blur(80px)" }} />

        <div className="relative z-10 max-w-md">
          <div className="flex items-center gap-3 mb-12">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "#3d766d", color: "#fff" }}>
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>A3MB Medical Billing</div>
              <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>Enterprise Payroll Platform</div>
            </div>
          </div>

          <h1 className="text-3xl font-bold tracking-tight leading-tight" style={{ color: "var(--text-primary)" }}>
            Welcome back
          </h1>
          <p className="text-sm mt-3 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Sign in to access your payroll dashboard, manage employee records, process payroll, and generate payslips.
          </p>

          <div className="mt-12 space-y-5">
            <div className="flex items-center gap-3 text-sm" style={{ color: "var(--text-secondary)" }}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "rgba(61,118,109,0.12)" }}>
                <ShieldCheck className="h-4 w-4" style={{ color: "#3d766d" }} />
              </div>
              <span>Tier-1 enterprise security &amp; compliance</span>
            </div>
            <div className="flex items-center gap-3 text-sm" style={{ color: "var(--text-secondary)" }}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "rgba(61,118,109,0.12)" }}>
                <FileText className="h-4 w-4" style={{ color: "#3d766d" }} />
              </div>
              <span>Complete PH government deductions engine</span>
            </div>
            <div className="flex items-center gap-3 text-sm" style={{ color: "var(--text-secondary)" }}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "rgba(61,118,109,0.12)" }}>
                <Calculator className="h-4 w-4" style={{ color: "#3d766d" }} />
              </div>
              <span>Automated payroll computation &amp; reporting</span>
            </div>
          </div>

          <p className="text-xs mt-16" style={{ color: "var(--text-muted)" }}>&copy; 2026 A3MB Medical Billing Services</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12" style={{ background: "var(--surface-base)" }}>
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: "#3d766d", color: "#fff" }}>
              <Building2 className="h-[18px] w-[18px]" />
            </div>
            <div>
              <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>A3MB Medical Billing</div>
              <div className="text-[11px]" style={{ color: "var(--text-secondary)" }}>Enterprise Payroll</div>
            </div>
          </div>

          <div className="rounded-2xl border p-8" style={{ borderColor: "var(--border-default)", background: "var(--surface-base)" }}>
            <div className="mb-8">
              <h2 className="text-xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>Sign in</h2>
              <p className="text-sm mt-1.5" style={{ color: "var(--text-secondary)" }}>Enter your credentials to continue.</p>
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
