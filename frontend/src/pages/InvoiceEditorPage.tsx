import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'
import Breadcrumb from '../components/layout/Breadcrumb'
import PageTitle from '../components/layout/PageTitle'
import { Card, CardContent } from '../components/ui/Card'
import { useToast } from '../components/ui/Toast'
import InvoiceForm, { type InvoiceFormSnapshot, type InvoiceLineItem } from '../components/forms/InvoiceForm'

type Customer = { id: number; name: string; email: string }
type Product = { id: number; name: string; price: number; tax_rate: number }

type InvoiceItemApi = {
  product_id?: number | null
  quantity: number
  price: number
  tax?: number | string | null
}

type InvoiceApi = {
  id: number
  status: string
  invoice_date: string
  due_date: string
  discount_amount?: number | string | null
  customer?: { id: number; name: string; email?: string }
  items?: InvoiceItemApi[]
}

type Props = {
  mode: 'invoice' | 'quotation'
}

function buildSnapshot(invoice: InvoiceApi): InvoiceFormSnapshot {
  const items: InvoiceLineItem[] = (invoice.items ?? []).map((item) => {
    const qty = Number(item.quantity) || 1
    const price = Number(item.price) || 0
    const taxVal = Number(item.tax ?? 0)
    const lineSubtotal = qty * price
    const taxRate = lineSubtotal > 0 && taxVal > 0 ? (taxVal / lineSubtotal) * 100 : 0
    const roundedRate = Math.round(taxRate * 10000) / 10000
    return {
      product_id: item.product_id != null ? String(item.product_id) : '',
      quantity: String(qty),
      unit_price: String(price),
      tax_rate: String(roundedRate),
    }
  })
  const disc = invoice.discount_amount
  return {
    customer_id: invoice.customer?.id != null ? String(invoice.customer.id) : '',
    invoice_date: String(invoice.invoice_date).slice(0, 10),
    due_date: String(invoice.due_date).slice(0, 10),
    items: items.length > 0 ? items : [],
    discount_amount: disc != null && disc !== '' ? String(disc) : '0',
  }
}

export default function InvoiceEditorPage({ mode }: Props) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [invoice, setInvoice] = useState<InvoiceApi | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const listPath = mode === 'quotation' ? '/quotations' : '/invoices'
  const title = mode === 'quotation' ? 'Edit Quotation' : 'Edit Invoice'

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      api.get<{ data?: Customer[] }>('/customers', { params: { per_page: 500 } }).then((r) => r.data?.data ?? []),
      api.get<{ data?: Product[] }>('/products', { params: { per_page: 500 } }).then((r) => r.data?.data ?? []),
      api.get<InvoiceApi>(`/invoices/${id}`).then((r) => r.data),
    ])
      .then(([c, p, inv]) => {
        setCustomers(c)
        setProducts(p)
        setInvoice(inv && typeof inv === 'object' && 'id' in inv ? inv : null)
      })
      .catch(() => {
        showToast('Could not load document.')
        setInvoice(null)
      })
      .finally(() => setLoading(false))
  }, [id, showToast])

  const initialSnapshot = useMemo(() => (invoice ? buildSnapshot(invoice) : null), [invoice])

  const onSubmit = async (payload: {
    customer_id: number
    invoice_date: string
    due_date: string
    items: { product_id: number; quantity: number; price: number; tax_rate: number }[]
    discount_amount?: number
  }) => {
    if (!id) return
    setSaving(true)
    try {
      const status = mode === 'quotation' ? 'draft' : invoice?.status ?? 'draft'
      await api.put(`/invoices/${id}`, { ...payload, status })
      showToast(mode === 'quotation' ? 'Quotation updated.' : 'Invoice updated.')
      navigate(listPath)
    } catch {
      showToast('Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  if (!id) {
    return null
  }

  if (loading || !invoice || !initialSnapshot) {
    return (
      <>
        <Breadcrumb items={[{ label: mode === 'quotation' ? 'Quotations' : 'Invoices', to: listPath }, { label: title }]} />
        <PageTitle title={title} description="Loading…" />
        <Card>
          <CardContent>
            <p className="text-slate-500">Loading...</p>
          </CardContent>
        </Card>
      </>
    )
  }

  if (mode === 'quotation' && invoice.status !== 'draft') {
    return (
      <>
        <Breadcrumb items={[{ label: 'Quotations', to: listPath }, { label: title }]} />
        <PageTitle title={title} description="This record is not a draft quotation." />
        <Card>
          <CardContent>
            <button type="button" className="text-indigo-600" onClick={() => navigate(listPath)}>
              Back to list
            </button>
          </CardContent>
        </Card>
      </>
    )
  }

  if (mode === 'invoice' && invoice.status === 'draft') {
    return (
      <>
        <Breadcrumb items={[{ label: 'Invoices', to: listPath }, { label: title }]} />
        <PageTitle title={title} description="Draft documents are managed under Quotations." />
        <Card>
          <CardContent>
            <button type="button" className="text-indigo-600" onClick={() => navigate('/quotations')}>
              Open Quotations
            </button>
          </CardContent>
        </Card>
      </>
    )
  }

  return (
    <>
      <Breadcrumb items={[{ label: mode === 'quotation' ? 'Quotations' : 'Invoices', to: listPath }, { label: title }]} />
      <PageTitle
        title={title}
        description={
          mode === 'quotation'
            ? 'Update this estimate or proposal before work begins.'
            : 'Update billing details for work that has been or is being invoiced.'
        }
      />
      <Card>
        <CardContent>
          <InvoiceForm
            key={invoice.id}
            customers={customers}
            products={products}
            quotationMode={mode === 'quotation'}
            initialSnapshot={initialSnapshot}
            onSubmit={onSubmit}
            onCancel={() => navigate(listPath)}
            saving={saving}
            submitLabel={mode === 'quotation' ? 'Update Quotation' : 'Update Invoice'}
          />
        </CardContent>
      </Card>
    </>
  )
}
