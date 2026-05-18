import api from './api'

export type InvoiceTemplateSettingsPayload = {
  show_logo?: boolean
  show_company_address?: boolean
  show_customer_address?: boolean
  show_tax_column?: boolean
  show_discount_column?: boolean
  show_payment_terms?: boolean
  show_notes?: boolean
  show_signature?: boolean
  show_bank_details?: boolean
  show_qr_code?: boolean
  footer_text?: string | null
  notes_text?: string | null
  payment_terms?: string | null
}

export type InvoiceTemplateSettings = InvoiceTemplateSettingsPayload & {
  id: number
  tenant_id: number
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
  footer_text: string | null
  payment_terms: string | null
  created_at: string
  updated_at: string
}

const defaultSettings: InvoiceTemplateSettings = {
  id: 0,
  tenant_id: 0,
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
  footer_text: null,
  notes_text: 'Thank you for your business.',
  payment_terms: 'Payment is due within 30 days.',
  created_at: '',
  updated_at: '',
}

export const invoiceTemplateSettingsService = {
  async get(): Promise<InvoiceTemplateSettings> {
    const { data } = await api.get<InvoiceTemplateSettings>('/invoice-template-settings')
    return { ...defaultSettings, ...data }
  },

  async update(payload: InvoiceTemplateSettingsPayload): Promise<InvoiceTemplateSettings> {
    const { data } = await api.put<InvoiceTemplateSettings>('/invoice-template-settings', payload)
    return data
  },
}
