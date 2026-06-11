import type { Metadata } from "next"
import "./globals.css"
import { Providers } from "@/components/layout/providers"

export const metadata: Metadata = {
  title: "A3MB Medical Billing Services — Enterprise Payroll Management",
  description: "Professional payroll management and payslip generation system",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
