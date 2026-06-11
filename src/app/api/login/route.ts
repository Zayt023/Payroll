import { NextResponse } from "next/server"
import { signIn } from "@/lib/auth"
import { AuthError } from "next-auth"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const callbackUrl = (formData.get("callbackUrl") as string) || "/dashboard"

    await signIn("credentials", { email, password, redirect: false })

    return NextResponse.redirect(new URL(callbackUrl, req.url), 303)
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.redirect(new URL("/login?error=CredentialsSignin", req.url), 303)
    }
    return NextResponse.redirect(new URL("/login?error=Unknown", req.url), 303)
  }
}
