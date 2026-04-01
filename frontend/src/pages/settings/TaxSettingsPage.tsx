import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineEllipsisVertical,
} from 'react-icons/hi2'
import Breadcrumb from '../../components/layout/Breadcrumb'
import PageTitle from '../../components/layout/PageTitle'
import Button from '../../components/Button'
import InputField from '../../components/InputField'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import Select from '../../components/ui/Select'
import api from '../../services/api'

type TaxRate = {
  id: number
  name: string
  percentage: number
  type: string
}

type TaxFormValues = {
  name: string
  percentage: string
  type: string
}

const taxTypeOptions = [
  { value: 'GST', label: 'GST' },
  { value: 'VAT', label: 'VAT' },
  { value: 'Service Tax', label: 'Service Tax' },
]

export default function TaxSettingsPage() {
  const [taxRates, setTaxRates] = useState<TaxRate[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [actionRowId, setActionRowId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaxFormValues>({
    defaultValues: { name: '', percentage: '', type: 'GST' },
  })

  const fetchTaxRates = () => {
    api
      .get<{ data?: TaxRate[] }>('/settings/tax')
      .then((res) => setTaxRates(res.data?.data ?? []))
      .catch(() => setTaxRates([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchTaxRates()
  }, [])

  const openAdd = () => {
    setEditingId(null)
    reset({ name: '', percentage: '', type: 'GST' })
    setModalOpen(true)
  }

  const openEdit = (row: TaxRate) => {
    setEditingId(row.id)
    reset({
      name: row.name,
      percentage: String(row.percentage),
      type: row.type,
    })
    setActionRowId(null)
    setModalOpen(true)
  }

  const onSubmit = async (data: TaxFormValues) => {
    setMessage(null)
    setSaving(true)
    const payload = {
      name: data.name,
      percentage: parseFloat(data.percentage),
      type: data.type,
    }
    try {
      if (editingId) {
        await api.put(`/settings/tax/${editingId}`, payload)
        setMessage({ type: 'success', text: 'Tax rate updated.' })
      } else {
        await api.post('/settings/tax', payload)
        setMessage({ type: 'success', text: 'Tax rate added.' })
      }
      setModalOpen(false)
      fetchTaxRates()
    } catch {
      setMessage({ type: 'error', text: 'Failed to save tax rate.' })
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async (id: number) => {
    if (!confirm('Delete this tax rate?')) return
    setActionRowId(null)
    try {
      await api.delete(`/settings/tax/${id}`)
      setMessage({ type: 'success', text: 'Tax rate deleted.' })
      fetchTaxRates()
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete tax rate.' })
    }
  }

  return (
    <>
      <Breadcrumb items={[{ label: 'Settings', to: '/settings' }, { label: 'Tax Settings' }]} />
      <PageTitle
        title="Tax Settings"
        description="Manage GST, VAT, and other tax rates."
        action={
          <Button type="button" onClick={openAdd}>
            <HiOutlinePlus className="mr-2 h-4 w-4" />
            Add Tax
          </Button>
        }
      />

      {message && (
        <div
          className={`mb-4 rounded-lg p-3 text-sm ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          }`}
          role="alert"
        >
          {message.text}
        </div>
      )}

      <Card>
        <CardHeader title="Tax Rates" />
        <CardContent>
          {loading ? (
            <p className="text-slate-500">Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-600">
                    <th className="py-3 font-medium">Tax Name</th>
                    <th className="py-3 font-medium">Percentage</th>
                    <th className="py-3 font-medium">Type</th>
                    <th className="w-12 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {taxRates.map((row) => (
                    <tr key={row.id} className="border-b border-slate-100">
                      <td className="py-3 text-slate-800">{row.name}</td>
                      <td className="py-3 text-slate-600">{row.percentage}%</td>
                      <td className="py-3 text-slate-600">{row.type}</td>
                      <td className="relative py-3">
                        <button
                          type="button"
                          onClick={() => setActionRowId(actionRowId === row.id ? null : row.id)}
                          className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                          aria-label="Actions"
                        >
                          <HiOutlineEllipsisVertical className="h-5 w-5" />
                        </button>
                        {actionRowId === row.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              aria-hidden
                              onClick={() => setActionRowId(null)}
                            />
                            <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                              <button
                                type="button"
                                onClick={() => openEdit(row)}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                              >
                                <HiOutlinePencilSquare className="h-4 w-4" />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => onDelete(row.id)}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                              >
                                <HiOutlineTrash className="h-4 w-4" />
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {taxRates.length === 0 && (
                <p className="py-8 text-center text-slate-500">No tax rates yet. Click &quot;Add Tax&quot; to add one.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Tax Rate' : 'Add Tax Rate'}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <InputField
            label="Tax Name"
            {...register('name', { required: 'Tax name is required' })}
            error={errors.name?.message}
          />
          <InputField
            label="Tax Percentage"
            type="number"
            step="0.01"
            min="0"
            {...register('percentage', {
              required: 'Percentage is required',
              validate: (v) => !isNaN(parseFloat(v)) || 'Enter a valid number',
            })}
            error={errors.percentage?.message}
          />
          <Select
            label="Tax Type"
            options={taxTypeOptions}
            {...register('type', { required: 'Type is required' })}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving} loadingLabel="Saving...">
              {editingId ? 'Update' : 'Add'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
