import type { SelectHTMLAttributes } from 'react'

type Option = { value: string; label: string }

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  options: Option[]
  error?: string
}

export default function Select({
  label,
  options,
  error,
  id,
  className = '',
  ...props
}: SelectProps) {
  const inputId = id ?? label.replace(/\s+/g, '-').toLowerCase()

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-slate-700"
      >
        {label}
      </label>
      <select
        id={inputId}
        className={`
          block w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm
          focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:ring-offset-1
          disabled:cursor-not-allowed disabled:bg-slate-50
          ${error ? 'border-red-500' : 'border-slate-200'}
          ${className}
        `}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
