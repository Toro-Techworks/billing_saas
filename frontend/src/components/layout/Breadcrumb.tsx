import { Link } from 'react-router-dom'

type BreadcrumbItem = { label: string; to?: string }

type BreadcrumbProps = {
  items: BreadcrumbItem[]
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-sm text-slate-600">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <span className="text-slate-400">/</span>}
          {item.to ? (
            <Link to={item.to} className="font-medium text-indigo-600 hover:text-indigo-700">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-slate-900">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
