"use client"

import { SessionProvider } from "next-auth/react"
import { Toaster } from "sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontSize: "13px",
            borderRadius: "10px",
            padding: "10px 14px",
            border: "1px solid var(--border-default)",
            background: "var(--surface-base)",
          },
        }}
      />
    </SessionProvider>
  )
}
