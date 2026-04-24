import { verifyAccessToken } from '../auth.js'
import { config } from '../config.js'

export function requireAuth(req, res, next) {
  const authorizationHeader = req.headers.authorization ?? ''
  const [scheme, token] = authorizationHeader.split(' ')

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Authentication required.' })
  }

  const payload = verifyAccessToken(token)
  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired token.' })
  }

  req.user = payload
  return next()
}

export function requireRole(expectedRole) {
  return function enforceRole(req, res, next) {
    return requireAuth(req, res, () => {
      if (req.user.role !== expectedRole) {
        return res.status(403).json({ error: 'Insufficient permissions.' })
      }

      return next()
    })
  }
}

export function requireAdmin(req, res, next) {
  return requireRole(config.adminRole)(req, res, next)
}
