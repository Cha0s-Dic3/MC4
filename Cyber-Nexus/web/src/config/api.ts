// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export const API_ENDPOINTS = {
  health: `${API_BASE_URL}/api/health`,
  // Add more endpoints as needed
}

// Fetch with default headers
export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  const response = await fetch(endpoint, {
    ...options,
    headers: defaultHeaders,
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}
