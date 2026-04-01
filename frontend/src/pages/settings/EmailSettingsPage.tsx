import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import Breadcrumb from '../../components/layout/Breadcrumb'
import PageTitle from '../../components/layout/PageTitle'
import Button from '../../components/Button'
import InputField from '../../components/InputField'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import Select from '../../components/ui/Select'
import api from '../../services/api'

type EmailSettings = {
  smtp_host: string
  smtp_port: string
  smtp_username: string
  smtp_password: string
  smtp_encryption: string
  email_subject: string
  email_message: string
}

const defaultValues: EmailSettings = {
  smtp_host: '',
  smtp_port: '587',
  smtp_username: '',
  smtp_password: '',
  smtp_encryption: 'TLS',
  email_subject: 'Invoice #{invoice_number}',
  email_message: 'Please find your invoice attached.',
}

export default function EmailSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const { register, handleSubmit, reset } = useForm<EmailSettings>({
    defaultValues,
  })

  useEffect(() => {
    let cancelled = false
    api
      .get<{ data?: EmailSettings }>('/settings/email')
      .then((res) => {
        if (!cancelled && res.data?.data) reset(res.data.data)
      })
      .catch(() => {
        if (!cancelled) reset(defaultValues)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [reset])

  const onSubmit = async (data: EmailSettings) => {
    setMessage(null)
    setSaving(true)
    try {
      await api.put('/settings/email', data)
      setMessage({ type: 'success', text: 'Email settings saved successfully.' })
    } catch {
      setMessage({ type: 'error', text: 'Failed to save email settings.' })
    } finally {
      setSaving(false)
    }
  }

  const onTestEmail = async () => {
    setMessage(null)
    setTesting(true)
    try {
      await api.post('/settings/email/test')
      setMessage({ type: 'success', text: 'Test email sent. Check your inbox.' })
    } catch {
      setMessage({ type: 'error', text: 'Failed to send test email.' })
    } finally {
      setTesting(false)
    }
  }

  if (loading) {
    return (
      <>
        <Breadcrumb items={[{ label: 'Settings', to: '/settings' }, { label: 'Email Settings' }]} />
        <PageTitle title="Email Settings" description="SMTP configuration and invoice email templates." />
        <Card>
          <CardContent>
            <p className="text-slate-500">Loading...</p>
          </CardContent>
        </Card>
      </>
    )
  }

  return (
    <>
      <Breadcrumb items={[{ label: 'Settings', to: '/settings' }, { label: 'Email Settings' }]} />
      <PageTitle title="Email Settings" description="SMTP configuration and invoice email templates." />

      <form onSubmit={handleSubmit(onSubmit)}>
        {message && (
          <div
            className={`mb-4 rounded-lg p-3 text-sm ${
              message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
            }`}
            role="alert"
          >
            {message.text}
          </div>
        )}

        <Card className="mb-6">
          <CardHeader title="SMTP Configuration" />
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                label="SMTP Host"
                placeholder="smtp.example.com"
                {...register('smtp_host')}
              />
              <InputField
                label="SMTP Port"
                placeholder="587"
                {...register('smtp_port')}
              />
            </div>
            <InputField
              label="SMTP Username"
              {...register('smtp_username')}
            />
            <InputField
              label="SMTP Password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              {...register('smtp_password')}
            />
            <Select
              label="Encryption"
              options={[
                { value: 'TLS', label: 'TLS' },
                { value: 'SSL', label: 'SSL' },
                { value: 'none', label: 'None' },
              ]}
              {...register('smtp_encryption')}
            />
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader title="Invoice Email Template" />
          <CardContent className="space-y-4">
            <InputField
              label="Email Subject"
              placeholder="Invoice #{invoice_number}"
              {...register('email_subject')}
            />
            <div>
              <label className="block text-sm font-medium text-slate-700">Email Message Template</label>
              <textarea
                {...register('email_message')}
                rows={4}
                className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                placeholder="Body of the email sent with the invoice..."
              />
              <p className="mt-1 text-xs text-slate-500">You can use placeholders like {'{invoice_number}'}, {'{customer_name}'}.</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" loading={saving} loadingLabel="Saving...">
            Save Settings
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onTestEmail}
            loading={testing}
            loadingLabel="Sending..."
          >
            Test Email
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => window.history.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </>
  )
}
