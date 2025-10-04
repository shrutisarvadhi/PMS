import { TOKEN_STORAGE_KEY } from '../context/AuthContext'
import { handleApiError } from '../utils/error'

const DEFAULT_API_BASE_URL = 'http://localhost:5000/api'
const API_BASE_URL = (import.meta.env?.VITE_API_URL as string | undefined) ?? DEFAULT_API_BASE_URL

interface RequestOptions extends RequestInit {
  skipAuth?: boolean
}

type HandledError = Error & { alreadyHandled?: boolean; status?: number }

function buildHeaders(options: RequestOptions, hasBody: boolean, token: string | null): Headers {
  const headers = new Headers(options.headers ?? {})

  if (hasBody && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (!options.skipAuth && token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  return headers
}

export async function apiRequest<T>(endpoint: string, options: RequestOptions = {}, fallbackMessage = 'Request failed'): Promise<T> {
  const token = typeof window !== 'undefined' ? window.localStorage.getItem(TOKEN_STORAGE_KEY) : null
  const hasBody = options.body !== undefined && !(options.body instanceof FormData)
  const headers = buildHeaders(options, hasBody, token)

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    const parseResponse = async () => {
      if (response.status === 204) {
        return null as T
      }

      const text = await response.text()
      return text ? (JSON.parse(text) as T) : (null as T)
    }

    if (!response.ok) {
      const errorBody = await parseResponse().catch(() => ({}))
      const message =
        (errorBody && typeof errorBody === 'object' && 'message' in errorBody && typeof (errorBody as Record<string, unknown>).message === 'string'
          ? ((errorBody as Record<string, unknown>).message as string)
          : fallbackMessage)

      const handled = handleApiError(new Error(message), message, {
        endpoint,
        status: response.status,
      }) as HandledError

      handled.alreadyHandled = true
      handled.status = response.status
      throw handled
    }

    return (await parseResponse()) as T
  } catch (error) {
    if (error instanceof Error && (error as HandledError).alreadyHandled) {
      throw error
    }

    const handled = handleApiError(error, fallbackMessage, {
      endpoint,
      method: options.method ?? 'GET',
    }) as HandledError
    handled.alreadyHandled = true
    throw handled
  }
}

export { API_BASE_URL }
