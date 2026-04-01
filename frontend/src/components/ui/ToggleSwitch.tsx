import type { InputHTMLAttributes } from 'react'

type ToggleSwitchProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
}

export default function ToggleSwitch({ label, id, ...props }: ToggleSwitchProps) {
  const inputId = id ?? `toggle-${label.replace(/\s+/g, '-').toLowerCase()}`

  return (
    <label
      htmlFor={inputId}
      className="flex cursor-pointer items-center justify-between gap-4 py-2"
    >
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <span className="relative inline-flex h-6 w-11 flex-shrink-0 rounded-full focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2">
        <input id={inputId} type="checkbox" className="peer sr-only" {...props} />
        <span className="absolute inset-0 rounded-full bg-slate-200 transition-colors duration-200 peer-checked:bg-indigo-600" />
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 peer-checked:translate-x-5" />
      </span>
    </label>
  )
}
