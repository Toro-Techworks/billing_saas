import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiOutlineMagnifyingGlass, HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi2'
import api from '../services/api'
import PageTitle from '../components/layout/PageTitle'
import Button from '../components/Button'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import Pagination from '../components/ui/Pagination'
import { useToast } from '../components/ui/Toast'

type Supplier = { id: number; name: string }
type Product = { id: number; name: string; sku: string; price: number }
type Purchase = {
  id: number
  purchase_number: string
  purchase_date: string
  total_amount: number
  status: string
  supplier?: { id: number; name: string }
}

type PaginatedResponse = { data: Purchase[]; meta: { current_page: number; last_page: number; total: number } }

const emptyLine = (): { product_id: number; quantity: number; price: number } => ({ product_id: 0, quantity: 1, price: 0 })

export default function PurchasesPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [form, setForm] = useState({ supplier_id: 0, purchase_date: new Date().toISOString().slice(0, 10), items: [emptyLine()] })

  const fetchPurchases = (params?: { page?: number; search?: string }) => {
    setLoading(true)
    const nextPage = params?.page ?? page
    const nextSearch = params?.search !== undefined ? params.search : search
    api
      .get<PaginatedResponse>('/purchases', { params: { search: nextSearch || undefined, page: nextPage } })
      .then((res) => {
        const body = res.data as PaginatedResponse
        setPurchases(Array.isArray(body.data) ? body.data : [])
        const m = body.meta
        setMeta(m ? { current_page: m.current_page, last_page: m.last_page, total: m.total } : { current_page: 1, last_page: 1, total: 0 })
      })
      .catch(() => setPurchases([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchPurchases()
  }, [page])

  useEffect(() => {
    api.get<{ data?: Supplier[] }>('/suppliers', { params: { per_page: 500 } }).then((r) => setSuppliers(Array.isArray((r.data as { data?: Supplier[] }).data) ? (r.data as { data: Supplier[] }).data : []))
    api.get<{ data?: Product[] }>('/products', { params: { per_page: 500 } }).then((r) => {
      const d = r.data as { data?: Product[] }
      setProducts(Array.isArray(d?.data) ? d.data : [])
    })
  }, [])

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchPurchases({ page: 1, search })
  }

  const openCreate = () => {
    setForm({ supplier_id: 0, purchase_date: new Date().toISOString().slice(0, 10), items: [emptyLine()] })
    setModalOpen(true)
  }

  const addLine = () => setForm((f) => ({ ...f, items: [...f.items, emptyLine()] }))
  const removeLine = (idx: number) => setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }))
  const updateLine = (idx: number, field: 'product_id' | 'quantity' | 'price', value: number) => {
    setForm((f) => {
      const items = [...f.items]
      items[idx] = { ...items[idx], [field]: value }
      if (field === 'product_id') {
        const p = products.find((x) => x.id === value)
        if (p) items[idx].price = p.price
      }
      if (field === 'quantity' || field === 'price') {
        items[idx].quantity = field === 'quantity' ? value : items[idx].quantity
        items[idx].price = field === 'price' ? value : items[idx].price
      }
      return { ...f, items }
    })
  }

  const total = form.items.reduce((sum, row) => sum + row.quantity * row.price, 0)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.supplier_id) {
      showToast('Select a supplier.')
      return
    }
    const validItems = form.items.filter((i) => i.product_id > 0 && i.quantity > 0)
    if (validItems.length === 0) {
      showToast('Add at least one product.')
      return
    }
    setSaving(true)
    try {
      await api.post('/purchases', {
        supplier_id: form.supplier_id,
        purchase_date: form.purchase_date,
        status: 'draft',
        items: validItems.map((i) => ({ product_id: i.product_id, quantity: i.quantity, price: i.price })),
      })
      showToast('Purchase created. Stock updated.')
      setModalOpen(false)
      fetchPurchases({ page: 1, search })
    } catch {
      showToast('Failed to create purchase.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (p: Purchase, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!window.confirm(`Delete purchase "${p.purchase_number}"? Stock will be adjusted to reverse intake.`)) return
    try {
      await api.delete(`/purchases/${p.id}`)
      showToast('Purchase deleted.')
      fetchPurchases({ page: meta.current_page, search })
    } catch {
      showToast('Failed to delete purchase.')
    }
  }

  return (
    <div className="space-y-6">
      <PageTitle
        title="Purchases"
        description="Purchase orders and stock intake"
        action={
          <Button onClick={openCreate} className="gap-2">
            <HiOutlinePlus className="h-4 w-4" />
            Create Purchase
          </Button>
        }
      />
      <Card>
        <CardHeader
          title="Purchases"
          action={
            <form onSubmit={onSearchSubmit} className="flex gap-2">
              <div className="relative">
                <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  placeholder="Search..."
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
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Purchase #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Supplier</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">Loading...</td></tr>
                ) : purchases.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">No purchases found</td></tr>
                ) : (
                  purchases.map((p) => (
                    <tr
                      key={p.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(`/purchases/${p.id}`)}
                      onKeyDown={(ev) => {
                        if (ev.key === 'Enter') navigate(`/purchases/${p.id}`)
                      }}
                      className="cursor-pointer hover:bg-slate-50/50"
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">{p.purchase_number}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">{p.purchase_date}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">{p.supplier?.name ?? '—'}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-slate-600">₹{Number(p.total_amount).toLocaleString()}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">{p.status}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => handleDelete(p, e)}
                          className="rounded p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          aria-label="Delete purchase"
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

      <Modal isOpen={modalOpen} onClose={() => !saving && setModalOpen(false)} title="Create Purchase" size="lg">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Supplier *</label>
            <select
              value={form.supplier_id || ''}
              onChange={(e) => setForm((f) => ({ ...f, supplier_id: Number(e.target.value) }))}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Select supplier</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Purchase Date</label>
            <input
              type="date"
              value={form.purchase_date}
              onChange={(e) => setForm((f) => ({ ...f, purchase_date: e.target.value }))}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-700">Items</label>
              <Button type="button" variant="secondary" onClick={addLine}>Add line</Button>
            </div>
            <div className="mt-2 space-y-2">
              {form.items.map((row, idx) => (
                <div key={idx} className="flex flex-wrap items-center gap-2">
                  <select
                    value={row.product_id || ''}
                    onChange={(e) => updateLine(idx, 'product_id', Number(e.target.value))}
                    className="rounded border border-slate-300 px-2 py-1.5 text-sm"
                  >
                    <option value={0}>Product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    value={row.quantity}
                    onChange={(e) => updateLine(idx, 'quantity', Number(e.target.value))}
                    className="w-20 rounded border border-slate-300 px-2 py-1.5 text-sm"
                  />
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={row.price}
                    onChange={(e) => updateLine(idx, 'price', Number(e.target.value))}
                    className="w-24 rounded border border-slate-300 px-2 py-1.5 text-sm"
                  />
                  <span className="text-sm text-slate-600">= ₹{(row.quantity * row.price).toLocaleString()}</span>
                  {form.items.length > 1 && (
                    <button type="button" onClick={() => removeLine(idx)} className="text-red-600 text-sm">Remove</button>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-2 text-sm font-medium text-slate-700">Total: ₹{total.toLocaleString()}</p>
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
