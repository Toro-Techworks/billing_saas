import { useForm } from 'react-hook-form'
import Button from '../Button'
import InputField from '../InputField'

export type CustomerFormValues = {
  name: string
  company_name: string
  email: string
  phone: string
  billing_address: string
  gst_number: string
  credit_limit: string
  notes: string
}

export const defaultCustomerFormValues: CustomerFormValues = {
  name: '',
  company_name: '',
  email: '',
  phone: '',
  billing_address: '',
  gst_number: '',
  credit_limit: '',
  notes: '',
}

type CustomerFormProps = {
  defaultValues?: Partial<CustomerFormValues>
  onSubmit: (values: CustomerFormValues) => void | Promise<void>
  onCancel: () => void
  saving?: boolean
  submitLabel?: string
}

export default function CustomerForm({
  defaultValues = defaultCustomerFormValues,
  onSubmit,
  onCancel,
  saving = false,
  submitLabel = 'Save Customer',
}: CustomerFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormValues>({ defaultValues })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <InputField
        label="Name"
        {...register('name', { required: 'Name is required' })}
        error={errors.name?.message}
      />
      <InputField
        label="Company Name"
        {...register('company_name')}
      />
      <InputField
        label="Email"
        type="email"
        {...register('email', {
          required: 'Email is required',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email address',
          },
        })}
        error={errors.email?.message}
      />
      <InputField label="Phone" type="tel" {...register('phone')} />
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700">Address</label>
        <textarea
          {...register('billing_address')}
          rows={3}
          className="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
        />
      </div>
      <InputField label="GST Number" {...register('gst_number')} />
      <InputField
        label="Credit Limit"
        type="number"
        step="0.01"
        min="0"
        {...register('credit_limit')}
        error={errors.credit_limit?.message}
      />
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700">Notes</label>
        <textarea
          {...register('notes')}
          rows={3}
          className="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
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
