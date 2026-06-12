import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const SESSION_COOKIE = "__Secure-authjs.session-token"
const SESSION_COOKIE_HTTP = "authjs.session-token"

export function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value
    || request.cookies.get(SESSION_COOKIE_HTTP)?.value

  if (!token) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|login).*)",
  ],
}
