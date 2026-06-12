import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (pathname === "/login") return NextResponse.next()
  const token = request.cookies.get("next-auth.session-token")?.value
    || request.cookies.get("__Secure-next-auth.session-token")?.value
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }
  return NextResponse.next()
}

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
