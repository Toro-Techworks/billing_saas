import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import api from '../services/api'
import Breadcrumb from '../components/layout/Breadcrumb'
import PageTitle from '../components/layout/PageTitle'
import Button from '../components/Button'
import { Card, CardContent } from '../components/ui/Card'
import Select from '../components/ui/Select'
import { useToast } from '../components/ui/Toast'

type ExpenseType = 'generic' | 'client'

type ExpenseApi = {
  id: number
  expense_type: ExpenseType
  customer_id: number | null
  category: string
  amount: number
  description: string | null
  expense_date: string
}

type CustomerOption = { id: number; name: string }

function apiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const d = err.response?.data as { message?: string; errors?: Record<string, string[]> }
    if (d?.message && typeof d.message === 'string') return d.message
    if (d?.errors && typeof d.errors === 'object') {
      const first = Object.values(d.errors).flat()[0]
      if (first) return String(first)
    }
  }
  return fallback
}

export default function ExpenseEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [expense, setExpense] = useState<ExpenseApi | null>(null)
  const [customers, setCustomers] = useState<CustomerOption[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    expense_type: 'generic' as ExpenseType,
    customer_id: '',
    category: '',
    amount: '',
    description: '',
    expense_date: new Date().toISOString().slice(0, 10),
  })

  useEffect(() => {
    api
      .get<{ data: CustomerOption[] }>('/customers', { params: { per_page: 500 } })
      .then((res) => setCustomers(Array.isArray(res.data?.data) ? res.data.data : []))
      .catch(() => setCustomers([]))
  }, [])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    api
      .get<ExpenseApi>(`/expenses/${id}`)
      .then((r) => {
        const e = r.data
        setExpense(e)
        setForm({
          expense_type: e.expense_type === 'client' ? 'client' : 'generic',
          customer_id: e.customer_id != null ? String(e.customer_id) : '',
          category: e.category,
          amount: String(e.amount),
          description: e.description ?? '',
          expense_date: String(e.expense_date).slice(0, 10),
        })
      })
      .catch(() => {
        showToast('Could not load expense.')
        setExpense(null)
      })
      .finally(() => setLoading(false))
  }, [id, showToast])

  const customerOptions = [
    { value: '', label: 'Select client' },
    ...customers.map((c) => ({ value: String(c.id), label: c.name })),
  ]

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!id) return
    if (!form.category.trim()) {
      showToast('Category is required.')
      return
    }
    if (form.expense_type === 'client' && !form.customer_id) {
      showToast('Select a client for a client-based expense.')
      return
    }
    const amount = parseFloat(form.amount)
    if (isNaN(amount) || amount < 0) {
      showToast('Enter a valid amount.')
      return
    }
    setSaving(true)
    try {
      await api.put(`/expenses/${id}`, {
        expense_type: form.expense_type,
        customer_id: form.expense_type === 'client' ? parseInt(form.customer_id, 10) : null,
        category: form.category.trim(),
        amount,
        description: form.description.trim() || null,
        expense_date: form.expense_date,
      })
      showToast('Expense updated.')
      navigate('/expenses')
    } catch (err) {
      showToast(apiErrorMessage(err, 'Failed to save expense.'))
    } finally {
      setSaving(false)
    }
  }

  if (!id) return null

  if (loading || !expense) {
    return (
      <>
        <Breadcrumb items={[{ label: 'Expenses', to: '/expenses' }, { label: 'Edit' }]} />
        <PageTitle title="Edit Expense" />
        <Card>
          <CardContent>
            <p className="text-slate-500">{loading ? 'Loading...' : 'Not found.'}</p>
            {!loading && (
              <Button variant="secondary" className="mt-4" onClick={() => navigate('/expenses')}>
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
      <Breadcrumb items={[{ label: 'Expenses', to: '/expenses' }, { label: form.category || 'Edit' }]} />
      <PageTitle title="Edit Expense" description="Update expense details." />
      <Card>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-slate-700">Expense type</legend>
              <div className="flex flex-wrap gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                  <input
                    type="radio"
                    name="expense_type"
                    checked={form.expense_type === 'generic'}
                    onChange={() => setForm((f) => ({ ...f, expense_type: 'generic', customer_id: '' }))}
                    className="text-indigo-600"
                  />
                  Generic
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                  <input
                    type="radio"
                    name="expense_type"
                    checked={form.expense_type === 'client'}
                    onChange={() => setForm((f) => ({ ...f, expense_type: 'client' }))}
                    className="text-indigo-600"
                  />
                  Client-based
                </label>
              </div>
            </fieldset>
            {form.expense_type === 'client' && (
              <Select
                label="Client *"
                options={customerOptions}
                value={form.customer_id}
                onChange={(ev) => setForm((f) => ({ ...f, customer_id: ev.target.value }))}
              />
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700">Category *</label>
              <input
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Amount *</label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Date *</label>
              <input
                type="date"
                value={form.expense_date}
                onChange={(e) => setForm((f) => ({ ...f, expense_date: e.target.value }))}
                className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm shadow-sm"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => navigate('/expenses')} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Update'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  )
}
