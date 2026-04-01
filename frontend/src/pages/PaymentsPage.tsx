import { useEffect, useState } from 'react'
import { HiOutlinePlus } from 'react-icons/hi2'
import api from '../services/api'
import Button from '../components/Button'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import PageTitle from '../components/layout/PageTitle'
import { useToast } from '../components/ui/Toast'
import PaymentForm, { type PaymentFormValues } from '../components/forms/PaymentForm'

type Payment = {
  id: number
  invoice_id: number
  invoice_number?: string
  amount: number
  payment_method: string
  payment_date: string
  transaction_reference?: string | null
}

type InvoiceOption = { id: number; invoice_number: string; total_amount?: number }

export default function PaymentsPage() {
  const { showToast } = useToast()
  const [payments, setPayments] = useState<Payment[]>([])
  const [invoices, setInvoices] = useState<InvoiceOption[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const loadPayments = () => {
    setLoading(true)
    api.get<{ data?: Payment[] }>('/payments').then((res) => setPayments(res.data.data ?? [])).finally(() => setLoading(false))
  }

  useEffect(() => {
    loadPayments()
  }, [])

  const openRecordModal = () => {
    setModalOpen(true)
    api.get<{ data?: { id: number; invoice_number: string; total_amount?: number }[] }>('/invoices').then((res) => {
      setInvoices(res.data.data ?? [])
    })
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

  return (
    <>
      <PageTitle
        title="Payments"
        description="View and record payments"
        action={
          <Button onClick={openRecordModal} className="gap-2">
            <HiOutlinePlus className="h-4 w-4" />
            Record Payment
          </Button>
        }
      />
      <Card>
        <CardHeader title="Payments" />
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
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-slate-100">
                      <td className="py-3 text-slate-800">{payment.invoice_number ?? payment.invoice_id}</td>
                      <td className="py-3 text-slate-800">₹{Number(payment.amount).toLocaleString()}</td>
                      <td className="py-3 text-slate-600">{payment.payment_method}</td>
                      <td className="py-3 text-slate-600">{payment.payment_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {payments.length === 0 && (
                <p className="py-8 text-center text-slate-500">No payments yet. Click &quot;Record Payment&quot; to add one.</p>
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
