import { useContext } from 'react'
import type { AuthContextType } from '../services/auth-context'
import { AuthContext } from '../services/auth-context'

export function useAuth(): AuthContextType {
  const value = useContext(AuthContext) as AuthContextType
  return value
}
