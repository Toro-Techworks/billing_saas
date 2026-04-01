import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { getLayout, layoutFromRecords, saveLayout } from '../services/dashboardWidgetsService'
import type { DashboardData } from '../types/dashboardData'

const EMPTY_DASHBOARD_DATA: DashboardData = {
  total_revenue: 0,
  today_sales: 0,
  total_customers: 0,
  pending_payments: 0,
  monthly_sales: [],
  recent_invoices: [],
}
import {
  DEFAULT_LAYOUT,
  WIDGET_META,
  type LayoutItem,
  type WidgetType,
} from '../types/dashboard'
import PageTitle from '../components/layout/PageTitle'
import DashboardGrid from '../components/dashboard/DashboardGrid'
import AddWidgetModal from '../components/dashboard/AddWidgetModal'
import { HiOutlinePlus } from 'react-icons/hi2'

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [layout, setLayout] = useState<LayoutItem[]>([])
  const [loading, setLoading] = useState(true)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const hasLayoutBeenSet = useRef(false)

  // Load dashboard data and widget layout (use allSettled so one failure doesn't clear the other)
  useEffect(() => {
    let cancelled = false
    Promise.allSettled([
      api.get('/dashboard').then((r) => r.data as DashboardData | { data?: DashboardData }),
      getLayout(),
    ]).then(([dashboardResult, layoutResult]) => {
      if (cancelled) return
      // Dashboard: support both raw payload and wrapped { data: payload }
      if (dashboardResult.status === 'fulfilled' && dashboardResult.value != null) {
        const raw = dashboardResult.value as Record<string, unknown>
        const payload =
          raw && typeof raw.data === 'object' && raw.data != null
            ? (raw.data as DashboardData)
            : (raw as DashboardData)
        setData(payload)
      } else {
        setData(EMPTY_DASHBOARD_DATA)
      }
      // Layout
      if (layoutResult.status === 'fulfilled' && Array.isArray(layoutResult.value)) {
        const fromApi = layoutFromRecords(layoutResult.value)
        if (fromApi.length > 0) {
          setLayout(fromApi)
        } else {
          setLayout(DEFAULT_LAYOUT)
          saveLayout(DEFAULT_LAYOUT).catch(() => {})
        }
      } else {
        setLayout(DEFAULT_LAYOUT)
      }
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Debounced save when layout changes (skip first set from load)
  useEffect(() => {
    if (!hasLayoutBeenSet.current) {
      hasLayoutBeenSet.current = true
      return
    }
    const t = setTimeout(() => {
      saveLayout(layout).catch(() => {})
    }, 600)
    return () => clearTimeout(t)
  }, [layout])

  const handleLayoutChange = (next: LayoutItem[]) => setLayout(next)

  const handleRemove = (id: string) => {
    setLayout((prev) => prev.filter((item) => item.i !== id))
  }

  const handleAddWidget = (widgetType: WidgetType) => {
    const meta = WIDGET_META[widgetType]
    const maxY =
      layout.length > 0 ? Math.max(...layout.map((i) => i.y + i.h)) : 0
    setLayout((prev) => [
      ...prev,
      {
        i: `${widgetType}_${Date.now()}`,
        widget_type: widgetType,
        x: 0,
        y: maxY,
        w: meta.defaultW,
        h: meta.defaultH,
      },
    ])
  }

  const existingTypes = Array.from(new Set(layout.map((l) => l.widget_type)))

  if (loading) {
    return (
      <div className="space-y-6">
        <PageTitle title="Dashboard" description="Overview of your billing and revenue" />
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageTitle
        title="Dashboard"
        description="Overview of your billing and revenue"
      />

      {/* Quick Actions */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <Link
          to="/invoices/create"
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
        >
          Create Invoice
        </Link>
        <Link
          to="/customers"
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
        >
          Add Customer
        </Link>
        <Link
          to="/products"
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
        >
          Add Product
        </Link>
        <Link
          to="/payments"
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
        >
          Record Payment
        </Link>
        <button
          type="button"
          onClick={() => setAddModalOpen(true)}
          className="ml-auto flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100"
        >
          <HiOutlinePlus className="h-4 w-4" />
          Add widget
        </button>
      </div>

      {/* Customizable widget grid */}
      <DashboardGrid
        layout={layout}
        data={data}
        onLayoutChange={handleLayoutChange}
        onRemove={handleRemove}
      />

      <AddWidgetModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        existingTypes={existingTypes}
        onAdd={handleAddWidget}
      />
    </div>
  )
}
