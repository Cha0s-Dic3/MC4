const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function asNonEmptyString(value) {
  if (typeof value !== 'string') return ''
  return value.trim()
}

export function ensure(value, message) {
  if (!value) {
    const error = new Error(message)
    error.statusCode = 400
    throw error
  }
}

export function isValidEmail(email) {
  return EMAIL_REGEX.test(email)
}

export function parsePagination(query) {
  const page = Math.max(Number.parseInt(query.page ?? '1', 10) || 1, 1)
  const limit = Math.min(Math.max(Number.parseInt(query.limit ?? '10', 10) || 10, 1), 100)
  const offset = (page - 1) * limit
  return { page, limit, offset }
}
