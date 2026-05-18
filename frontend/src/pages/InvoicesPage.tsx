import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi2'
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
  const b = body as ListResponse & { data?: unknown }
  if (Array.isArray(b?.data)) {
    return b.data as Invoice[]
  }
  return []
}

export default function InvoicesPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  const loadInvoices = () => {
    setLoading(true)
    api
      .get<ListResponse | Invoice[]>('/invoices', { params: { per_page: 200, page: 1 } })
      .then((res) => {
        const rows = normalizeRows(res.data).filter((i) => String(i.status).toLowerCase() !== 'draft')
        setInvoices(rows)
      })
      .catch((err) => {
        setInvoices([])
        if (import.meta.env.DEV) {
          console.error('[InvoicesPage]', err)
        }
        showToast('Could not load invoices.')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadInvoices()
  }, [])

  const handleDelete = async (inv: Invoice, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!window.confirm(`Delete invoice "${inv.invoice_number}"? This cannot be undone.`)) return
    try {
      await api.delete(`/invoices/${inv.id}`)
      showToast('Invoice deleted.')
      loadInvoices()
    } catch {
      showToast('Failed to delete invoice.')
    }
  }

  return (
    <>
      <PageTitle
        title="Invoices"
        description="Bill the client after work is done. Send or export these documents; estimates and drafts stay under Quotations."
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
                    <th className="py-3 w-24 text-right font-medium">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(`/invoices/${invoice.id}/edit`)}
                      onKeyDown={(ev) => {
                        if (ev.key === 'Enter') navigate(`/invoices/${invoice.id}/edit`)
                      }}
                      className="cursor-pointer border-b border-slate-100 hover:bg-slate-50/80"
                    >
                      <td className="py-3 text-slate-800">{invoice.invoice_number}</td>
                      <td className="py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            invoice.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-700'
                              : invoice.status === 'sent'
                                ? 'bg-blue-100 text-blue-700'
                                : invoice.status === 'overdue'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-slate-100 text-slate-600'
                          }`}
                        >
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
                          onClick={(e) => e.stopPropagation()}
                        >
                          Preview &amp; export
                        </Link>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => handleDelete(invoice, e)}
                          className="inline-flex rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          aria-label="Delete invoice"
                        >
                          <HiOutlineTrash className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!invoices.length && !loading && (
                <p className="max-w-xl mx-auto py-8 text-center text-sm text-slate-500">
                  No invoices here yet. Draft estimates live under{' '}
                  <Link to="/quotations" className="font-medium text-indigo-600 hover:text-indigo-700">
                    Quotations
                  </Link>
                  . Create an invoice when ready to bill after the work is done (new invoices are saved as sent so they
                  appear in this list).
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
