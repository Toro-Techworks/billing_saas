import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { HiOutlineSquares2X2 } from 'react-icons/hi2'
import Breadcrumb from '../../components/layout/Breadcrumb'
import PageTitle from '../../components/layout/PageTitle'
import Button from '../../components/Button'
import { Card, CardContent } from '../../components/ui/Card'
import InvoicePreview from '../../components/invoice/InvoicePreview'
import InvoiceLayoutEditorModal from '../../components/invoice/InvoiceLayoutEditorModal'
import ToggleSwitch from '../../components/ui/ToggleSwitch'
import type { InvoiceTemplateSettings } from '../../components/invoice/InvoicePreview'
import {
  invoiceTemplateSettingsService,
  type InvoiceTemplateSettingsPayload,
} from '../../services/invoiceTemplateSettingsService'

type FormValues = InvoiceTemplateSettingsPayload & {
  show_logo: boolean
  show_company_address: boolean
  show_customer_address: boolean
  show_tax_column: boolean
  show_discount_column: boolean
  show_payment_terms: boolean
  show_notes: boolean
  show_signature: boolean
  show_bank_details: boolean
  show_qr_code: boolean
  footer_text: string
  payment_terms: string
}

const defaultFormValues: FormValues = {
  show_logo: true,
  show_company_address: true,
  show_customer_address: true,
  show_tax_column: true,
  show_discount_column: true,
  show_payment_terms: true,
  show_notes: true,
  show_signature: true,
  show_bank_details: true,
  show_qr_code: false,
  footer_text: '',
  payment_terms: 'Payment is due within 30 days.',
}

export default function InvoiceTemplatePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [layoutEditorOpen, setLayoutEditorOpen] = useState(false)

  const { register, handleSubmit, watch, reset } = useForm<FormValues>({
    defaultValues: defaultFormValues,
  })

  const watched = watch()

  useEffect(() => {
    let cancelled = false
    invoiceTemplateSettingsService
      .get()
      .then((data) => {
        if (!cancelled) {
          reset({
            show_logo: data.show_logo,
            show_company_address: data.show_company_address,
            show_customer_address: data.show_customer_address,
            show_tax_column: data.show_tax_column,
            show_discount_column: data.show_discount_column,
            show_payment_terms: data.show_payment_terms,
            show_notes: data.show_notes,
            show_signature: data.show_signature,
            show_bank_details: data.show_bank_details,
            show_qr_code: data.show_qr_code,
            footer_text: data.footer_text ?? '',
            payment_terms: data.payment_terms ?? '',
          })
        }
      })
      .catch(() => {
        if (!cancelled) setMessage({ type: 'error', text: 'Failed to load settings.' })
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [reset])

  const onSubmit = async (values: FormValues) => {
    setMessage(null)
    setSaving(true)
    try {
      const payload: InvoiceTemplateSettingsPayload = {
        show_logo: values.show_logo,
        show_company_address: values.show_company_address,
        show_customer_address: values.show_customer_address,
        show_tax_column: values.show_tax_column,
        show_discount_column: values.show_discount_column,
        show_payment_terms: values.show_payment_terms,
        show_notes: values.show_notes,
        show_signature: values.show_signature,
        show_bank_details: values.show_bank_details,
        show_qr_code: values.show_qr_code,
        footer_text: values.footer_text || null,
        payment_terms: values.payment_terms || null,
      }
      await invoiceTemplateSettingsService.update(payload)
      setMessage({ type: 'success', text: 'Settings saved successfully.' })
    } catch {
      setMessage({ type: 'error', text: 'Failed to save settings.' })
    } finally {
      setSaving(false)
    }
  }

  const previewSettings: InvoiceTemplateSettings = {
    show_logo: watched.show_logo ?? true,
    show_company_address: watched.show_company_address ?? true,
    show_customer_address: watched.show_customer_address ?? true,
    show_tax_column: watched.show_tax_column ?? true,
    show_discount_column: watched.show_discount_column ?? true,
    show_payment_terms: watched.show_payment_terms ?? true,
    show_notes: watched.show_notes ?? true,
    show_signature: watched.show_signature ?? true,
    show_bank_details: watched.show_bank_details ?? true,
    show_qr_code: watched.show_qr_code ?? false,
    footer_text: watched.footer_text || null,
    payment_terms: watched.payment_terms || null,
  }

  if (loading) {
    return (
      <>
        <Breadcrumb items={[{ label: 'Settings', to: '/settings' }, { label: 'Invoice Template' }]} />
        <PageTitle title="Invoice Template" description="Customize layout, toggles, footer, and payment terms." />
        <Card>
          <CardContent>
            <p className="text-slate-500">Loading settings…</p>
          </CardContent>
        </Card>
      </>
    )
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Settings', to: '/settings' }, { label: 'Invoice Template' }]} />
      <PageTitle
        title="Invoice Template"
        description="Customize invoice layout, toggles, footer, payment terms, and live preview."
        action={
          <Button
            type="button"
            variant="secondary"
            onClick={() => setLayoutEditorOpen(true)}
            className="gap-2"
          >
            <HiOutlineSquares2X2 className="h-4 w-4" />
            Edit Layout
          </Button>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 lg:flex-row">
        {/* Left: Settings form */}
        <div className="flex-1 space-y-6">
          <Card>
            <CardContent>
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Invoice Layout</h2>
            <div className="space-y-1 divide-y divide-slate-100">
              <ToggleSwitch label="Show Logo" {...register('show_logo')} />
              <ToggleSwitch label="Show Company Address" {...register('show_company_address')} />
              <ToggleSwitch label="Show Customer Address" {...register('show_customer_address')} />
              <ToggleSwitch label="Show Tax Column" {...register('show_tax_column')} />
              <ToggleSwitch label="Show Discount Column" {...register('show_discount_column')} />
              <ToggleSwitch label="Show Payment Terms" {...register('show_payment_terms')} />
              <ToggleSwitch label="Show Notes" {...register('show_notes')} />
              <ToggleSwitch label="Show Signature" {...register('show_signature')} />
              <ToggleSwitch label="Show Bank Details" {...register('show_bank_details')} />
              <ToggleSwitch label="Show QR Code" {...register('show_qr_code')} />
            </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h2 className="mb-3 text-lg font-semibold text-slate-900">Footer Text</h2>
            <textarea
              {...register('footer_text')}
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              placeholder="Optional footer text for the invoice"
            />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h2 className="mb-3 text-lg font-semibold text-slate-900">Payment Terms</h2>
            <textarea
              {...register('payment_terms')}
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              placeholder="e.g. Payment is due within 30 days."
            />
            </CardContent>
          </Card>

          {message && (
            <div
              className={`rounded-lg p-3 text-sm ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {message.text}
            </div>
          )}

          <Button type="submit" loading={saving} loadingLabel="Saving…">
            Save Settings
          </Button>
        </div>

        <InvoiceLayoutEditorModal
          isOpen={layoutEditorOpen}
          onClose={() => setLayoutEditorOpen(false)}
          onSaved={() => setLayoutEditorOpen(false)}
        />

        {/* Right: Live preview */}
        <div className="w-full lg:w-[380px] flex-shrink-0">
          <div className="sticky top-6">
            <InvoicePreview settings={previewSettings} />
          </div>
        </div>
      </form>
    </div>
  )
}
