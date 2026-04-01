export type DashboardData = {
  total_revenue: number
  today_sales: number
  total_customers: number
  total_invoices?: number
  pending_payments: number
  low_stock_count?: number
  monthly_sales: Array<{ month: string; total: number }>
  monthly_payments?: Array<{ month: string; total: number }>
  recent_invoices: Array<{
    id: number
    invoice_number: string
    status: string
    total_amount: number
    invoice_date?: string
  }>
  recent_payments?: Array<{
    id: number
    invoice_number: string
    amount: number
    payment_method: string | null
    payment_date: string
  }>
  payment_due_alerts?: Array<{
    id: number
    invoice_number: string
    due_date: string
    total_amount: number
    status: string
  }>
  low_stock_items?: Array<unknown>
}

export function formatCurrency(n: number): string {
  return Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function formatDate(s: string | undefined): string {
  if (!s) return '—'
  try {
    return new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return s
  }
}

export const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700',
  sent: 'bg-amber-100 text-amber-800',
  paid: 'bg-emerald-100 text-emerald-800',
  overdue: 'bg-red-100 text-red-800',
}
