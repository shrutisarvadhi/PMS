import type { AuthUser, JwtPayload, UserRole } from '../types/auth'

const VALID_ROLES: readonly UserRole[] = ['Admin', 'PM', 'ProjectManager', 'Employee']

function base64UrlDecode(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')

  try {
    return decodeURIComponent(
      atob(padded)
        .split('')
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(''),
    )
  } catch (error) {
    return ''
  }
}

function isValidRole(role: unknown): role is UserRole {
  return typeof role === 'string' && (VALID_ROLES as readonly string[]).includes(role)
}

export function decodeJwt(token: string): JwtPayload | null {
  if (!token) {
    return null
  }

  const segments = token.split('.')
  if (segments.length < 2) {
    return null
  }

  const payloadSegment = segments[1]
  const decoded = base64UrlDecode(payloadSegment)

  if (!decoded) {
    return null
  }

  try {
    const parsed = JSON.parse(decoded) as JwtPayload

    if (typeof parsed.username !== 'string' || !isValidRole(parsed.role)) {
      return null
    }

    return parsed
  } catch (error) {
    return null
  }
}

export function extractAuthUser(token: string): AuthUser | null {
  const payload = decodeJwt(token)

  if (!payload) {
    return null
  }

  return {
    username: payload.username,
    role: payload.role,
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeJwt(token)

  if (!payload || !payload.exp) {
    return false
  }

  const expiresAt = payload.exp * 1000
  return Date.now() >= expiresAt
}
