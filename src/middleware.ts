export { auth as middleware } from "@/lib/auth-middleware"

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/employees/:path*",
    "/payroll/:path*",
    "/payslips/:path*",
    "/audit-logs/:path*",
    "/settings/:path*",
    "/timesheet/:path*",
    "/practice/:path*",
  ],
}
