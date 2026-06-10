import { API_BASE_URL } from './apiConfig'

const BASE_URL = API_BASE_URL

export const apiRequest = async (endpoint, options = {}) => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)
  const hasBody = options.body !== undefined && options.body !== null
  const body =
    hasBody && typeof options.body !== 'string'
      ? JSON.stringify(options.body)
      : options.body

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      credentials: 'include',
      signal: controller.signal,
      body
    })

    clearTimeout(timeout)

    let data
    const contentType = response.headers.get('content-type')

    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
    } else {
      data = await response.text()
    }

    if (!response.ok) {
      const message =
        typeof data === 'object'
          ? data.message || data.err?.message || data.err
          : data

      throw new Error(message || `HTTP Error ${response.status}`)
    }

    return data

  } catch (error) {
    clearTimeout(timeout)

    if (error.name === 'AbortError') {
      throw new Error('Request timeout. Server is not responding.')
    }

    if (error.message === 'Failed to fetch') {
      throw new Error('Network error. Please check server connection.')
    }

    throw new Error(error.message || 'Unexpected error occurred')
  }
}
