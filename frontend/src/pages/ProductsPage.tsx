import { useEffect, useState } from 'react'
import { HiOutlinePencilSquare, HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi2'
import axios from 'axios'
import api from '../services/api'
import PageTitle from '../components/layout/PageTitle'
import Button from '../components/Button'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import { useToast } from '../components/ui/Toast'
import ProductForm, {
  defaultProductFormValues,
  type ProductFormValues,
} from '../components/forms/ProductForm'

type Product = {
  id: number
  name: string
  sku: string
  price: number
  tax_rate: number
  description?: string | null
}

type ProductsListResponse = {
  data?: Product[]
  meta?: { current_page?: number; last_page?: number; total?: number }
}

function normalizeProductList(body: unknown): Product[] {
  if (Array.isArray(body)) {
    return body
  }
  const b = body as ProductsListResponse
  if (Array.isArray(b?.data)) {
    return b.data
  }
  return []
}

function fetchProducts() {
  return api
    .get<ProductsListResponse | Product[]>('/products', { params: { per_page: 200, page: 1 } })
    .then((res) => normalizeProductList(res.data))
}

function productToFormValues(p: Product): ProductFormValues {
  return {
    name: p.name,
    sku: p.sku ?? '',
    price: String(p.price),
    tax_rate: p.tax_rate != null ? String(p.tax_rate) : '',
    description: p.description ?? '',
  }
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

export default function ProductsPage() {
  const { showToast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)

  const loadProducts = () => {
    setLoading(true)
    fetchProducts()
      .then(setProducts)
      .catch(() => {
        setProducts([])
        showToast('Could not load products.')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const openAdd = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (p: Product) => {
    setEditing(p)
    setModalOpen(true)
  }

  const closeModal = () => {
    if (!saving) {
      setModalOpen(false)
      setEditing(null)
    }
  }

  const onSubmit = async (values: ProductFormValues) => {
    setSaving(true)
    const payload = {
      name: values.name,
      sku: values.sku,
      price: parseFloat(values.price),
      tax_rate: values.tax_rate ? parseFloat(values.tax_rate) : 0,
      description: values.description || null,
    }
    try {
      if (editing) {
        await api.put(`/products/${editing.id}`, payload)
        showToast('Product updated.')
      } else {
        await api.post('/products', payload)
        showToast('Product created successfully.')
      }
      setModalOpen(false)
      setEditing(null)
      loadProducts()
    } catch (err: unknown) {
      showToast(apiErrorMessage(err, editing ? 'Failed to update product.' : 'Failed to save product.'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (p: Product, ev?: React.MouseEvent) => {
    ev?.stopPropagation()
    if (!window.confirm(`Delete product "${p.name}"? This cannot be undone.`)) return
    try {
      await api.delete(`/products/${p.id}`)
      showToast('Product deleted.')
      loadProducts()
    } catch (err) {
      showToast(apiErrorMessage(err, 'Failed to delete product.'))
    }
  }

  return (
    <>
      <PageTitle
        title="Products"
        description="Manage products and services"
        action={
          <Button onClick={openAdd} className="gap-2">
            <HiOutlinePlus className="h-4 w-4" />
            Add Product
          </Button>
        }
      />
      <Card>
        <CardHeader title="Products / Services" />
        <CardContent>
          {loading ? (
            <p className="py-6 text-center text-slate-500">Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-600">
                    <th className="py-3 font-medium">Name</th>
                    <th className="py-3 font-medium">SKU</th>
                    <th className="py-3 font-medium">Price</th>
                    <th className="py-3 font-medium">Tax Rate</th>
                    <th className="py-3 w-20 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => openEdit(product)}
                      onKeyDown={(ev) => {
                        if (ev.key === 'Enter') openEdit(product)
                      }}
                      className="cursor-pointer border-b border-slate-100 hover:bg-slate-50/50"
                    >
                      <td className="py-3 text-slate-800">{product.name}</td>
                      <td className="py-3 text-slate-600">{product.sku ?? '—'}</td>
                      <td className="py-3 text-slate-800">₹{Number(product.price).toLocaleString()}</td>
                      <td className="py-3 text-slate-600">{product.tax_rate}%</td>
                      <td className="py-3 text-right" onClick={(ev) => ev.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(product)}
                            className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
                            aria-label={`Edit ${product.name}`}
                          >
                            <HiOutlinePencilSquare className="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            onClick={(ev) => handleDelete(product, ev)}
                            className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                            aria-label={`Delete ${product.name}`}
                          >
                            <HiOutlineTrash className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {products.length === 0 && (
                <p className="py-8 text-center text-slate-500">No products yet. Click &quot;Add Product&quot; to create one.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editing ? 'Edit Product' : 'Add Product'}
        size="lg"
      >
        <ProductForm
          key={editing ? `edit-${editing.id}` : 'add'}
          defaultValues={editing ? productToFormValues(editing) : defaultProductFormValues}
          onSubmit={onSubmit}
          onCancel={closeModal}
          saving={saving}
          submitLabel={editing ? 'Update Product' : 'Save Product'}
        />
      </Modal>
    </>
  )
}
