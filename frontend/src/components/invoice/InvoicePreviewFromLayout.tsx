import { GridLayout, noCompactor, useContainerWidth } from 'react-grid-layout'
import type { Layout } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import type { InvoiceLayoutItem } from '../../services/invoiceLayoutService'

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

type Props = {
  layoutItems: InvoiceLayoutItem[]
}

function InvoiceBlockByType({ componentId }: { componentId: string }) {
  const subtotal = sampleItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const taxTotal = sampleItems.reduce((sum, i) => sum + (i.tax ?? 0), 0)
  const total = subtotal + taxTotal

  switch (componentId) {
    case 'logo':
      return (
        <div className="flex h-full min-h-0 w-full items-center justify-center">
          <div className="flex h-10 w-20 items-center justify-center rounded bg-indigo-600 text-xs font-bold text-white">
            LOGO
          </div>
        </div>
      )
    case 'company_details':
      return (
        <div className="text-sm">
          <strong>{sampleCompany.name}</strong>
          <br />
          {sampleCompany.address}
          <br />
          {sampleCompany.email} | {sampleCompany.phone}
        </div>
      )
    case 'invoice_header':
      return (
        <div className="text-right text-sm">
          <div className="text-lg font-semibold">INVOICE</div>
          <div>INV-2026-0001</div>
          <div>Date: 2026-03-09</div>
          <div>Due: 2026-04-09</div>
        </div>
      )
    case 'customer_details':
      return (
        <div className="rounded bg-slate-50 p-2 text-sm">
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
      )
    case 'item_table':
    case 'items_table':
      return (
        <div className="min-h-0 overflow-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="py-1 text-left font-medium">Description</th>
                <th className="py-1 text-right">Qty</th>
                <th className="py-1 text-right">Price</th>
                <th className="py-1 text-right">Tax</th>
                <th className="py-1 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {sampleItems.map((item, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="py-1">{item.description}</td>
                  <td className="py-1 text-right">{item.description === 'Consulting' ? 2 : 1}</td>
                  <td className="py-1 text-right">{item.price}.00</td>
                  <td className="py-1 text-right">{item.tax}.00</td>
                  <td className="py-1 text-right">{item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    case 'tax_summary':
      return (
        <div className="text-right text-sm">
          <div>Tax: {taxTotal.toFixed(2)}</div>
        </div>
      )
    case 'subtotal_total':
    case 'totals':
      return (
        <div className="text-right text-sm">
          <div>Subtotal: {subtotal.toFixed(2)}</div>
          <div className="font-semibold">Total: {total.toFixed(2)}</div>
        </div>
      )
    case 'payment_terms':
      return (
        <div className="rounded bg-slate-50 p-2 text-sm text-slate-600">
          <strong>Payment Terms</strong>
          <br />
          Payment is due within 30 days.
        </div>
      )
    case 'notes':
      return (
        <div className="text-sm text-slate-600">
          <strong>Notes</strong>
          <br />
          Thank you for your business.
        </div>
      )
    case 'bank_details':
      return (
        <div className="rounded bg-slate-50 p-2 text-sm text-slate-600">
          <strong>Bank Details</strong>
          <br />
          Account: ****1234 | Sort Code: 00-00-00
        </div>
      )
    case 'signature':
      return (
        <div className="text-sm">
          <div>Authorized Signature</div>
          <div className="mt-1 border-b border-slate-400" style={{ width: '120px' }} />
        </div>
      )
    case 'qr_code':
      return (
        <div className="text-sm">
          <strong>Pay with QR</strong>
          <div className="mt-1 flex h-16 w-16 items-center justify-center rounded border border-slate-200 bg-slate-50 text-xs text-slate-400">
            QR
          </div>
        </div>
      )
    default:
      return <div className="text-slate-400 text-sm">{componentId}</div>
  }
}

export default function InvoicePreviewFromLayout({ layoutItems }: Props) {
  const visibleItems = layoutItems.filter((item) => item.visible !== false)

  const gridLayout: Layout = visibleItems.map((item) => ({
    i: item.i,
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.h,
    minW: 1,
    minH: 1,
  }))

  const { width, containerRef, mounted } = useContainerWidth({ initialWidth: 360 })

  if (visibleItems.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-center text-sm font-medium text-slate-500">
          Live Preview
        </div>
        <div className="p-4 text-center text-sm text-slate-500">No visible components in layout.</div>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="shrink-0 border-b border-slate-200 bg-slate-50 px-4 py-2 text-center text-sm font-medium text-slate-500">
        Live Preview
      </div>
      <div ref={containerRef} className="min-h-0 flex-1 overflow-auto p-3 text-slate-800" style={{ fontSize: '12px' }}>
        {mounted && (
          <GridLayout
            className="invoice-preview-grid layout"
            width={width}
            layout={gridLayout}
            gridConfig={{
              cols: 12,
              rowHeight: 48,
              margin: [6, 6],
              containerPadding: [0, 0],
              maxRows: Infinity,
            }}
            dragConfig={{ enabled: false }}
            resizeConfig={{ enabled: false }}
            compactor={noCompactor}
          >
            {visibleItems.map((item) => (
              <div key={item.i} className="min-h-0 overflow-hidden rounded border border-slate-100 bg-white p-2">
                <InvoiceBlockByType componentId={item.i} />
              </div>
            ))}
          </GridLayout>
        )}
      </div>
    </div>
  )
}
