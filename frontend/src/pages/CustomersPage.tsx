import { useEffect, useState } from 'react'
import { HiOutlineMagnifyingGlass, HiOutlinePlus, HiOutlineEllipsisVertical, HiOutlineEye, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi2'
import api from '../services/api'
import PageTitle from '../components/layout/PageTitle'
import Button from '../components/Button'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import Pagination from '../components/ui/Pagination'
import { useToast } from '../components/ui/Toast'
import CustomerForm, {
  defaultCustomerFormValues,
  type CustomerFormValues,
} from '../components/forms/CustomerForm'

type Customer = {
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

type PaginatedResponse = {
  data: Customer[]
  meta: { current_page: number; last_page: number; total: number }
  links?: unknown
}

export default function CustomersPage() {
  const { showToast } = useToast()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [actionRowId, setActionRowId] = useState<number | null>(null)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const fetchCustomers = (params?: { page?: number; search?: string }) => {
    setLoading(true)
    const nextPage = params?.page ?? page
    const nextSearch = params?.search !== undefined ? params.search : search
    api
      .get<PaginatedResponse>('/customers', { params: { search: nextSearch || undefined, page: nextPage } })
      .then((res) => {
        const body = res.data as
          | { data?: Customer[]; meta?: { current_page?: number; last_page?: number; total?: number } }
          | Customer[]
        const list: Customer[] = Array.isArray(body)
          ? body
          : Array.isArray((body as { data?: unknown }).data)
            ? ((body as { data: Customer[] }).data)
            : []
        const paginationMeta =
          Array.isArray(body) ? undefined : (body as { meta?: { current_page?: number; last_page?: number; total?: number } }).meta
        setCustomers(list)
        setMeta(
          paginationMeta && typeof paginationMeta === 'object'
            ? {
                current_page: Number(paginationMeta.current_page) ?? 1,
                last_page: Number(paginationMeta.last_page) ?? 1,
                total: Number(paginationMeta.total) ?? 0,
              }
            : { current_page: 1, last_page: 1, total: 0 }
        )
      })
      .catch(() => {
        setCustomers([])
        setMeta({ current_page: 1, last_page: 1, total: 0 })
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchCustomers()
  }, [page])

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchCustomers({ page: 1, search })
  }

  const openAddModal = () => {
    setActionRowId(null)
    setEditingCustomer(null)
    setModalOpen(true)
  }

  const onSubmit = async (values: CustomerFormValues) => {
    const payload = {
      name: values.name,
      company_name: values.company_name || null,
      email: values.email,
      phone: values.phone || null,
      billing_address: values.billing_address || null,
      gst_number: values.gst_number || null,
      credit_limit: values.credit_limit ? Number(values.credit_limit) : null,
      notes: values.notes || null,
    }
    setSaving(true)
    try {
      if (actionRowId) {
        await api.put(`/customers/${actionRowId}`, payload)
        showToast('Customer updated successfully.')
      } else {
        await api.post('/customers', payload)
        showToast('Customer created successfully.')
      }
      setModalOpen(false)
      if (!actionRowId) {
        setPage(1)
        fetchCustomers({ page: 1, search })
      } else {
        fetchCustomers()
      }
    } catch (err: unknown) {
      let msg = 'Failed to save customer.'
      if (err && typeof err === 'object' && 'response' in err) {
        const res = (err as { response?: { data?: unknown; status?: number } }).response
        if (import.meta.env.DEV && res) {
          console.error('[Customer save error]', res.status, res.data)
        }
        const data = res?.data
        if (data && typeof data === 'object') {
          if (typeof (data as { message?: string }).message === 'string') {
            msg = (data as { message: string }).message
          } else if (typeof (data as { errors?: Record<string, string[]> }).errors === 'object') {
            const errors = (data as { errors: Record<string, string[]> }).errors
            const first = Object.values(errors).flat()[0]
            if (first) msg = first
          }
        }
      }
      showToast(msg)
    } finally {
      setSaving(false)
    }
  }

  const openEditModal = (customer: Customer) => {
    setActionRowId(customer.id)
    setEditingCustomer(customer)
    setModalOpen(true)
  }

  const openViewModal = (customer: Customer) => {
    setViewingCustomer(customer)
    setViewModalOpen(true)
    setActionRowId(null)
  }

  const handleDelete = async (customer: Customer) => {
    if (!window.confirm(`Delete customer "${customer.name}"? This cannot be undone.`)) return
    setDeletingId(customer.id)
    setActionRowId(null)
    try {
      await api.delete(`/customers/${customer.id}`)
      showToast('Customer deleted.')
      fetchCustomers({ page: meta.current_page, search })
    } catch {
      showToast('Failed to delete customer.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageTitle
        title="Customers"
        description="Manage your customers and contacts"
        action={
          <Button onClick={openAddModal} className="gap-2">
            <HiOutlinePlus className="h-4 w-4" />
            Create Customer
          </Button>
        }
      />

      <Card>
        <CardHeader
          title="All customers"
          action={
            <form onSubmit={onSearchSubmit} className="flex gap-2">
              <div className="relative">
                <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  placeholder="Search customers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-64 rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <Button type="submit" variant="secondary">
                Search
              </Button>
            </form>
          }
        />
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr className="bg-slate-50/80">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    GST Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Credit Limit
                  </th>
                  <th className="relative px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                      Loading...
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                      No customers found
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-slate-50/50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                        {customer.name}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                        {customer.phone ?? '—'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                        {customer.email}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                        {customer.gst_number ?? '—'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                        {customer.credit_limit != null && customer.credit_limit !== ''
                          ? Number(customer.credit_limit).toLocaleString()
                          : '—'}
                      </td>
                      <td className="relative whitespace-nowrap px-6 py-4 text-right">
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={() => setActionRowId(actionRowId === customer.id ? null : customer.id)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                          >
                            <HiOutlineEllipsisVertical className="h-5 w-5" />
                          </button>
                          {actionRowId === customer.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                aria-hidden
                                onClick={() => setActionRowId(null)}
                              />
                              <div className="absolute right-0 z-20 mt-1 w-40 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                                <button
                                  type="button"
                                  onClick={() => {
                                    openViewModal(customer)
                                    setActionRowId(null)
                                  }}
                                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                                >
                                  <HiOutlineEye className="h-4 w-4" /> View
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    openEditModal(customer)
                                    setActionRowId(null)
                                  }}
                                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                                >
                                  <HiOutlinePencil className="h-4 w-4" /> Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleDelete(customer)
                                    setActionRowId(null)
                                  }}
                                  disabled={deletingId === customer.id}
                                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-slate-50 disabled:opacity-50"
                                >
                                  <HiOutlineTrash className="h-4 w-4" /> Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {meta.last_page > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
              <p className="text-sm text-slate-500">
                Showing page {meta.current_page} of {meta.last_page} ({meta.total} total)
              </p>
              <Pagination
                currentPage={meta.current_page}
                lastPage={meta.last_page}
                onPageChange={setPage}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        title={actionRowId ? 'Edit Customer' : 'Create Customer'}
        size="lg"
      >
        <CustomerForm
          key={actionRowId ?? 'new'}
          defaultValues={
            editingCustomer
              ? {
                  name: editingCustomer.name,
                  company_name: editingCustomer.company_name ?? '',
                  email: editingCustomer.email,
                  phone: editingCustomer.phone ?? '',
                  billing_address: editingCustomer.billing_address ?? '',
                  gst_number: editingCustomer.gst_number ?? '',
                  credit_limit:
                    editingCustomer.credit_limit != null && editingCustomer.credit_limit !== ''
                      ? String(editingCustomer.credit_limit)
                      : '',
                  notes: editingCustomer.notes ?? '',
                }
              : defaultCustomerFormValues
          }
          onSubmit={onSubmit}
          onCancel={() => setModalOpen(false)}
          saving={saving}
          submitLabel={actionRowId ? 'Update Customer' : 'Save Customer'}
        />
      </Modal>

      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="View Customer"
        size="lg"
      >
        {viewingCustomer && (
          <div className="space-y-4">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-slate-500">Name</dt>
                <dd className="mt-0.5 text-sm text-slate-900">{viewingCustomer.name}</dd>
              </div>
              {viewingCustomer.company_name && (
                <div>
                  <dt className="text-sm font-medium text-slate-500">Company</dt>
                  <dd className="mt-0.5 text-sm text-slate-900">{viewingCustomer.company_name}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-slate-500">Email</dt>
                <dd className="mt-0.5 text-sm text-slate-900">{viewingCustomer.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500">Phone</dt>
                <dd className="mt-0.5 text-sm text-slate-900">{viewingCustomer.phone ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500">GST Number</dt>
                <dd className="mt-0.5 text-sm text-slate-900">{viewingCustomer.gst_number ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500">Credit Limit</dt>
                <dd className="mt-0.5 text-sm text-slate-900">
                  {viewingCustomer.credit_limit != null && viewingCustomer.credit_limit !== ''
                    ? Number(viewingCustomer.credit_limit).toLocaleString()
                    : '—'}
                </dd>
              </div>
            </dl>
            {viewingCustomer.billing_address && (
              <div>
                <dt className="text-sm font-medium text-slate-500">Address</dt>
                <dd className="mt-0.5 whitespace-pre-wrap text-sm text-slate-900">
                  {viewingCustomer.billing_address}
                </dd>
              </div>
            )}
            {viewingCustomer.notes && (
              <div>
                <dt className="text-sm font-medium text-slate-500">Notes</dt>
                <dd className="mt-0.5 whitespace-pre-wrap text-sm text-slate-900">
                  {viewingCustomer.notes}
                </dd>
              </div>
            )}
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <Button variant="secondary" onClick={() => setViewModalOpen(false)}>
                Close
              </Button>
              <Button onClick={() => { setViewModalOpen(false); openEditModal(viewingCustomer); }}>
                Edit
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
