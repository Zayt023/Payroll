import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"

const config: NextAuthConfig = {
  providers: [],
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  callbacks: {
    async authorized({ auth }) {
      return !!auth?.user
    },
  },
}

export const { auth } = NextAuth(config)
