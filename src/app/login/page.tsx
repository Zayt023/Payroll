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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-group">
        <label htmlFor="email">Work Email</label>
        <input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="name@company.com" required autoComplete="email" className="input" />
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <div className="relative">
          <input id="password" name="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" required autoComplete="current-password" className="input pr-10" />
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
        </div>
      </div>
    </div>
  )
}
