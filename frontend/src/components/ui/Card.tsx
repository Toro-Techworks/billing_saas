import type { ReactNode } from 'react'

type CardProps = {
  children: ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/70 bg-white shadow-sm ${className}`}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  title,
  action,
  className = '',
}: {
  title: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4 ${className}`}
    >
      <h2 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
      {action}
    </div>
  )
}

export function CardContent({ children, className = '' }: CardProps) {
  return <div className={`p-6 ${className}`}>{children}</div>
}
