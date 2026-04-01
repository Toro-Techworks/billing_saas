import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import Button from '../components/Button'
import InputField from '../components/InputField'
import { authService, getApiErrorMessage } from '../services/authService'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setSuccess(false)
    if (!email.trim()) {
      setError('Email is required.')
      return
    }
    setLoading(true)
    try {
      await authService.forgotPassword({ email })
      setSuccess(true)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Reset your password">
      {success ? (
        <div className="space-y-4">
          <div
            className="rounded-lg bg-green-50 p-4 text-sm text-green-800"
            role="status"
          >
            If an account exists with that email, we&apos;ve sent a password reset
            link. Please check your inbox.
          </div>
          <Link
            to="/login"
            className="block text-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Back to Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5">
          {error && (
            <div
              className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
              role="alert"
            >
              {error}
            </div>
          )}

          <InputField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />

          <Button
            type="submit"
            fullWidth
            loading={loading}
            loadingLabel="Sending..."
          >
            Send reset link
          </Button>

          <p className="text-center text-sm text-slate-600">
            Remember your password?{' '}
            <Link
              to="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Sign In
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  )
}
