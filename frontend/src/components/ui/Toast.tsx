import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

type ToastContextValue = {
  showToast: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) return { showToast: () => {} }
  return ctx
}

type ToastProviderProps = {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [message, setMessage] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)

  const showToast = useCallback((msg: string) => {
    setMessage(msg)
    setVisible(true)
    const t = setTimeout(() => setVisible(false), 3400)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!visible && message) {
      const t = setTimeout(() => setMessage(null), 250)
      return () => clearTimeout(t)
    }
  }, [visible, message])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {message && (
        <div
          className={`fixed bottom-6 right-6 z-[100] max-w-[420px] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-xl transition ${
            visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
          }`}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <div className="min-w-0">
              <p className="break-words">{message}</p>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  )
}
