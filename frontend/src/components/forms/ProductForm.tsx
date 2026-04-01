import { useForm } from 'react-hook-form'
import Button from '../Button'
import InputField from '../InputField'

export type ProductFormValues = {
  name: string
  sku: string
  price: string
  tax_rate: string
  description: string
}

export const defaultProductFormValues: ProductFormValues = {
  name: '',
  sku: '',
  price: '',
  tax_rate: '',
  description: '',
}

type ProductFormProps = {
  defaultValues?: Partial<ProductFormValues>
  onSubmit: (values: ProductFormValues) => void | Promise<void>
  onCancel: () => void
  saving?: boolean
  submitLabel?: string
}

export default function ProductForm({
  defaultValues = defaultProductFormValues,
  onSubmit,
  onCancel,
  saving = false,
  submitLabel = 'Save Product',
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({ defaultValues })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <InputField
        label="Product Name"
        {...register('name', { required: 'Product name is required' })}
        error={errors.name?.message}
      />
      <InputField
        label="SKU"
        {...register('sku', { required: 'SKU is required' })}
        placeholder="e.g. SKU-001"
      />
      <InputField
        label="Price"
        type="number"
        step="0.01"
        min="0"
        {...register('price', {
          required: 'Price is required',
          validate: (v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 0 || 'Enter a valid price',
        })}
        error={errors.price?.message}
      />
      <InputField
        label="Tax Rate (%)"
        type="number"
        step="0.01"
        min="0"
        {...register('tax_rate', {
          validate: (v) => !v || (!isNaN(parseFloat(v)) && parseFloat(v) >= 0) || 'Enter a valid percentage',
        })}
        error={errors.tax_rate?.message}
      />
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700">Description</label>
        <textarea
          {...register('description')}
          rows={3}
          className="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
          placeholder="Optional product description"
        />
      </div>
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
