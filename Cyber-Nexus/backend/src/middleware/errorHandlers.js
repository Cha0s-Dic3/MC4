export function notFound(_req, res) {
  return res.status(404).json({ error: 'Route not found' })
}

export function errorHandler(error, _req, res, _next) {
  console.error(error)
  return res.status(error.statusCode ?? 500).json({
    error: error.message ?? 'Internal server error',
  })
}
