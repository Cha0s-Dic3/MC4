import crypto from 'node:crypto'
import { config } from './config.js'

const TOKEN_TTL_MS = 8 * 60 * 60 * 1000

function base64UrlEncode(value) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function base64UrlDecode(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4))
  return Buffer.from(`${normalized}${padding}`, 'base64').toString('utf8')
}

function signPayload(payload) {
  return crypto.createHmac('sha256', config.authSecret).update(payload).digest('base64url')
}

function safeStringEqual(left, right) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)
  if (leftBuffer.length !== rightBuffer.length) {
    return false
  }
  return crypto.timingSafeEqual(leftBuffer, rightBuffer)
}

export function authenticateAdminCredentials(username, password) {
  return (
    safeStringEqual(username, config.adminUsername) &&
    safeStringEqual(password, config.adminPassword)
  )
}

export function createAccessToken(user) {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  }

  const payload = {
    sub: user.username,
    role: user.role,
    exp: Date.now() + TOKEN_TTL_MS,
  }

  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  const signatureInput = `${encodedHeader}.${encodedPayload}`
  const signature = signPayload(signatureInput)
  return `${signatureInput}.${signature}`
}

export function verifyAccessToken(token) {
  try {
    const [encodedHeader, encodedPayload, signature] = token.split('.')
    if (!encodedHeader || !encodedPayload || !signature) {
      return null
    }

    const expectedSignature = signPayload(`${encodedHeader}.${encodedPayload}`)
    if (!safeStringEqual(signature, expectedSignature)) {
      return null
    }

    const header = JSON.parse(base64UrlDecode(encodedHeader))
    if (header?.alg !== 'HS256' || header?.typ !== 'JWT') {
      return null
    }

    const payload = JSON.parse(base64UrlDecode(encodedPayload))
    if (!payload.exp || payload.exp < Date.now()) {
      return null
    }

    return payload
  } catch {
    return null
  }
}
