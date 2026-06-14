const BASE_URL = import.meta.env.VITE_API_BASE_URL

let authToken = null
let onUnauthorized = null

export function setAuthToken(token) {
  authToken = token
}

export function setOnUnauthorized(handler) {
  onUnauthorized = handler
}

export async function apiFetch(path, options = {}) {
  const headers = { ...(options.headers || {}) }

  if (options.body !== undefined && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }

  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (response.status === 401 && onUnauthorized) {
    onUnauthorized()
  }

  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    const error = new Error(data?.message || 'Une erreur est survenue.')
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}
