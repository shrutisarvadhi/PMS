import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { loginUser, registerUser } from '../api/auth'
import { extractAuthUser, isTokenExpired } from '../utils/jwt'
import type { AuthRequest, AuthSuccessResponse, AuthUser } from '../types/auth'

const TOKEN_STORAGE_KEY = 'authToken'

interface AuthContextValue {
  token: string | null
  user: AuthUser | null
  isAuthenticated: boolean
  isInitializing: boolean
  login: (payload: AuthRequest) => Promise<AuthSuccessResponse>
  register: (payload: AuthRequest) => Promise<AuthSuccessResponse>
  logout: () => void
  refreshFromStorage: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function persistToken(token: string | null) {
  if (typeof window === 'undefined') {
    return
  }

  if (!token) {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY)
    return
  }

  window.localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

function getStoredToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  return window.localStorage.getItem(TOKEN_STORAGE_KEY)
}

function parseToken(token: string | null): AuthUser | null {
  if (!token || isTokenExpired(token)) {
    return null
  }

  return extractAuthUser(token)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isInitializing, setIsInitializing] = useState<boolean>(true)

  const applyToken = useCallback((nextToken: string | null) => {
    const parsedUser = parseToken(nextToken)

    if (nextToken && !parsedUser) {
      persistToken(null)
      setToken(null)
      setUser(null)
      return
    }

    persistToken(nextToken)
    setToken(nextToken)
    setUser(parsedUser)
  }, [])

  const refreshFromStorage = useCallback(() => {
    const storedToken = getStoredToken()
    if (!storedToken || isTokenExpired(storedToken)) {
      applyToken(null)
    } else {
      applyToken(storedToken)
    }
    setIsInitializing(false)
  }, [applyToken])

  useEffect(() => {
    refreshFromStorage()
  }, [refreshFromStorage])

  const login = useCallback(async (payload: AuthRequest) => {
    const response = await loginUser(payload)
    applyToken(response.token)
    return response
  }, [applyToken])

  const register = useCallback(async (payload: AuthRequest) => {
    const response = await registerUser(payload)
    applyToken(response.token)
    return response
  }, [applyToken])

  const logout = useCallback(() => {
    applyToken(null)
  }, [applyToken])

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      isInitializing,
      login,
      register,
      logout,
      refreshFromStorage,
    }),
    [isInitializing, login, logout, refreshFromStorage, register, token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export { TOKEN_STORAGE_KEY }
