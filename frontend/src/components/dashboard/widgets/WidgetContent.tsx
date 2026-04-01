import { Link } from 'react-router-dom'
import { Bar, Line } from 'react-chartjs-2'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js'
import {
  HiOutlineBanknotes,
  HiOutlineUserGroup,
  HiOutlineCalendarDays,
  HiOutlineExclamationTriangle,
  HiOutlineCube,
  HiOutlineClock,
} from 'react-icons/hi2'
import type { WidgetType } from '../../../types/dashboard'
import type { DashboardData } from '../../../types/dashboardData'
import { formatCurrency, formatDate, STATUS_COLORS } from '../../../types/dashboardData'
import { Card, CardContent, CardHeader } from '../../ui/Card'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler,
  Tooltip,
  Legend
)

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 600 },
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.06)' }, ticks: { font: { size: 10 } } },
    x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 45 } },
  },
}

type Props = { widgetType: WidgetType; data: DashboardData | null }

export default function WidgetContent({ widgetType, data }: Props) {
  if (!data) {
    return (
      <Card>
        <CardContent className="flex h-full items-center justify-center p-4 text-slate-500">
          Loading...
        </CardContent>
      </Card>
    )
  }

  const monthlyLabels = data.monthly_sales?.map((m) => m.month) ?? []
  const monthlyRevenueData = data.monthly_sales?.map((m) => m.total) ?? []
  const monthlyPaymentsData = monthlyLabels.map((label) => {
    const found = data.monthly_payments?.find((p) => p.month === label)
    return found ? found.total : 0
  })
  const hasPaymentsData = monthlyPaymentsData.some((n) => n > 0)

  switch (widgetType) {
    case 'total_revenue':
      return (
        <Card className="h-full min-h-0 overflow-hidden">
          <CardContent className="flex h-full items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <HiOutlineBanknotes className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500">Total Revenue</p>
              <p className="text-lg font-semibold text-slate-900">
                ₹{formatCurrency(data.total_revenue ?? 0)}
              </p>
            </div>
          </CardContent>
        </Card>
      )
    case 'today_sales':
      return (
        <Card className="h-full min-h-0 overflow-hidden">
          <CardContent className="flex h-full items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <HiOutlineCalendarDays className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500">Today's Sales</p>
              <p className="text-lg font-semibold text-slate-900">
                ₹{formatCurrency(data.today_sales ?? 0)}
              </p>
            </div>
          </CardContent>
        </Card>
      )
    case 'total_customers':
      return (
        <Card className="h-full min-h-0 overflow-hidden">
          <CardContent className="flex h-full items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
              <HiOutlineUserGroup className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500">Total Customers</p>
              <p className="text-lg font-semibold text-slate-900">{data.total_customers ?? '—'}</p>
            </div>
          </CardContent>
        </Card>
      )
    case 'outstanding_payments':
      return (
        <Card className="h-full min-h-0 overflow-hidden">
          <CardContent className="flex h-full items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <HiOutlineExclamationTriangle className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500">Outstanding</p>
              <p className="text-lg font-semibold text-slate-900">
                ₹{formatCurrency(data.pending_payments ?? 0)}
              </p>
            </div>
          </CardContent>
        </Card>
      )
    case 'monthly_revenue': {
      const lineData = {
        labels: monthlyLabels,
        datasets: [
          {
            label: 'Revenue',
            data: monthlyRevenueData,
            borderColor: 'rgb(99, 102, 241)',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            fill: true,
            tension: 0.35,
            pointRadius: 2,
          },
        ],
      }
      return (
        <Card className="flex h-full min-h-0 flex-col overflow-hidden">
          <CardHeader title="Monthly Revenue" />
          <CardContent className="min-h-0 flex-1 overflow-hidden">
            <Line data={lineData} options={chartOptions} />
          </CardContent>
        </Card>
      )
    }
    case 'sales_vs_expenses': {
      const barData = {
        labels: monthlyLabels,
        datasets: [
          { label: 'Sales', data: monthlyRevenueData, backgroundColor: 'rgba(99, 102, 241, 0.8)', borderRadius: 4 },
          ...(hasPaymentsData
            ? [{ label: 'Payments', data: monthlyPaymentsData, backgroundColor: 'rgba(16, 185, 129, 0.8)', borderRadius: 4 }]
            : []),
        ],
      }
      return (
        <Card className="flex h-full min-h-0 flex-col overflow-hidden">
          <CardHeader title="Sales vs Payments" />
          <CardContent className="min-h-0 flex-1 overflow-hidden">
            <Bar
              data={barData}
              options={{ ...chartOptions, plugins: { legend: { display: true, position: 'top' } } }}
            />
          </CardContent>
        </Card>
      )
    }
    case 'recent_invoices':
      return (
        <Card className="flex h-full min-h-0 flex-col overflow-hidden">
          <CardHeader
            title="Recent Invoices"
            action={<Link to="/invoices" className="text-xs font-medium text-indigo-600 hover:text-indigo-500">View all</Link>}
          />
          <CardContent className="min-h-0 flex-1 overflow-auto p-0">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-slate-50">
                <tr>
                  <th className="px-3 py-1.5 text-left text-xs text-slate-500">Invoice</th>
                  <th className="px-3 py-1.5 text-left text-xs text-slate-500">Status</th>
                  <th className="px-3 py-1.5 text-right text-xs text-slate-500">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data.recent_invoices?.length ? data.recent_invoices : []).map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50">
                    <td className="whitespace-nowrap px-3 py-2 font-medium text-slate-900">{inv.invoice_number}</td>
                    <td className="whitespace-nowrap px-3 py-2">
                      <span className={`inline-flex rounded-full px-1.5 py-0.5 text-xs ${STATUS_COLORS[inv.status] ?? 'bg-slate-100 text-slate-700'}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-right text-slate-600">₹{formatCurrency(Number(inv.total_amount))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!data.recent_invoices?.length && (
              <p className="px-3 py-6 text-center text-slate-500">No recent invoices</p>
            )}
          </CardContent>
        </Card>
      )
    case 'recent_payments':
      return (
        <Card className="flex h-full min-h-0 flex-col overflow-hidden">
          <CardHeader
            title="Recent Payments"
            action={<Link to="/payments" className="text-xs font-medium text-indigo-600 hover:text-indigo-500">View all</Link>}
          />
          <CardContent className="min-h-0 flex-1 overflow-auto p-0">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-slate-50">
                <tr>
                  <th className="px-3 py-1.5 text-left text-xs text-slate-500">Invoice</th>
                  <th className="px-3 py-1.5 text-left text-xs text-slate-500">Method</th>
                  <th className="px-3 py-1.5 text-right text-xs text-slate-500">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data.recent_payments?.length ? data.recent_payments : []).map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="whitespace-nowrap px-3 py-2 font-medium text-slate-900">{p.invoice_number}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-slate-600">{p.payment_method ?? '—'}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-right text-slate-600">₹{formatCurrency(p.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!data.recent_payments?.length && (
              <p className="px-3 py-6 text-center text-slate-500">No recent payments</p>
            )}
          </CardContent>
        </Card>
      )
    case 'recent_purchases':
      return (
        <Card className="flex h-full min-h-0 flex-col overflow-hidden">
          <CardHeader
            title="Recent Purchases"
            action={<Link to="/invoices" className="text-xs font-medium text-indigo-600 hover:text-indigo-500">View all</Link>}
          />
          <CardContent className="min-h-0 flex-1 overflow-auto p-0">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-slate-50">
                <tr>
                  <th className="px-3 py-1.5 text-left text-xs text-slate-500">Invoice</th>
                  <th className="px-3 py-1.5 text-left text-xs text-slate-500">Status</th>
                  <th className="px-3 py-1.5 text-right text-xs text-slate-500">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data.recent_invoices?.length ? data.recent_invoices : []).map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50">
                    <td className="whitespace-nowrap px-3 py-2 font-medium text-slate-900">{inv.invoice_number}</td>
                    <td className="whitespace-nowrap px-3 py-2">
                      <span className={`inline-flex rounded-full px-1.5 py-0.5 text-xs ${STATUS_COLORS[inv.status] ?? 'bg-slate-100'}`}>{inv.status}</span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-right text-slate-600">₹{formatCurrency(Number(inv.total_amount))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!data.recent_invoices?.length && <p className="px-3 py-6 text-center text-slate-500">No recent purchases</p>}
          </CardContent>
        </Card>
      )
    case 'low_stock':
      return (
        <Card className="h-full min-h-0 overflow-hidden">
          <CardContent className="flex h-full items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
              <HiOutlineCube className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500">Low Stock Items</p>
              <p className="text-lg font-semibold text-slate-900">{data.low_stock_count ?? 0}</p>
            </div>
          </CardContent>
        </Card>
      )
    case 'payment_due':
      return (
        <Card className="flex h-full min-h-0 flex-col overflow-hidden">
          <CardHeader
            title="Payment Due"
            action={<Link to="/invoices" className="text-xs font-medium text-indigo-600 hover:text-indigo-500">View all</Link>}
          />
          <CardContent className="min-h-0 flex-1 overflow-auto p-0">
            <ul className="divide-y divide-slate-100">
              {(data.payment_due_alerts?.length ? data.payment_due_alerts : []).map((inv) => (
                <li key={inv.id} className="flex items-center justify-between px-4 py-2 hover:bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <HiOutlineClock className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium text-slate-900">{inv.invoice_number}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">₹{formatCurrency(Number(inv.total_amount))}</p>
                    <p className="text-xs text-slate-500">Due {formatDate(inv.due_date)}</p>
                  </div>
                </li>
              ))}
            </ul>
            {!data.payment_due_alerts?.length && (
              <p className="px-4 py-6 text-center text-sm text-slate-500">No payments due soon</p>
            )}
          </CardContent>
        </Card>
      )
    default:
      return (
        <Card className="h-full min-h-0 overflow-hidden">
          <CardContent className="flex h-full items-center justify-center p-4 text-slate-500">Unknown widget</CardContent>
        </Card>
      )
  }
}
