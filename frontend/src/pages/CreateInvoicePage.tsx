import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Breadcrumb from '../components/layout/Breadcrumb'
import PageTitle from '../components/layout/PageTitle'
import { Card, CardContent } from '../components/ui/Card'
import { useToast } from '../components/ui/Toast'
import InvoiceForm from '../components/forms/InvoiceForm'

type Customer = { id: number; name: string; email: string }
type Product = { id: number; name: string; price: number; tax_rate: number }

export default function CreateInvoicePage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([
      api
        .get<{ data?: Customer[] }>('/customers', { params: { per_page: 500, page: 1 } })
        .then((r) => r.data?.data ?? []),
      api
        .get<{ data?: Product[] }>('/products', { params: { per_page: 500, page: 1 } })
        .then((r) => r.data?.data ?? []),
    ])
      .then(([c, p]) => {
        setCustomers(c)
        setProducts(p)
      })
      .finally(() => setLoading(false))
  }, [])

  const onSubmit = async (payload: {
    customer_id: number
    invoice_date: string
    due_date: string
    items: { product_id: number; quantity: number; price: number; tax_rate: number }[]
    discount_amount?: number
  }) => {
    setSaving(true)
    try {
      await api.post('/invoices', { ...payload, status: 'sent' })
      showToast('Invoice created successfully.')
      navigate('/invoices')
    } catch {
      showToast('Failed to create invoice.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <Breadcrumb items={[{ label: 'Invoices', to: '/invoices' }, { label: 'Create Invoice' }]} />
        <PageTitle
          title="Create Invoice"
          description="Create an invoice to bill your customer after work is done. For pricing before work, use a quotation first."
        />
        <Card>
          <CardContent>
            <p className="text-slate-500">Loading...</p>
          </CardContent>
        </Card>
      </>
    )
  }

  return (
    <>
      <Breadcrumb items={[{ label: 'Invoices', to: '/invoices' }, { label: 'Create Invoice' }]} />
      <PageTitle
        title="Create Invoice"
        description="Bill for completed work—send or export to the customer when ready. Estimates belong under Quotations."
      />
      <Card>
        <CardContent>
          <InvoiceForm
            customers={customers}
            products={products}
            onSubmit={onSubmit}
            onCancel={() => navigate('/invoices')}
            saving={saving}
            submitLabel="Save Invoice"
          />
        </CardContent>
      </Card>
    </>
  )
}
