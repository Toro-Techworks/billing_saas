import { useForm } from 'react-hook-form'
import Button from '../Button'
import InputField from '../InputField'

export type SupplierFormValues = {
  name: string
  phone: string
  email: string
  address: string
  gst_number: string
  opening_balance: string
}

export const defaultSupplierFormValues: SupplierFormValues = {
  name: '',
  phone: '',
  email: '',
  address: '',
  gst_number: '',
  opening_balance: '',
}

type SupplierFormProps = {
  defaultValues?: Partial<SupplierFormValues>
  onSubmit: (values: SupplierFormValues) => void | Promise<void>
  onCancel: () => void
  saving?: boolean
  submitLabel?: string
}

export default function SupplierForm({
  defaultValues = defaultSupplierFormValues,
  onSubmit,
  onCancel,
  saving = false,
  submitLabel = 'Save',
}: SupplierFormProps) {
  const { register, handleSubmit } = useForm<SupplierFormValues>({ defaultValues })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <InputField label="Supplier Name" required {...register('name', { required: true })} />
      <InputField label="Phone" type="tel" {...register('phone')} />
      <InputField label="Email" type="email" {...register('email')} />
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700">Address</label>
        <textarea
          {...register('address')}
          rows={3}
          className="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
        />
      </div>
      <InputField label="GST Number" {...register('gst_number')} />
      <InputField label="Opening Balance" type="number" step="0.01" {...register('opening_balance')} />
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
