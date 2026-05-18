import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi2'
import api from '../services/api'
import Button from '../components/Button'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import PageTitle from '../components/layout/PageTitle'
import { useToast } from '../components/ui/Toast'
import PaymentForm, { type PaymentFormValues } from '../components/forms/PaymentForm'

type Payment = {
  id: number
  type?: string
  invoice_id: number | null
  invoice_number?: string
  amount: number
  payment_method: string
  payment_date: string
  transaction_reference?: string | null
}

type InvoiceOption = { id: number; invoice_number: string; total_amount?: number }

type PaymentListResponse = {
  data?: Payment[]
}

function normalizePayments(body: unknown): Payment[] {
  if (Array.isArray(body)) return body
  const b = body as PaymentListResponse
  return Array.isArray(b?.data) ? b.data : []
}

export default function PaymentsPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [payments, setPayments] = useState<Payment[]>([])
  const [invoices, setInvoices] = useState<InvoiceOption[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const loadPayments = () => {
    setLoading(true)
    api
      .get('/payments', { params: { per_page: 100 } })
      .then((res) => setPayments(normalizePayments(res.data)))
      .catch(() => setPayments([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadPayments()
  }, [])

  const openRecordModal = () => {
    setModalOpen(true)
    api
      .get<{ data?: InvoiceOption[] }>('/invoices', { params: { per_page: 200 } })
      .then((res) => setInvoices(Array.isArray(res.data?.data) ? res.data.data : []))
  }

  const onSubmit = async (values: PaymentFormValues) => {
    setSaving(true)
    try {
      await api.post('/payments', {
        invoice_id: Number(values.invoice_id),
        amount: parseFloat(values.amount),
        payment_method: values.payment_method,
        transaction_reference: values.transaction_reference || null,
        payment_date: values.payment_date,
      })
      showToast('Payment recorded successfully.')
      setModalOpen(false)
      loadPayments()
    } catch {
      showToast('Failed to record payment.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (pay: Payment, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!window.confirm('Delete this payment?')) return
    try {
      await api.delete(`/payments/${pay.id}`)
      showToast('Payment deleted.')
      loadPayments()
    } catch {
      showToast('Failed to delete payment.')
    }
  }

  return (
    <>
      <PageTitle
        title="Payments"
        description="Record money received after the customer pays. Link each entry to an invoice so balances stay accurate."
        action={
          <Button onClick={openRecordModal} className="gap-2">
            <HiOutlinePlus className="h-4 w-4" />
            Record Payment
          </Button>
        }
      />
      <Card>
        <CardHeader title="Payments received" />
        <CardContent>
          {loading ? (
            <p className="py-6 text-center text-slate-500">Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-600">
                    <th className="py-3 font-medium">Invoice #</th>
                    <th className="py-3 font-medium">Amount</th>
                    <th className="py-3 font-medium">Method</th>
                    <th className="py-3 font-medium">Date</th>
                    <th className="py-3 w-24 text-right font-medium">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => {
                    const canEdit =
                      (payment.type ?? 'customer_payment') === 'customer_payment' && payment.invoice_id
                    return (
                      <tr
                        key={payment.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          if (canEdit) navigate(`/payments/${payment.id}/edit`)
                          else showToast('Only invoice payments can be opened for editing.')
                        }}
                        onKeyDown={(ev) => {
                          if (ev.key === 'Enter' && canEdit) navigate(`/payments/${payment.id}/edit`)
                        }}
                        className={`border-b border-slate-100 ${canEdit ? 'cursor-pointer hover:bg-slate-50/80' : 'cursor-default hover:bg-slate-50/40'}`}
                      >
                        <td className="py-3 text-slate-800">{payment.invoice_number ?? payment.invoice_id ?? '—'}</td>
                        <td className="py-3 text-slate-800">₹{Number(payment.amount).toLocaleString()}</td>
                        <td className="py-3 text-slate-600">{payment.payment_method}</td>
                        <td className="py-3 text-slate-600">{String(payment.payment_date).slice(0, 10)}</td>
                        <td className="py-3 text-right">
                          <button
                            type="button"
                            onClick={(e) => handleDelete(payment, e)}
                            className="inline-flex rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                            aria-label="Delete payment"
                          >
                            <HiOutlineTrash className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {payments.length === 0 && (
                <p className="max-w-lg mx-auto py-8 text-center text-sm text-slate-500">
                  No payments recorded yet. When a customer pays an invoice, use Record Payment to log it against that
                  invoice.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        title="Record Payment"
        size="lg"
      >
        <PaymentForm
          invoices={invoices}
          onSubmit={onSubmit}
          onCancel={() => setModalOpen(false)}
          saving={saving}
          submitLabel="Record Payment"
        />
      </Modal>
    </>
  )
}
