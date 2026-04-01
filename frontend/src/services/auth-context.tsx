import { type ReactNode, useMemo, useState } from 'react'
import { AuthContext } from './auth-context'

const TOKEN_KEY = 'billing_saas_token'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(localStorage.getItem(TOKEN_KEY))

  const setToken = (value: string | null) => {
    if (value) {
      localStorage.setItem(TOKEN_KEY, value)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }
    setTokenState(value)
  }

  const value = useMemo(
    () => ({
      token,
      setToken,
      logout: () => setToken(null),
    }),
    [token],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
