import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { HiOutlinePlus } from 'react-icons/hi2'
import api from '../services/api'
import Button from '../components/Button'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import PageTitle from '../components/layout/PageTitle'
import { useToast } from '../components/ui/Toast'

type Quotation = {
  id: number
  invoice_number: string
  status: string
  total_amount: number
  invoice_date: string
}

type ListResponse = {
  data?: Quotation[]
  meta?: { current_page?: number; last_page?: number; total?: number }
}

function normalizeRows(body: unknown): Quotation[] {
  if (Array.isArray(body)) {
    return body
  }
  const b = body as ListResponse
  return Array.isArray(b?.data) ? b.data : []
}

export default function QuotationsPage() {
  const { showToast } = useToast()
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [loading, setLoading] = useState(true)

  const loadQuotations = () => {
    setLoading(true)
    api
      .get<ListResponse | Quotation[]>('/invoices', {
        params: { status: 'draft', per_page: 200, page: 1 },
      })
      .then((res) => setQuotations(normalizeRows(res.data)))
      .catch(() => {
        setQuotations([])
        showToast('Could not load quotations.')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadQuotations()
  }, [])

  return (
    <>
      <PageTitle
        title="Quotations"
        description="Create and manage quotations"
        action={
          <Link to="/quotations/create">
            <Button className="gap-2">
              <HiOutlinePlus className="h-4 w-4" />
              Create Quotation
            </Button>
          </Link>
        }
      />

      <Card>
        <CardHeader title="Quotations" />
        <CardContent>
          {loading ? (
            <p className="py-6 text-center text-slate-500">Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-600">
                    <th className="py-3 font-medium">Quotation #</th>
                    <th className="py-3 font-medium">Status</th>
                    <th className="py-3 font-medium">Total</th>
                    <th className="py-3 font-medium">Date</th>
                    <th className="py-3 font-medium text-right">PDF</th>
                  </tr>
                </thead>
                <tbody>
                  {quotations.map((q) => (
                    <tr key={q.id} className="border-b border-slate-100">
                      <td className="py-3 text-slate-800">{q.invoice_number}</td>
                      <td className="py-3">
                        <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                          {q.status}
                        </span>
                      </td>
                      <td className="py-3 text-slate-800">₹{Number(q.total_amount ?? 0).toLocaleString()}</td>
                      <td className="py-3 text-slate-600">{String(q.invoice_date ?? '')}</td>
                      <td className="py-3 text-right">
                        <Link
                          to={`/quotations/${q.id}/preview`}
                          state={{ documentNumber: q.invoice_number }}
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                        >
                          Preview &amp; export
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {quotations.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        No quotations found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
