import { createContext } from 'react'

export type AuthContextType = {
  token: string | null
  setToken: (token: string | null) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  setToken: () => {},
  logout: () => {},
})
