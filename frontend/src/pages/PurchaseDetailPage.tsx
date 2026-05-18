import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'
import Breadcrumb from '../components/layout/Breadcrumb'
import PageTitle from '../components/layout/PageTitle'
import Button from '../components/Button'
import { Card, CardContent } from '../components/ui/Card'
import { useToast } from '../components/ui/Toast'

type PurchaseItem = {
  id?: number
  quantity: number
  price: number
  total: number
  product?: { id: number; name: string; sku?: string }
}

type PurchaseApi = {
  id: number
  purchase_number: string
  purchase_date: string
  total_amount: number
  status: string
  supplier?: { id: number; name: string }
  items?: PurchaseItem[]
}

export default function PurchaseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [purchase, setPurchase] = useState<PurchaseApi | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    api
      .get<PurchaseApi>(`/purchases/${id}`)
      .then((r) => setPurchase(r.data))
      .catch(() => {
        showToast('Could not load purchase.')
        setPurchase(null)
      })
      .finally(() => setLoading(false))
  }, [id, showToast])

  const handleDelete = async () => {
    if (!id || !purchase) return
    if (!window.confirm(`Delete purchase "${purchase.purchase_number}"? Stock will be adjusted to reverse intake.`)) return
    setDeleting(true)
    try {
      await api.delete(`/purchases/${id}`)
      showToast('Purchase deleted.')
      navigate('/purchases')
    } catch {
      showToast('Failed to delete purchase.')
    } finally {
      setDeleting(false)
    }
  }

  if (!id) return null

  if (loading || !purchase) {
    return (
      <>
        <Breadcrumb items={[{ label: 'Purchases', to: '/purchases' }, { label: 'Detail' }]} />
        <PageTitle title="Purchase" />
        <Card>
          <CardContent>
            <p className="text-slate-500">{loading ? 'Loading...' : 'Not found.'}</p>
            {!loading && (
              <Button variant="secondary" className="mt-4" onClick={() => navigate('/purchases')}>
                Back
              </Button>
            )}
          </CardContent>
        </Card>
      </>
    )
  }

  return (
    <>
      <Breadcrumb items={[{ label: 'Purchases', to: '/purchases' }, { label: purchase.purchase_number }]} />
      <PageTitle
        title={purchase.purchase_number}
        description="Purchase order details (editing line items is not supported)."
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => navigate('/purchases')}>
              Back
            </Button>
            <Button variant="secondary" onClick={handleDelete} disabled={deleting} className="text-red-600">
              {deleting ? 'Deleting…' : 'Delete'}
            </Button>
          </div>
        }
      />
      <Card>
        <CardContent className="space-y-4">
          <dl className="grid gap-3 sm:grid-cols-2 text-sm">
            <div>
              <dt className="font-medium text-slate-500">Supplier</dt>
              <dd className="text-slate-900">{purchase.supplier?.name ?? '—'}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Date</dt>
              <dd className="text-slate-900">{purchase.purchase_date}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Status</dt>
              <dd className="text-slate-900">{purchase.status}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Total</dt>
              <dd className="text-slate-900">₹{Number(purchase.total_amount).toLocaleString()}</dd>
            </div>
          </dl>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">
                  <th className="px-4 py-2 font-medium text-slate-600">Product</th>
                  <th className="px-4 py-2 font-medium text-slate-600">Qty</th>
                  <th className="px-4 py-2 font-medium text-slate-600">Price</th>
                  <th className="px-4 py-2 font-medium text-slate-600">Line total</th>
                </tr>
              </thead>
              <tbody>
                {(purchase.items ?? []).map((line, i) => (
                  <tr key={line.id ?? i} className="border-b border-slate-100">
                    <td className="px-4 py-2">{line.product?.name ?? '—'}</td>
                    <td className="px-4 py-2">{line.quantity}</td>
                    <td className="px-4 py-2">₹{Number(line.price).toLocaleString()}</td>
                    <td className="px-4 py-2">₹{Number(line.total).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
