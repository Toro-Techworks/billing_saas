import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi2'
import api from '../services/api'
import PageTitle from '../components/layout/PageTitle'
import Button from '../components/Button'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import Pagination from '../components/ui/Pagination'
import Select from '../components/ui/Select'
import { useToast } from '../components/ui/Toast'

type ExpenseType = 'generic' | 'client'

type Expense = {
  id: number
  expense_type: ExpenseType
  customer_id: number | null
  customer?: { id: number; name: string } | null
  category: string
  amount: number
  description: string | null
  expense_date: string
}

type CustomerOption = { id: number; name: string }

type PaginatedResponse = {
  data: Expense[]
  meta: { current_page: number; last_page: number; total: number }
}

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

export default function ExpensesPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [customers, setCustomers] = useState<CustomerOption[]>([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [page, setPage] = useState(1)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [filterType, setFilterType] = useState<'' | ExpenseType>('')
  const [modalOpen, setModalOpen] = useState(false)
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

  const fetchCustomers = () => {
    api
      .get<{ data: CustomerOption[] }>('/customers', { params: { per_page: 500 } })
      .then((res) => {
        const rows = res.data?.data
        setCustomers(Array.isArray(rows) ? rows : [])
      })
      .catch(() => setCustomers([]))
  }

  const fetchExpenses = (params?: { page?: number; from?: string; to?: string; expense_type?: '' | ExpenseType }) => {
    setLoading(true)
    const nextPage = params?.page ?? page
    api
      .get<PaginatedResponse>('/expenses', {
        params: {
          page: nextPage,
          from: params?.from !== undefined ? params.from : from || undefined,
          to: params?.to !== undefined ? params.to : to || undefined,
          expense_type: params?.expense_type !== undefined ? params.expense_type || undefined : filterType || undefined,
        },
      })
      .then((res) => {
        const body = res.data as PaginatedResponse
        setExpenses(Array.isArray(body.data) ? body.data : [])
        const m = body.meta
        setMeta(m ? { current_page: m.current_page, last_page: m.last_page, total: m.total } : { current_page: 1, last_page: 1, total: 0 })
      })
      .catch(() => setExpenses([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  useEffect(() => {
    fetchExpenses()
  }, [page])

  const openAdd = () => {
    setForm({
      expense_type: 'generic',
      customer_id: '',
      category: '',
      amount: '',
      description: '',
      expense_date: new Date().toISOString().slice(0, 10),
    })
    setModalOpen(true)
  }

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
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
      const payload = {
        expense_type: form.expense_type,
        customer_id: form.expense_type === 'client' ? parseInt(form.customer_id, 10) : null,
        category: form.category.trim(),
        amount,
        description: form.description.trim() || null,
        expense_date: form.expense_date,
      }
      await api.post('/expenses', payload)
      showToast('Expense added.')
      setModalOpen(false)
      fetchExpenses({ page: meta.current_page, from, to, expense_type: filterType })
    } catch (err) {
      showToast(apiErrorMessage(err, 'Failed to save expense.'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (e: Expense, ev?: React.MouseEvent) => {
    ev?.stopPropagation()
    if (!window.confirm(`Delete expense "${e.category}"?`)) return
    try {
      await api.delete(`/expenses/${e.id}`)
      showToast('Expense deleted.')
      fetchExpenses({ page: meta.current_page, from, to, expense_type: filterType })
    } catch (err) {
      showToast(apiErrorMessage(err, 'Failed to delete expense.'))
    }
  }

  const applyDateFilter = (ev: React.FormEvent) => {
    ev.preventDefault()
    setPage(1)
    fetchExpenses({ page: 1, from: from || undefined, to: to || undefined, expense_type: filterType })
  }

  const applyTypeFilter = (t: '' | ExpenseType) => {
    setFilterType(t)
    setPage(1)
    fetchExpenses({ page: 1, from: from || undefined, to: to || undefined, expense_type: t })
  }

  const customerOptions = [
    { value: '', label: 'Select client' },
    ...customers.map((c) => ({ value: String(c.id), label: c.name })),
  ]

  return (
    <div className="space-y-6">
      <PageTitle
        title="Expenses"
        description="Track generic business expenses and client-specific costs"
        action={
          <Button onClick={openAdd} className="gap-2">
            <HiOutlinePlus className="h-4 w-4" />
            Add Expense
          </Button>
        }
      />
      <Card>
        <CardHeader
          title="Expenses"
          action={
            <form onSubmit={applyDateFilter} className="flex flex-wrap items-center gap-2">
              <select
                value={filterType}
                onChange={(e) => applyTypeFilter(e.target.value as '' | ExpenseType)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/70"
              >
                <option value="">All types</option>
                <option value="generic">Generic</option>
                <option value="client">Client-based</option>
              </select>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm"
              />
              <span className="text-slate-500">to</span>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm"
              />
              <Button type="submit" variant="secondary">Filter dates</Button>
            </form>
          }
        />
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr className="bg-slate-50/80">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Category</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Description</th>
                  <th className="relative px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500">Loading...</td>
                  </tr>
                ) : expenses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500">No expenses found</td>
                  </tr>
                ) : (
                  expenses.map((e) => (
                    <tr
                      key={e.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(`/expenses/${e.id}/edit`)}
                      onKeyDown={(ev) => {
                        if (ev.key === 'Enter') navigate(`/expenses/${e.id}/edit`)
                      }}
                      className="cursor-pointer hover:bg-slate-50/50"
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">{e.expense_date}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span
                          className={
                            e.expense_type === 'client'
                              ? 'inline-flex rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-800'
                              : 'inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700'
                          }
                        >
                          {e.expense_type === 'client' ? 'Client' : 'Generic'}
                        </span>
                      </td>
                      <td className="max-w-[10rem] truncate px-6 py-4 text-sm text-slate-600">
                        {e.expense_type === 'client' && e.customer?.name ? e.customer.name : '—'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">{e.category}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-slate-600">₹{Number(e.amount).toLocaleString()}</td>
                      <td className="max-w-xs truncate px-6 py-4 text-sm text-slate-600">{e.description ?? '—'}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-right" onClick={(ev) => ev.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(ev) => handleDelete(e, ev)}
                          className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          aria-label="Delete expense"
                        >
                          <HiOutlineTrash className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {meta.last_page > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
              <p className="text-sm text-slate-500">Page {meta.current_page} of {meta.last_page} ({meta.total} total)</p>
              <Pagination currentPage={meta.current_page} lastPage={meta.last_page} onPageChange={setPage} />
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        title="Add Expense"
        size="md"
      >
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
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                Generic expense
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                <input
                  type="radio"
                  name="expense_type"
                  checked={form.expense_type === 'client'}
                  onChange={() => setForm((f) => ({ ...f, expense_type: 'client' }))}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                Client-based
              </label>
            </div>
            <p className="text-xs text-slate-500">Link an expense to a client for reimbursable or job-cost tracking.</p>
          </fieldset>

          {form.expense_type === 'client' && (
            <Select
              label="Client *"
              options={customerOptions}
              value={form.customer_id}
              onChange={(ev) => setForm((f) => ({ ...f, customer_id: ev.target.value }))}
              required
            />
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700">Category *</label>
            <input
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/70"
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
              className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/70"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Date *</label>
            <input
              type="date"
              value={form.expense_date}
              onChange={(e) => setForm((f) => ({ ...f, expense_date: e.target.value }))}
              className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/70"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/70"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
