import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import Button from '../Button'
import InputField from '../InputField'
import Select from '../ui/Select'

export type PaymentFormValues = {
  invoice_id: string
  amount: string
  payment_method: string
  transaction_reference: string
  payment_date: string
}

export const defaultPaymentFormValues: PaymentFormValues = {
  invoice_id: '',
  amount: '',
  payment_method: 'bank_transfer',
  transaction_reference: '',
  payment_date: new Date().toISOString().slice(0, 10),
}

type InvoiceOption = { id: number; invoice_number: string; total_amount?: number }

type PaymentFormProps = {
  invoices: InvoiceOption[]
  onSubmit: (values: PaymentFormValues) => void | Promise<void>
  onCancel: () => void
  saving?: boolean
  submitLabel?: string
  /** Merge into defaults when editing an existing payment */
  defaultValuesOverride?: Partial<PaymentFormValues>
  /** Prevent changing the linked invoice on update */
  lockInvoiceSelect?: boolean
}

export default function PaymentForm({
  invoices,
  onSubmit,
  onCancel,
  saving = false,
  submitLabel = 'Record Payment',
  defaultValuesOverride,
  lockInvoiceSelect = false,
}: PaymentFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    defaultValues: { ...defaultPaymentFormValues, ...defaultValuesOverride },
  })

  useEffect(() => {
    if (defaultValuesOverride && Object.keys(defaultValuesOverride).length > 0) {
      reset({ ...defaultPaymentFormValues, ...defaultValuesOverride })
    }
  }, [defaultValuesOverride, reset])

  const invoiceOptions = [
    { value: '', label: 'Select invoice' },
    ...invoices.map((inv) => ({
      value: String(inv.id),
      label: `${inv.invoice_number}${inv.total_amount != null ? ` (₹${inv.total_amount.toLocaleString()})` : ''}`,
    })),
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Select
        label="Invoice"
        options={invoiceOptions}
        disabled={lockInvoiceSelect}
        {...register('invoice_id', { required: 'Please select an invoice' })}
        error={errors.invoice_id?.message}
      />
      <InputField
        label="Amount"
        type="number"
        step="0.01"
        min="0"
        {...register('amount', {
          required: 'Amount is required',
          validate: (v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0 || 'Enter a valid amount',
        })}
        error={errors.amount?.message}
      />
      <Select
        label="Payment Method"
        options={[
          { value: 'bank_transfer', label: 'Bank Transfer' },
          { value: 'cash', label: 'Cash' },
          { value: 'card', label: 'Card' },
          { value: 'upi', label: 'UPI' },
          { value: 'cheque', label: 'Cheque' },
          { value: 'other', label: 'Other' },
        ]}
        {...register('payment_method', { required: 'Payment method is required' })}
      />
      <InputField
        label="Transaction Reference"
        {...register('transaction_reference')}
        placeholder="Optional reference number"
      />
      <InputField
        label="Payment Date"
        type="date"
        {...register('payment_date', { required: 'Payment date is required' })}
        error={errors.payment_date?.message}
      />
      <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" loading={saving} loadingLabel="Saving...">
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
