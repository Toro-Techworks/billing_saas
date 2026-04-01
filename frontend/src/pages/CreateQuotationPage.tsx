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

export default function CreateQuotationPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get<{ data?: Customer[] }>('/customers').then((r) => r.data?.data ?? []),
      api.get<{ data?: Product[] }>('/products').then((r) => r.data?.data ?? []),
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
  }) => {
    setSaving(true)
    try {
      await api.post('/invoices', { ...payload, status: 'draft' })
      showToast('Quotation created successfully.')
      navigate('/quotations')
    } catch {
      showToast('Failed to create quotation.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <Breadcrumb items={[{ label: 'Quotations', to: '/quotations' }, { label: 'Create Quotation' }]} />
        <PageTitle title="Create Quotation" description="Add a new quotation with line items." />
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
      <Breadcrumb items={[{ label: 'Quotations', to: '/quotations' }, { label: 'Create Quotation' }]} />
      <PageTitle title="Create Quotation" description="Add customer, dates, and line items." />
      <Card>
        <CardContent>
          <InvoiceForm
            customers={customers}
            products={products}
            onSubmit={onSubmit}
            onCancel={() => navigate('/quotations')}
            saving={saving}
            submitLabel="Save Quotation"
          />
        </CardContent>
      </Card>
    </>
  )
}

