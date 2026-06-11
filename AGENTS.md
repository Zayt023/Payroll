# Payroll System - Payslip Generator

## Tech Stack
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Prisma ORM (PostgreSQL)
- NextAuth v5 (Auth.js)
- ExcelJS (Excel parsing)
- pdf-lib (PDF generation)
- Framer Motion (animations)
- Recharts (charts)

## Build Commands
```bash
npm install          # Install dependencies + generate Prisma client
npx prisma db push   # Push schema to database
npx prisma db seed   # Seed admin/HR users
npm run dev          # Start dev server
npm run build        # Production build
```

## Environment Variables (Required)
- `DATABASE_URL` - PostgreSQL connection string
- `AUTH_SECRET` - NextAuth secret key
- `AUTH_URL` - App URL (e.g., http://localhost:3000)

## Demo Credentials
- Admin: admin@company.com / admin123
- HR: hr@company.com / hr123

## Vercel Deployment
1. Set `DATABASE_URL` (Neon/Supabase/Vercel Postgres)
2. Set `AUTH_SECRET`
3. Set `AUTH_URL`
4. Build command auto-runs `prisma generate`

## Project Structure
```
src/
├── app/
│   ├── (auth)/login/       # Login page
│   ├── dashboard/          # Admin dashboard
│   ├── employees/          # Employee management
│   ├── upload/             # Excel upload
│   ├── payroll/            # Payroll batches
│   ├── payslips/           # Generated payslips
│   ├── audit-logs/         # Activity logs
│   └── settings/           # System settings
├── components/
│   ├── ui/                 # UI primitives
│   └── layout/             # Sidebar, Navbar
└── lib/
    ├── auth.ts             # NextAuth config
    ├── prisma.ts           # Database client
    ├── excel/parser.ts     # Excel processing
    ├── payroll/calculator.ts # Payroll computation
    └── pdf/generator.ts    # PDF payslip generation
```
