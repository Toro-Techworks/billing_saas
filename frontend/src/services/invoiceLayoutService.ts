import api from './api'

export type InvoiceLayoutItem = {
  i: string
  x: number
  y: number
  w: number
  h: number
  visible?: boolean
}

export type InvoiceLayoutJson = {
  layout: InvoiceLayoutItem[]
}

export type InvoiceLayoutResponse = {
  id: number
  company_id: number
  layout_json: InvoiceLayoutJson
  created_at: string
  updated_at: string
}

export const INVOICE_LAYOUT_COMPONENTS: { id: string; label: string }[] = [
  { id: 'logo', label: 'Company Logo' },
  { id: 'company_details', label: 'Company Details' },
  { id: 'invoice_header', label: 'Invoice Header' },
  { id: 'customer_details', label: 'Customer Details' },
  { id: 'item_table', label: 'Item Table' },
  { id: 'tax_summary', label: 'Tax Summary' },
  { id: 'subtotal_total', label: 'Subtotal / Total' },
  { id: 'payment_terms', label: 'Payment Terms' },
  { id: 'notes', label: 'Notes' },
  { id: 'bank_details', label: 'Bank Details' },
  { id: 'signature', label: 'Signature' },
  { id: 'qr_code', label: 'QR Code' },
]

export const invoiceLayoutService = {
  async get(): Promise<InvoiceLayoutResponse> {
    const { data } = await api.get<InvoiceLayoutResponse>('/invoice-layout')
    return data
  },

  async save(layoutJson: InvoiceLayoutJson): Promise<InvoiceLayoutResponse> {
    const { data } = await api.post<InvoiceLayoutResponse>('/invoice-layout', { layout_json: layoutJson })
    return data
  },
}
