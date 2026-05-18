import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'
import Breadcrumb from '../components/layout/Breadcrumb'
import PageTitle from '../components/layout/PageTitle'
import Button from '../components/Button'
import { Card, CardContent } from '../components/ui/Card'
import { useToast } from '../components/ui/Toast'
import CustomerForm, { type CustomerFormValues } from '../components/forms/CustomerForm'

type CustomerApi = {
  id: number
  name: string
  company_name?: string | null
  email: string
  phone: string | null
  billing_address?: string | null
  gst_number: string | null
  credit_limit?: number | string | null
  notes?: string | null
}

export default function CustomerEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [customer, setCustomer] = useState<CustomerApi | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    api
      .get<CustomerApi>(`/customers/${id}`)
      .then((r) => setCustomer(r.data))
      .catch(() => {
        showToast('Could not load customer.')
        setCustomer(null)
      })
      .finally(() => setLoading(false))
  }, [id, showToast])

  const onSubmit = async (values: CustomerFormValues) => {
    if (!id) return
    setSaving(true)
    try {
      await api.put(`/customers/${id}`, {
        name: values.name,
        company_name: values.company_name || null,
        email: values.email,
        phone: values.phone || null,
        billing_address: values.billing_address || null,
        gst_number: values.gst_number || null,
        credit_limit: values.credit_limit ? Number(values.credit_limit) : null,
        notes: values.notes || null,
      })
      showToast('Customer updated successfully.')
      navigate('/customers')
    } catch {
      showToast('Failed to save customer.')
    } finally {
      setSaving(false)
    }
  }

  if (!id) return null

  if (loading || !customer) {
    return (
      <>
        <Breadcrumb items={[{ label: 'Customers', to: '/customers' }, { label: 'Edit' }]} />
        <PageTitle title="Edit Customer" />
        <Card>
          <CardContent>
            <p className="text-slate-500">{loading ? 'Loading...' : 'Customer not found.'}</p>
            {!loading && (
              <Button variant="secondary" className="mt-4" onClick={() => navigate('/customers')}>
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
      <Breadcrumb items={[{ label: 'Customers', to: '/customers' }, { label: customer.name }]} />
      <PageTitle title="Edit Customer" description="Update customer details." />
      <Card>
        <CardContent>
          <CustomerForm
            key={customer.id}
            defaultValues={{
              name: customer.name,
              company_name: customer.company_name ?? '',
              email: customer.email,
              phone: customer.phone ?? '',
              billing_address: customer.billing_address ?? '',
              gst_number: customer.gst_number ?? '',
              credit_limit:
                customer.credit_limit != null && customer.credit_limit !== '' ? String(customer.credit_limit) : '',
              notes: customer.notes ?? '',
            }}
            onSubmit={onSubmit}
            onCancel={() => navigate('/customers')}
            saving={saving}
            submitLabel="Update Customer"
          />
        </CardContent>
      </Card>
    </>
  )
}
