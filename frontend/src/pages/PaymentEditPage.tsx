import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'
import Breadcrumb from '../components/layout/Breadcrumb'
import PageTitle from '../components/layout/PageTitle'
import Button from '../components/Button'
import { Card, CardContent } from '../components/ui/Card'
import { useToast } from '../components/ui/Toast'
import PaymentForm, { type PaymentFormValues } from '../components/forms/PaymentForm'

type InvoiceOption = { id: number; invoice_number: string; total_amount?: number }

type PaymentApi = {
  id: number
  type?: string
  invoice_id: number | null
  amount: number | string
  payment_method: string | null
  transaction_reference?: string | null
  payment_date: string
}

export default function PaymentEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [payment, setPayment] = useState<PaymentApi | null>(null)
  const [invoices, setInvoices] = useState<InvoiceOption[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      api.get<PaymentApi>(`/payments/${id}`).then((r) => r.data),
      api
        .get<{ data?: InvoiceOption[] }>('/invoices', { params: { per_page: 200 } })
        .then((r) => r.data?.data ?? []),
    ])
      .then(([pay, inv]) => {
        setPayment(pay)
        setInvoices(inv)
      })
      .catch(() => {
        showToast('Could not load payment.')
        setPayment(null)
      })
      .finally(() => setLoading(false))
  }, [id, showToast])

  const defaultOverride = useMemo((): Partial<PaymentFormValues> | undefined => {
    if (!payment) return undefined
    const dateStr = String(payment.payment_date).slice(0, 10)
    return {
      invoice_id: payment.invoice_id != null ? String(payment.invoice_id) : '',
      amount: String(payment.amount ?? ''),
      payment_method: payment.payment_method || 'bank_transfer',
      transaction_reference: payment.transaction_reference ?? '',
      payment_date: dateStr,
    }
  }, [payment])

  const onSubmit = async (values: PaymentFormValues) => {
    if (!id || !payment) return
    setSaving(true)
    try {
      await api.put(`/payments/${id}`, {
        type: payment.type ?? 'customer_payment',
        invoice_id: Number(values.invoice_id),
        amount: parseFloat(values.amount),
        payment_method: values.payment_method,
        transaction_reference: values.transaction_reference || null,
        payment_date: values.payment_date,
      })
      showToast('Payment updated.')
      navigate('/payments')
    } catch {
      showToast('Failed to update payment.')
    } finally {
      setSaving(false)
    }
  }

  if (!id) return null

  if (loading || !payment) {
    return (
      <>
        <Breadcrumb items={[{ label: 'Payments', to: '/payments' }, { label: 'Edit' }]} />
        <PageTitle title="Edit Payment" />
        <Card>
          <CardContent>
            <p className="text-slate-500">{loading ? 'Loading...' : 'Not found.'}</p>
            {!loading && (
              <Button variant="secondary" className="mt-4" onClick={() => navigate('/payments')}>
                Back
              </Button>
            )}
          </CardContent>
        </Card>
      </>
    )
  }

  if ((payment.type ?? 'customer_payment') !== 'customer_payment' || !payment.invoice_id) {
    return (
      <>
        <Breadcrumb items={[{ label: 'Payments', to: '/payments' }, { label: 'Edit' }]} />
        <PageTitle title="Edit Payment" description="Only customer invoice payments can be edited here." />
        <Card>
          <CardContent>
            <Button variant="secondary" onClick={() => navigate('/payments')}>
              Back to payments
            </Button>
          </CardContent>
        </Card>
      </>
    )
  }

  return (
    <>
      <Breadcrumb items={[{ label: 'Payments', to: '/payments' }, { label: 'Edit payment' }]} />
      <PageTitle title="Edit Payment" description="Update amount, method, or date." />
      <Card>
        <CardContent>
          {defaultOverride && (
            <PaymentForm
              key={payment.id}
              invoices={invoices}
              defaultValuesOverride={defaultOverride}
              lockInvoiceSelect
              onSubmit={onSubmit}
              onCancel={() => navigate('/payments')}
              saving={saving}
              submitLabel="Update Payment"
            />
          )}
        </CardContent>
      </Card>
    </>
  )
}
