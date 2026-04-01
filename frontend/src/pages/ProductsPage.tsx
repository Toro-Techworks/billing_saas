import { useEffect, useState } from 'react'
import { HiOutlinePlus } from 'react-icons/hi2'
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

export default function ProductsPage() {
  const { showToast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
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

  const onSubmit = async (values: ProductFormValues) => {
    setSaving(true)
    try {
      await api.post('/products', {
        name: values.name,
        sku: values.sku,
        price: parseFloat(values.price),
        tax_rate: values.tax_rate ? parseFloat(values.tax_rate) : 0,
        description: values.description || null,
      })
      showToast('Product created successfully.')
      setModalOpen(false)
      loadProducts()
    } catch (err: unknown) {
      let msg = 'Failed to save product.'
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

  return (
    <>
      <PageTitle
        title="Products"
        description="Manage products and services"
        action={
          <Button onClick={() => setModalOpen(true)} className="gap-2">
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
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-slate-100">
                      <td className="py-3 text-slate-800">{product.name}</td>
                      <td className="py-3 text-slate-600">{product.sku ?? '—'}</td>
                      <td className="py-3 text-slate-800">₹{Number(product.price).toLocaleString()}</td>
                      <td className="py-3 text-slate-600">{product.tax_rate}%</td>
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
        onClose={() => !saving && setModalOpen(false)}
        title="Add Product"
        size="lg"
      >
        <ProductForm
          defaultValues={defaultProductFormValues}
          onSubmit={onSubmit}
          onCancel={() => setModalOpen(false)}
          saving={saving}
          submitLabel="Save Product"
        />
      </Modal>
    </>
  )
}
