import type { AuthErrorResponse, AuthRequest, AuthSuccessResponse } from '../types/auth'
import { handleApiError } from '../utils/error'

const DEFAULT_BASE_URL = 'http://localhost:5000/api/auth' // Update if backend URL changes
const BASE_URL = (import.meta.env?.VITE_AUTH_URL as string | undefined) ?? DEFAULT_BASE_URL

async function request(path: string, payload: AuthRequest): Promise<AuthSuccessResponse> {
  let response: Response
  console.log("path:",path);
  
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    console.log("response:",response);
    
  } catch (networkError) {
    throw handleApiError(networkError, 'Unable to reach the server. Check your connection and try again.', {
      path,
      username: payload.username,
    })
  }

  const data = (await response.json().catch(() => ({}))) as AuthSuccessResponse | AuthErrorResponse | Record<string, never>

  if (!response.ok) {
    const message = (data as AuthErrorResponse)?.message || (data as AuthErrorResponse)?.error || 'Something went wrong. Please try again.'
    throw handleApiError(new Error(message), message, {
      path,
      status: response.status,
      username: payload.username,
    })
  }

  if (!('token' in data) || typeof (data as AuthSuccessResponse).token !== 'string') {
    throw handleApiError(new Error('Unexpected response from server.'), 'Unexpected response from server.', {
      path,
    })
  }

  return data as AuthSuccessResponse
}

export async function registerUser(payload: AuthRequest): Promise<AuthSuccessResponse> {
  return request('/register', payload)
}

export async function loginUser(payload: AuthRequest): Promise<AuthSuccessResponse> {
  return request('/login', payload)
}

