import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { HiOutlinePlus } from 'react-icons/hi2'
import api from '../services/api'
import Button from '../components/Button'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import PageTitle from '../components/layout/PageTitle'
import { useToast } from '../components/ui/Toast'

type Invoice = {
  id: number
  invoice_number: string
  status: string
  total_amount: number
  invoice_date: string
}

type ListResponse = {
  data?: Invoice[]
  meta?: { current_page?: number; last_page?: number; total?: number }
}

function normalizeRows(body: unknown): Invoice[] {
  if (Array.isArray(body)) {
    return body
  }
  const b = body as ListResponse
  return Array.isArray(b?.data) ? b.data : []
}

export default function InvoicesPage() {
  const { showToast } = useToast()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  const loadInvoices = () => {
    setLoading(true)
    api
      .get<ListResponse | Invoice[]>('/invoices', { params: { per_page: 200, page: 1 } })
      .then((res) => setInvoices(normalizeRows(res.data)))
      .catch(() => {
        setInvoices([])
        showToast('Could not load invoices.')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadInvoices()
  }, [])

  return (
    <>
      <PageTitle
        title="Invoices"
        description="View and manage invoices"
        action={
          <Link to="/invoices/create">
            <Button className="gap-2">
              <HiOutlinePlus className="h-4 w-4" />
              Create Invoice
            </Button>
          </Link>
        }
      />
      <Card>
        <CardHeader title="Invoices" />
        <CardContent>
          {loading ? (
            <p className="py-6 text-center text-slate-500">Loading...</p>
          ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-600">
                  <th className="py-3 font-medium">Invoice #</th>
                  <th className="py-3 font-medium">Status</th>
                  <th className="py-3 font-medium">Total</th>
                  <th className="py-3 font-medium">Date</th>
                  <th className="py-3 font-medium text-right">PDF</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-slate-100">
                    <td className="py-3 text-slate-800">{invoice.invoice_number}</td>
                    <td className="py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                        invoice.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                        invoice.status === 'overdue' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-800">₹{invoice.total_amount?.toLocaleString()}</td>
                    <td className="py-3 text-slate-600">{invoice.invoice_date}</td>
                    <td className="py-3 text-right">
                      <Link
                        to={`/invoices/${invoice.id}/preview`}
                        state={{ documentNumber: invoice.invoice_number }}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        Preview &amp; export
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
