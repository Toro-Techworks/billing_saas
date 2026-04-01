import api from './api'

const AUTH_PREFIX = '/auth'

export type LoginPayload = {
  email: string
  password: string
}

export type RegisterPayload = {
  company_name: string
  name: string
  email: string
  password: string
  password_confirmation: string
}

export type ForgotPasswordPayload = {
  email: string
}

export type AuthResponse = {
  token: string
  user?: { id: number; name: string; email: string; role: string }
}

export type ApiError = {
  message?: string
  errors?: Record<string, string[]>
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>(`${AUTH_PREFIX}/login`, payload)
    return data
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>(`${AUTH_PREFIX}/register`, {
      tenant_name: payload.company_name,
      name: payload.name,
      email: payload.email,
      password: payload.password,
      password_confirmation: payload.password_confirmation,
    })
    return data
  },

  async forgotPassword(payload: ForgotPasswordPayload): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>(
      `${AUTH_PREFIX}/forgot-password`,
      payload
    )
    return data
  },
}

export function getApiErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const err = error as { response?: { status?: number; data?: ApiError }; message?: string }
    const status = err.response?.status
    const data = err.response?.data
    if (data?.message) return data.message
    if (data?.errors) {
      const first = Object.values(data.errors).flat()[0]
      if (first) return first
    }
    if (status === 500) return 'Server error. Check that the backend is running and migrations are up to date.'
    if (status === 404) return 'API not found. Check VITE_API_URL (e.g. http://127.0.0.1:8000/api).'
  }
  if (error && typeof error === 'object' && 'message' in error && typeof (error as { message: string }).message === 'string') {
    const msg = (error as { message: string }).message
    if (msg.includes('Network Error') || msg.includes('Failed to fetch')) {
      return 'Cannot reach server. Is the Laravel backend running at ' + (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api') + '?'
    }
  }
  return 'Something went wrong. Please try again.'
}
