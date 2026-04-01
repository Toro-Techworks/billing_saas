export type InvoiceTemplateSettings = {
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
}

const sampleCompany = {
  name: 'Acme Inc.',
  email: 'billing@acme.example',
  phone: '+1 234 567 8900',
  address: '123 Business St, City, ST 12345',
}

const sampleCustomer = {
  name: 'John Doe',
  company_name: 'ABC Corp',
  email: 'john@abc.com',
  billing_address: '456 Client Ave, Town, ST 67890',
}

const sampleItems = [
  { description: 'Consulting', quantity: 2, price: 150, tax: 30, total: 330 },
  { description: 'License Fee', quantity: 1, price: 499, tax: 99.8, total: 598.8 },
]

type InvoicePreviewProps = {
  settings: InvoiceTemplateSettings
}

export default function InvoicePreview({ settings }: InvoicePreviewProps) {
  const subtotal = sampleItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const taxTotal = sampleItems.reduce((sum, i) => sum + (i.tax ?? 0), 0)
  const total = subtotal + taxTotal

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-center text-sm font-medium text-slate-500">
        Live Preview
      </div>
      <div className="p-4 text-slate-800" style={{ fontSize: '12px' }}>
        {/* Header */}
        <div className="mb-4 flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            {settings.show_logo && (
              <div className="mb-2 flex h-10 w-20 items-center justify-center rounded bg-indigo-600 text-xs font-bold text-white">
                LOGO
              </div>
            )}
            {settings.show_company_address && (
              <div>
                <strong>{sampleCompany.name}</strong>
                <br />
                {sampleCompany.address}
                <br />
                {sampleCompany.email} | {sampleCompany.phone}
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold">INVOICE</div>
            <div>INV-2026-0001</div>
            <div>Date: 2026-03-09</div>
            <div>Due: 2026-04-09</div>
          </div>
        </div>

        {settings.show_customer_address && (
          <div className="mb-4 rounded bg-slate-50 p-3">
            <strong className="text-slate-600">Bill To</strong>
            <br />
            {sampleCustomer.name}
            <br />
            {sampleCustomer.company_name}
            <br />
            {sampleCustomer.email}
            <br />
            {sampleCustomer.billing_address}
          </div>
        )}

        {/* Items table */}
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="py-2 text-left font-medium">Description</th>
              <th className="py-2 text-right">Qty</th>
              <th className="py-2 text-right">Price</th>
              {settings.show_tax_column && (
                <th className="py-2 text-right">Tax</th>
              )}
              {settings.show_discount_column && (
                <th className="py-2 text-right">Discount</th>
              )}
              <th className="py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {sampleItems.map((item, i) => (
              <tr key={i} className="border-b border-slate-100">
                <td className="py-1.5">{item.description}</td>
                <td className="py-1.5 text-right">
                  {item.description === 'Consulting' ? 2 : 1}
                </td>
                <td className="py-1.5 text-right">{item.price}.00</td>
                {settings.show_tax_column && (
                  <td className="py-1.5 text-right">{item.tax}.00</td>
                )}
                {settings.show_discount_column && (
                  <td className="py-1.5 text-right">0.00</td>
                )}
                <td className="py-1.5 text-right">{item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-3 text-right">
          <div>Subtotal: {subtotal.toFixed(2)}</div>
          <div>Tax: {taxTotal.toFixed(2)}</div>
          <div className="font-semibold">Total: {total.toFixed(2)}</div>
        </div>

        {settings.show_payment_terms && settings.payment_terms && (
          <div className="mt-4 rounded bg-slate-50 p-2 text-slate-600">
            <strong>Payment Terms</strong>
            <br />
            {settings.payment_terms}
          </div>
        )}

        {settings.show_notes && (
          <div className="mt-3 text-slate-600">
            <strong>Notes</strong>
            <br />
            Thank you for your business.
          </div>
        )}

        {settings.show_bank_details && (
          <div className="mt-3 rounded bg-slate-50 p-2 text-slate-600">
            <strong>Bank Details</strong>
            <br />
            Account: ****1234 | Sort Code: 00-00-00
          </div>
        )}

        {settings.show_signature && (
          <div className="mt-4">
            <div>Authorized Signature</div>
            <div className="mt-1 border-b border-slate-400" style={{ width: '120px' }} />
          </div>
        )}

        {settings.show_qr_code && (
          <div className="mt-3">
            <strong>Pay with QR</strong>
            <div className="mt-1 flex h-16 w-16 items-center justify-center rounded border border-slate-200 bg-slate-50 text-xs text-slate-400">
              QR
            </div>
          </div>
        )}

        {settings.footer_text && (
          <div className="mt-4 border-t border-slate-200 pt-3 text-xs text-slate-500">
            {settings.footer_text}
          </div>
        )}
      </div>
    </div>
  )
}
