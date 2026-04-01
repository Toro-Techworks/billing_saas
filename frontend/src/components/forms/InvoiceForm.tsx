import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi2'
import Button from '../Button'
import InputField from '../InputField'
import Modal from '../ui/Modal'
import Select from '../ui/Select'

export type InvoiceLineItem = {
  product_id: string
  quantity: string
  unit_price: string
  tax_rate: string
}

type Product = { id: number; name: string; price: number; tax_rate: number }
type Customer = { id: number; name: string; email: string }

type InvoiceFormValues = {
  customer_id: string
  invoice_date: string
  due_date: string
}

const emptyLine: InvoiceLineItem = {
  product_id: '',
  quantity: '1',
  unit_price: '0',
  tax_rate: '0',
}

function lineTotal(q: number, price: number, taxRate: number) {
  const subtotal = q * price
  const tax = (subtotal * taxRate) / 100
  return subtotal + tax
}

type InvoiceFormProps = {
  customers: Customer[]
  products: Product[]
  onSubmit: (payload: {
    customer_id: number
    invoice_date: string
    due_date: string
    items: { product_id: number; quantity: number; price: number; tax_rate: number }[]
  }) => void | Promise<void>
  onCancel: () => void
  saving?: boolean
  submitLabel?: string
}

export default function InvoiceForm({
  customers,
  products,
  onSubmit,
  onCancel,
  saving = false,
  submitLabel = 'Save Invoice',
}: InvoiceFormProps) {
  const [items, setItems] = useState<InvoiceLineItem[]>([{ ...emptyLine }])
  const [showPreview, setShowPreview] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InvoiceFormValues>({
    defaultValues: {
      customer_id: '',
      invoice_date: new Date().toISOString().slice(0, 10),
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    },
  })

  const customerOptions = [
    { value: '', label: 'Select customer' },
    ...customers.map((c) => ({ value: String(c.id), label: `${c.name} (${c.email})` })),
  ]
  const productOptions = [
    { value: '', label: 'Select product' },
    ...products.map((p) => ({ value: String(p.id), label: `${p.name} — ₹${p.price} (${p.tax_rate}% tax)` })),
  ]

  const addLine = () => setItems((prev) => [...prev, { ...emptyLine }])
  const removeLine = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index))
  const updateLine = (index: number, field: keyof InvoiceLineItem, value: string) => {
    setItems((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const subtotal = items.reduce((sum, row) => {
    const q = parseFloat(row.quantity) || 0
    const p = parseFloat(row.unit_price) || 0
    return sum + q * p
  }, 0)
  const taxAmount = items.reduce((sum, row) => {
    const q = parseFloat(row.quantity) || 0
    const p = parseFloat(row.unit_price) || 0
    const r = parseFloat(row.tax_rate) || 0
    return sum + (q * p * r) / 100
  }, 0)
  const grandTotal = subtotal + taxAmount

  const onFormSubmit = (values: InvoiceFormValues) => {
    const validItems = items.filter((row) => row.product_id && parseFloat(row.quantity) > 0 && parseFloat(row.unit_price) >= 0)
    if (validItems.length === 0) return
    onSubmit({
      customer_id: Number(values.customer_id),
      invoice_date: values.invoice_date,
      due_date: values.due_date,
      items: validItems.map((row) => ({
        product_id: Number(row.product_id),
        quantity: Math.max(1, Math.round(parseFloat(row.quantity) || 0)),
        price: parseFloat(row.unit_price) || 0,
        tax_rate: parseFloat(row.tax_rate) || 0,
      })),
    })
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Customer"
          options={customerOptions}
          {...register('customer_id', { required: 'Please select a customer' })}
          error={errors.customer_id?.message}
        />
        <InputField
          label="Invoice Date"
          type="date"
          {...register('invoice_date', { required: 'Invoice date is required' })}
          error={errors.invoice_date?.message}
        />
        <InputField
          label="Due Date"
          type="date"
          {...register('due_date', { required: 'Due date is required' })}
          error={errors.due_date?.message}
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">Invoice Items</h3>
          <Button type="button" variant="secondary" onClick={addLine} className="gap-1">
            <HiOutlinePlus className="h-4 w-4" />
            Add Item
          </Button>
        </div>
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-2 text-left font-medium text-slate-600">Product</th>
                <th className="px-4 py-2 text-right font-medium text-slate-600">Quantity</th>
                <th className="px-4 py-2 text-right font-medium text-slate-600">Price</th>
                <th className="px-4 py-2 text-right font-medium text-slate-600">Tax %</th>
                <th className="px-4 py-2 text-right font-medium text-slate-600">Total</th>
                <th className="w-10 px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              {items.map((row, i) => {
                const q = parseFloat(row.quantity) || 0
                const p = parseFloat(row.unit_price) || 0
                const r = parseFloat(row.tax_rate) || 0
                const total = lineTotal(q, p, r)
                return (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="px-4 py-2">
                      <select
                        value={row.product_id}
                        onChange={(e) => {
                          const id = e.target.value
                          updateLine(i, 'product_id', id)
                          const prod = products.find((x) => x.id === Number(id))
                          if (prod) {
                            updateLine(i, 'unit_price', String(prod.price))
                            updateLine(i, 'tax_rate', String(prod.tax_rate))
                          }
                        }}
                        className="w-full rounded border border-slate-300 px-2 py-1.5 text-slate-800"
                      >
                        {productOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={row.quantity}
                        onChange={(e) => updateLine(i, 'quantity', e.target.value)}
                        className="w-20 rounded border border-slate-300 px-2 py-1.5 text-right"
                      />
                    </td>
                    <td className="px-4 py-2 text-right">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={row.unit_price}
                        onChange={(e) => updateLine(i, 'unit_price', e.target.value)}
                        className="w-24 rounded border border-slate-300 px-2 py-1.5 text-right"
                      />
                    </td>
                    <td className="px-4 py-2 text-right">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={row.tax_rate}
                        onChange={(e) => updateLine(i, 'tax_rate', e.target.value)}
                        className="w-16 rounded border border-slate-300 px-2 py-1.5 text-right"
                      />
                    </td>
                    <td className="px-4 py-2 text-right font-medium text-slate-800">
                      ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-2 py-2">
                      <button
                        type="button"
                        onClick={() => removeLine(i)}
                        className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        aria-label="Remove line"
                      >
                        <HiOutlineTrash className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-4">
        <div className="flex justify-end gap-8 text-sm">
          <span className="text-slate-600">Subtotal: <strong className="text-slate-900">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></span>
          <span className="text-slate-600">Tax: <strong className="text-slate-900">₹{taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></span>
          <span className="text-slate-600">Grand Total: <strong className="text-lg text-slate-900">₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></span>
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setShowPreview(true)}
          disabled={saving}
        >
          Preview Invoice
        </Button>
        <Button type="submit" loading={saving} loadingLabel="Saving...">
          {submitLabel}
        </Button>
      </div>

      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="Invoice Preview"
        size="md"
      >
        <div className="space-y-4">
          <div className="max-h-48 overflow-y-auto rounded border border-slate-200">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-3 py-2 text-left font-medium text-slate-600">Product</th>
                  <th className="px-3 py-2 text-right font-medium text-slate-600">Qty</th>
                  <th className="px-3 py-2 text-right font-medium text-slate-600">Price</th>
                  <th className="px-3 py-2 text-right font-medium text-slate-600">Tax %</th>
                  <th className="px-3 py-2 text-right font-medium text-slate-600">Total</th>
                </tr>
              </thead>
              <tbody>
                {items
                  .filter((row) => row.product_id)
                  .map((row, i) => {
                    const q = parseFloat(row.quantity) || 0
                    const p = parseFloat(row.unit_price) || 0
                    const r = parseFloat(row.tax_rate) || 0
                    const total = lineTotal(q, p, r)
                    const product = products.find((x) => x.id === Number(row.product_id))
                    return (
                      <tr key={i} className="border-b border-slate-100">
                        <td className="px-3 py-2 text-slate-800">{product?.name ?? '—'}</td>
                        <td className="px-3 py-2 text-right text-slate-600">{q}</td>
                        <td className="px-3 py-2 text-right text-slate-600">₹{p.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right text-slate-600">{r}%</td>
                        <td className="px-3 py-2 text-right font-medium text-slate-800">₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-200 pt-3 text-sm">
            <p className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </p>
            <p className="flex justify-between text-slate-600">
              <span>Tax</span>
              <span>₹{taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </p>
            <p className="flex justify-between text-lg font-semibold text-slate-900">
              <span>Grand Total</span>
              <span>₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </p>
          </div>
        </div>
      </Modal>
    </form>
  )
}
