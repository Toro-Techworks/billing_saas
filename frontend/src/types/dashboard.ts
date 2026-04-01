export type WidgetType =
  | 'total_revenue'
  | 'today_sales'
  | 'total_customers'
  | 'outstanding_payments'
  | 'monthly_revenue'
  | 'sales_vs_expenses'
  | 'recent_invoices'
  | 'recent_payments'
  | 'recent_purchases'
  | 'low_stock'
  | 'payment_due'

export type LayoutItem = {
  i: string
  widget_type: WidgetType
  x: number
  y: number
  w: number
  h: number
}

export type DashboardWidgetRecord = {
  id?: number
  widget_type: string
  position_x: number
  position_y: number
  width: number
  height: number
  is_visible?: boolean
}

export const WIDGET_META: Record<
  WidgetType,
  { label: string; category: 'kpi' | 'chart' | 'table' | 'alert'; minW?: number; minH?: number; defaultW: number; defaultH: number }
> = {
  total_revenue: { label: 'Total Revenue', category: 'kpi', defaultW: 2, defaultH: 1, minW: 2, minH: 1 },
  today_sales: { label: "Today's Sales", category: 'kpi', defaultW: 2, defaultH: 1, minW: 2, minH: 1 },
  total_customers: { label: 'Total Customers', category: 'kpi', defaultW: 2, defaultH: 1, minW: 2, minH: 1 },
  outstanding_payments: { label: 'Outstanding Payments', category: 'kpi', defaultW: 2, defaultH: 1, minW: 2, minH: 1 },
  monthly_revenue: { label: 'Monthly Revenue', category: 'chart', defaultW: 4, defaultH: 2, minW: 3, minH: 2 },
  sales_vs_expenses: { label: 'Sales vs Expenses', category: 'chart', defaultW: 4, defaultH: 2, minW: 3, minH: 2 },
  recent_invoices: { label: 'Recent Invoices', category: 'table', defaultW: 4, defaultH: 2, minW: 3, minH: 1 },
  recent_payments: { label: 'Recent Payments', category: 'table', defaultW: 4, defaultH: 2, minW: 3, minH: 1 },
  recent_purchases: { label: 'Recent Purchases', category: 'table', defaultW: 4, defaultH: 2, minW: 3, minH: 1 },
  low_stock: { label: 'Low Stock', category: 'alert', defaultW: 2, defaultH: 1, minW: 2, minH: 1 },
  payment_due: { label: 'Payment Due', category: 'alert', defaultW: 2, defaultH: 1, minW: 2, minH: 1 },
}

export const DEFAULT_LAYOUT: LayoutItem[] = [
  { i: 'total_revenue', widget_type: 'total_revenue', x: 0, y: 0, w: 2, h: 1 },
  { i: 'today_sales', widget_type: 'today_sales', x: 2, y: 0, w: 2, h: 1 },
  { i: 'total_customers', widget_type: 'total_customers', x: 4, y: 0, w: 2, h: 1 },
  { i: 'outstanding_payments', widget_type: 'outstanding_payments', x: 6, y: 0, w: 2, h: 1 },
  { i: 'monthly_revenue', widget_type: 'monthly_revenue', x: 0, y: 1, w: 6, h: 2 },
  { i: 'sales_vs_expenses', widget_type: 'sales_vs_expenses', x: 6, y: 1, w: 6, h: 2 },
  { i: 'recent_invoices', widget_type: 'recent_invoices', x: 0, y: 3, w: 6, h: 2 },
  { i: 'recent_payments', widget_type: 'recent_payments', x: 6, y: 3, w: 6, h: 2 },
  { i: 'payment_due', widget_type: 'payment_due', x: 0, y: 5, w: 4, h: 1 },
  { i: 'low_stock', widget_type: 'low_stock', x: 4, y: 5, w: 4, h: 1 },
]
