import { API_BASE_URL } from './api'

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token')

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || `API Error: ${response.status}`)
  }

  return response.json()
}

export const apiGet = (endpoint) => apiRequest(endpoint, { method: 'GET' })

export const apiPost = (endpoint, data) =>
  apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const apiPatch = (endpoint, data) =>
  apiRequest(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })

export const apiDelete = (endpoint) =>
  apiRequest(endpoint, { method: 'DELETE' })

export function handleApiError(error) {
  if (error.message) {
    return error.message
  }
  return 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.'
}
