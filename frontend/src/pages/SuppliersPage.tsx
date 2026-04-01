import { useEffect, useState } from 'react'
import { HiOutlineMagnifyingGlass, HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi2'
import axios from 'axios'
import api from '../services/api'
import PageTitle from '../components/layout/PageTitle'
import Button from '../components/Button'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import Pagination from '../components/ui/Pagination'
import { useToast } from '../components/ui/Toast'
import SupplierForm, { defaultSupplierFormValues, type SupplierFormValues } from '../components/forms/SupplierForm'

type Supplier = {
  id: number
  name: string
  phone: string | null
  email: string | null
  address: string | null
  gst_number: string | null
  opening_balance: number
  outstanding_balance: number
}

type PaginatedResponse = {
  data: Supplier[]
  meta: { current_page: number; last_page: number; total: number }
}

export default function SuppliersPage() {
  const { showToast } = useToast()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [actionRowId, setActionRowId] = useState<number | null>(null)

  const fetchSuppliers = (params?: { page?: number; search?: string }) => {
    setLoading(true)
    const nextPage = params?.page ?? page
    const nextSearch = params?.search !== undefined ? params.search : search
    api
      .get<PaginatedResponse>('/suppliers', { params: { search: nextSearch || undefined, page: nextPage } })
      .then((res) => {
        const body = res.data as { data?: Supplier[]; meta?: { current_page: number; last_page: number; total: number } }
        setSuppliers(Array.isArray(body.data) ? body.data : [])
        const m = body.meta
        setMeta(m ? { current_page: m.current_page ?? 1, last_page: m.last_page ?? 1, total: m.total ?? 0 } : { current_page: 1, last_page: 1, total: 0 })
      })
      .catch(() => {
        setSuppliers([])
        setMeta({ current_page: 1, last_page: 1, total: 0 })
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchSuppliers()
  }, [page])

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchSuppliers({ page: 1, search })
  }

  const openAdd = () => {
    setEditingSupplier(null)
    setActionRowId(null)
    setModalOpen(true)
  }

  const openEdit = (s: Supplier) => {
    setEditingSupplier(s)
    setActionRowId(s.id)
    setModalOpen(true)
  }

  const onSubmit = async (values: SupplierFormValues) => {
    setSaving(true)
    try {
      const payload = {
        name: values.name,
        phone: values.phone || null,
        email: values.email || null,
        address: values.address || null,
        gst_number: values.gst_number || null,
        opening_balance: values.opening_balance ? Number(values.opening_balance) : 0,
      }
      if (actionRowId) {
        await api.put(`/suppliers/${actionRowId}`, payload)
        showToast('Supplier updated.')
      } else {
        await api.post('/suppliers', payload)
        showToast('Supplier created.')
      }
      setModalOpen(false)
      fetchSuppliers({ page: meta.current_page, search })
    } catch (err: unknown) {
      let msg = 'Failed to save supplier.'
      if (axios.isAxiosError(err) && err.response?.data) {
        const d = err.response.data as { message?: string; errors?: Record<string, string[]> }
        if (typeof d.message === 'string') msg = d.message
        else if (d.errors) {
          const first = Object.values(d.errors).flat()[0]
          if (first) msg = first
        }
      }
      showToast(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (s: Supplier) => {
    if (!window.confirm(`Delete supplier "${s.name}"?`)) return
    try {
      await api.delete(`/suppliers/${s.id}`)
      showToast('Supplier deleted.')
      fetchSuppliers({ page: meta.current_page, search })
    } catch {
      showToast('Failed to delete supplier.')
    }
    setActionRowId(null)
  }

  return (
    <div className="space-y-6">
      <PageTitle
        title="Suppliers"
        description="Manage suppliers"
        action={
          <Button onClick={openAdd} className="gap-2">
            <HiOutlinePlus className="h-4 w-4" />
            Add Supplier
          </Button>
        }
      />
      <Card>
        <CardHeader
          title="Suppliers"
          action={
            <form onSubmit={onSearchSubmit} className="flex gap-2">
              <div className="relative">
                <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  placeholder="Search suppliers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-64 rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <Button type="submit" variant="secondary">Search</Button>
            </form>
          }
        />
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr className="bg-slate-50/80">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Supplier Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">GST</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Outstanding Balance</th>
                  <th className="relative px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">Loading...</td>
                  </tr>
                ) : suppliers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">No suppliers found</td>
                  </tr>
                ) : (
                  suppliers.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">{s.name}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">{s.phone ?? '—'}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">{s.gst_number ?? '—'}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                        ₹{Number(s.outstanding_balance).toLocaleString()}
                      </td>
                      <td className="relative whitespace-nowrap px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(s)}
                            className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                          >
                            <HiOutlinePencil className="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(s)}
                            className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-600"
                          >
                            <HiOutlineTrash className="h-5 w-5" />
                          </button>
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
                Page {meta.current_page} of {meta.last_page} ({meta.total} total)
              </p>
              <Pagination currentPage={meta.current_page} lastPage={meta.last_page} onPageChange={setPage} />
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        title={actionRowId ? 'Edit Supplier' : 'Add Supplier'}
        size="lg"
      >
        <SupplierForm
          key={actionRowId ?? 'new'}
          defaultValues={
            editingSupplier
              ? {
                  name: editingSupplier.name,
                  phone: editingSupplier.phone ?? '',
                  email: editingSupplier.email ?? '',
                  address: editingSupplier.address ?? '',
                  gst_number: editingSupplier.gst_number ?? '',
                  opening_balance: String(editingSupplier.opening_balance ?? 0),
                }
              : defaultSupplierFormValues
          }
          onSubmit={onSubmit}
          onCancel={() => setModalOpen(false)}
          saving={saving}
          submitLabel={actionRowId ? 'Update' : 'Save'}
        />
      </Modal>
    </div>
  )
}
