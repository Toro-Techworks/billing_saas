import type { ReactNode } from 'react'

type PageTitleProps = {
  title: string
  description?: string
  action?: ReactNode
}

export default function PageTitle({ title, description, action }: PageTitleProps) {
  return (
    <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        )}
      </div>
      {action && <div className="mt-2 sm:mt-0">{action}</div>}
    </div>
  )
}
