import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import Breadcrumb from '../../components/layout/Breadcrumb'
import PageTitle from '../../components/layout/PageTitle'
import Button from '../../components/Button'
import InputField from '../../components/InputField'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import Select from '../../components/ui/Select'
import axios from 'axios'
import api from '../../services/api'

type CompanySettingsForm = {
  company_name: string
  address: string
  city: string
  state: string
  country: string
  pincode: string
  phone: string
  email: string
  website: string
  gst_number: string
  currency: string
  invoice_prefix: string
  bank_name: string
  bank_branch: string
  account_name: string
  account_number: string
  ifsc_code: string
  upi_id: string
}

type CompanySettingsApi = CompanySettingsForm & { logo_url?: string | null }

const defaultValues: CompanySettingsForm = {
  company_name: '',
  address: '',
  city: '',
  state: '',
  country: '',
  pincode: '',
  phone: '',
  email: '',
  website: '',
  gst_number: '',
  currency: 'INR',
  invoice_prefix: 'INV',
  bank_name: '',
  bank_branch: '',
  account_name: '',
  account_number: '',
  ifsc_code: '',
  upi_id: '',
}

export default function CompanySettingsPage() {
  const navigate = useNavigate()
  const logoInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [savedLogoUrl, setSavedLogoUrl] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompanySettingsForm>({ defaultValues })

  useEffect(() => {
    let cancelled = false
    api
      .get<{ data?: CompanySettingsApi }>('/settings/company')
      .then((res) => {
        if (cancelled || !res.data?.data) return
        const { logo_url: logoUrl, ...formFields } = res.data.data
        reset(formFields)
        setSavedLogoUrl(logoUrl ?? null)
      })
      .catch(() => {
        if (!cancelled) reset(defaultValues)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [reset])

  const onLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = () => setLogoPreview(reader.result as string)
      reader.readAsDataURL(file)
    } else {
      setLogoFile(null)
      setLogoPreview(null)
    }
  }

  const onSubmit = async (data: CompanySettingsForm) => {
    setMessage(null)
    setSaving(true)
    try {
      const formData = new FormData()
      ;(Object.entries(data) as [keyof CompanySettingsForm, string][]).forEach(([key, value]) => {
        formData.append(key, value ?? '')
      })
      if (logoFile) {
        formData.append('logo', logoFile)
      }

      const res = await api.post<{ message?: string; data?: CompanySettingsApi }>('/settings/company', formData, {
        transformRequest: [(body, headers) => {
          if (headers && typeof (headers as Record<string, unknown>)['Content-Type'] !== 'undefined') {
            delete (headers as Record<string, unknown>)['Content-Type']
          }
          return body as FormData
        }],
      })

      setMessage({ type: 'success', text: res.data?.message ?? 'Settings saved successfully.' })
      if (res.data?.data) {
        const { logo_url: logoUrl, ...formFields } = res.data.data
        reset(formFields)
        setSavedLogoUrl(logoUrl ?? null)
      }
      setLogoFile(null)
      setLogoPreview(null)
      if (logoInputRef.current) logoInputRef.current.value = ''
    } catch (err: unknown) {
      let text = 'Failed to save settings.'
      if (axios.isAxiosError(err) && err.response?.data) {
        const d = err.response.data as { message?: string; errors?: Record<string, string[]> }
        if (typeof d.message === 'string') {
          text = d.message
        } else if (d.errors) {
          text = Object.values(d.errors)
            .flat()
            .filter(Boolean)
            .join(' ')
        }
      }
      setMessage({ type: 'error', text })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <Breadcrumb items={[{ label: 'Settings', to: '/settings' }, { label: 'Company Settings' }]} />
        <PageTitle title="Company Settings" description="Company name, address, logo, currency, and invoice numbering." />
        <Card>
          <CardContent>
            <p className="text-slate-500">Loading...</p>
          </CardContent>
        </Card>
      </>
    )
  }

  const displayLogo = logoPreview || savedLogoUrl

  return (
    <>
      <Breadcrumb items={[{ label: 'Settings', to: '/settings' }, { label: 'Company Settings' }]} />
      <PageTitle title="Company Settings" description="Company name, address, logo, currency, and invoice numbering." />

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="mb-6">
          <CardHeader title="Company Profile" />
          <CardContent className="space-y-4">
            {message && (
              <div
                className={`rounded-lg p-3 text-sm ${
                  message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                }`}
                role="alert"
              >
                {message.text}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Logo</label>
              <div className="flex flex-wrap items-center gap-4">
                {displayLogo && (
                  <img
                    src={displayLogo}
                    alt="Logo preview"
                    className="h-16 max-w-[200px] rounded-lg border border-slate-200 object-contain"
                  />
                )}
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={onLogoChange}
                  className="block w-full max-w-xs text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>
              <p className="text-xs text-slate-500">
                Logos are saved on the server. If the image does not load, create the public storage link from the backend project (storage:link).
              </p>
            </div>

            <InputField
              label="Company Name"
              {...register('company_name', { required: 'Company name is required' })}
              error={errors.company_name?.message}
            />
            <div>
              <label className="block text-sm font-medium text-slate-700">Address</label>
              <textarea
                {...register('address')}
                rows={2}
                className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                placeholder="Street address"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField label="City" {...register('city')} />
              <InputField label="State" {...register('state')} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField label="Country" {...register('country')} />
              <InputField label="Pincode" {...register('pincode')} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField label="Phone" type="tel" {...register('phone')} />
              <InputField label="Email" type="email" {...register('email')} error={errors.email?.message} />
            </div>
            <InputField label="Website" type="text" placeholder="https://example.com" {...register('website')} />
            <InputField label="GST Number" {...register('gst_number')} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Currency"
                options={[
                  { value: 'INR', label: 'INR' },
                  { value: 'USD', label: 'USD' },
                  { value: 'EUR', label: 'EUR' },
                  { value: 'GBP', label: 'GBP' },
                ]}
                {...register('currency')}
              />
              <InputField label="Invoice Prefix" {...register('invoice_prefix')} placeholder="INV" />
            </div>

            <div className="pt-2">
              <p className="text-sm font-semibold text-slate-900">Bank Details</p>
              <p className="mt-1 text-xs text-slate-500">
                These will appear in invoice/quotation preview and exported PDFs when Bank Details is enabled in the invoice template.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField label="Bank Name" {...register('bank_name')} />
              <InputField label="Branch" {...register('bank_branch')} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField label="Account Name" {...register('account_name')} />
              <InputField label="Account Number" {...register('account_number')} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField label="IFSC Code" {...register('ifsc_code')} />
              <InputField label="UPI ID" {...register('upi_id')} placeholder="name@bank" />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" loading={saving} loadingLabel="Saving...">
            Save Settings
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/settings')}>
            Cancel
          </Button>
        </div>
      </form>
    </>
  )
}
