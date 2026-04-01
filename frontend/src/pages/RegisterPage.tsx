import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import Button from '../components/Button'
import InputField from '../components/InputField'
import { useAuth } from '../hooks/useAuth'
import { authService, getApiErrorMessage } from '../services/authService'

function getPasswordStrength(password: string): { score: number; label: string } {
  if (!password) return { score: 0, label: '' }
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++
  const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Very strong']
  return { score: Math.min(score, 5), label: labels[Math.min(score, 5) - 1] ?? '' }
}

export default function RegisterPage() {
  const { setToken } = useAuth()
  const navigate = useNavigate()
  const [companyName, setCompanyName] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const strength = getPasswordStrength(password)

  const validate = (): boolean => {
    const next: Record<string, string> = {}
    if (!companyName.trim()) next.company_name = 'Company name is required.'
    if (!name.trim()) next.name = 'Name is required.'
    if (!email.trim()) next.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Enter a valid email.'
    if (!password) next.password = 'Password is required.'
    else if (password.length < 8) next.password = 'Password must be at least 8 characters.'
    if (password !== confirmPassword) next.confirmPassword = 'Passwords do not match.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setErrors({})
    if (!validate()) return
    setLoading(true)
    try {
      const data = await authService.register({
        company_name: companyName,
        name,
        email,
        password,
        password_confirmation: confirmPassword,
      })
      setToken(data.token)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Create your account">
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
          label="Company Name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Acme Inc."
          error={errors.company_name}
          autoComplete="organization"
        />

        <InputField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          error={errors.name}
          autoComplete="name"
        />

        <InputField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          error={errors.email}
          autoComplete="email"
        />

        <InputField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          error={errors.password}
          hint={
            password && (
              <span className={strength.score >= 3 ? 'text-green-600' : 'text-amber-600'}>
                Strength: {strength.label}
              </span>
            )
          }
          autoComplete="new-password"
        />

        <InputField
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          error={errors.confirmPassword}
          autoComplete="new-password"
        />

        <Button
          type="submit"
          fullWidth
          loading={loading}
          loadingLabel="Creating account..."
        >
          Create Account
        </Button>

        <p className="text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Sign In
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
