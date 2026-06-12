"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Eye, EyeOff, Loader2, Building2, Info } from "lucide-react"
import { signIn } from "next-auth/react"
import { toast } from "sonner"

function LoginForm() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("admin@company.com")
  const [password, setPassword] = useState("admin123")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (searchParams.get("error") === "CredentialsSignin") toast.error("Invalid credentials")
    else if (searchParams.get("error")) toast.error("Login failed")
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await signIn("credentials", { email, password, callbackUrl: "/dashboard" })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-group">
        <label htmlFor="email">Work Email</label>
        <input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="name@company.com" required autoComplete="email" className="input" />
      </div>

      <div className="form-group">
        <div className="flex justify-between items-center">
          <label htmlFor="password">Password</label>
          <button type="button" className="text-xs font-medium" style={{ color: "#3d766d" }}>Forgot password?</button>
        </div>
        <div className="relative">
          <input id="password" name="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••" required autoComplete="current-password" className="input pr-10" />
          <button type="button" onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full justify-center text-sm">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Sign in
      </button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex flex-col w-[42%] p-12 surface-base border-r border-default">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md" style={{ background: "#3d766d", color: "#fff" }}>
            <Building2 className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold text-primary">A3MB Medical Billing</span>
        </div>
        <div className="flex-1 flex flex-col justify-center max-w-sm">
          <h1 className="text-2xl font-bold text-primary tracking-tight leading-tight">
            Enterprise Payroll<br />Management Platform
          </h1>
          <p className="text-sm text-secondary mt-3 leading-relaxed">
            High-precision financial automation for modern enterprise workflows.
          </p>
          <div className="mt-10 space-y-3">
            <div className="flex items-center gap-3 text-sm text-secondary">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#3d766d" }} />
              SOC2 Compliant &amp; Enterprise Grade
            </div>
            <div className="flex items-center gap-3 text-sm text-secondary">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#3d766d" }} />
              Full Audit Trail with Immutable Records
            </div>
            <div className="flex items-center gap-3 text-sm text-secondary">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#3d766d" }} />
              Automated PH Government Deductions
            </div>
          </div>
        </div>
        <p className="text-xs text-muted">&copy; 2026 A3MB Medical Billing Services</p>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12">
        <div className="w-full max-w-sm space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-primary tracking-tight">Sign in</h2>
            <p className="text-sm text-secondary mt-1">Access your payroll dashboard.</p>
          </div>

          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>

          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-default" /></div>
            <div className="relative flex justify-center"><span className="px-3 text-[10px] uppercase tracking-widest text-muted">Demo Credentials</span></div>
          </div>

          <div className="section-card p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl surface-raised flex items-center justify-center shrink-0">
                <Info className="h-4 w-4 text-secondary" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-semibold text-primary">Demo Environment</h4>
                <p className="text-xs text-muted mt-1">Use these credentials:</p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="surface-raised p-2 rounded-lg border border-default">
                    <p className="text-[9px] text-muted uppercase font-medium">Email</p>
                    <p className="text-xs font-mono text-primary mt-0.5">admin@company.com</p>
                  </div>
                  <div className="surface-raised p-2 rounded-lg border border-default">
                    <p className="text-[9px] text-muted uppercase font-medium">Password</p>
                    <p className="text-xs font-mono text-primary mt-0.5">admin123</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
