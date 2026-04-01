import type { ReactNode } from 'react'

type AuthLayoutProps = {
  title: string
  children: ReactNode
}

export default function AuthLayout({ title, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <img src="/toro-logo-green.png" alt="Toro" className="h-12 w-auto object-contain" />
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-200/50">
          <h1 className="mb-6 text-center text-2xl font-semibold text-slate-900">
            {title}
          </h1>
          {children}
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Billing SaaS. All rights reserved.
        </p>
      </div>
    </div>
  )
}
