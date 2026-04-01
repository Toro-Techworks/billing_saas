import { Link } from 'react-router-dom'
import PageTitle from '../components/layout/PageTitle'

const cardClass =
  'block rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition cursor-pointer hover:border-indigo-200 hover:shadow-md text-left'

export default function SettingsPage() {
  return (
    <>
      <PageTitle
        title="Settings"
        description="Manage company preferences and billing configuration."
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Link to="/settings/invoice-template" className={cardClass}>
          <h2 className="mb-2 text-lg font-semibold text-slate-900">Invoice Template</h2>
          <p className="text-sm text-slate-600">
            Customize invoice layout, toggles, footer, payment terms, and live preview.
          </p>
        </Link>
        <Link to="/settings/company" className={cardClass}>
          <h2 className="mb-2 text-lg font-semibold text-slate-900">Company Settings</h2>
          <p className="text-sm text-slate-600">
            Company name, address, logo, currency, invoice numbering.
          </p>
        </Link>
        <Link to="/settings/tax" className={cardClass}>
          <h2 className="mb-2 text-lg font-semibold text-slate-900">Tax Settings</h2>
          <p className="text-sm text-slate-600">
            GST, tax rates, tax groups.
          </p>
        </Link>
        <Link to="/settings/email" className={`${cardClass} md:col-span-2`}>
          <h2 className="mb-2 text-lg font-semibold text-slate-900">Email Settings</h2>
          <p className="text-sm text-slate-600">
            SMTP configuration and invoice email templates.
          </p>
        </Link>
      </div>
    </>
  )
}
