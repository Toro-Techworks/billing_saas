import type { InputHTMLAttributes, ReactNode } from 'react'

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  hint?: ReactNode
}

export default function InputField({
  label,
  error,
  hint,
  id,
  className = '',
  ...props
}: InputFieldProps) {
  const inputId = id ?? label.replace(/\s+/g, '-').toLowerCase()

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-slate-700"
      >
        {label}
      </label>
      <input
        id={inputId}
        className={`
          block w-full rounded-xl border bg-white px-3 py-2.5 text-slate-900 shadow-sm
          placeholder:text-slate-400
          focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:ring-offset-1
          disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500
          ${error ? 'border-red-500 focus:ring-red-500/70' : 'border-slate-200'}
          ${className}
        `}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-sm text-slate-500">
          {hint}
        </p>
      )}
    </div>
  )
}
