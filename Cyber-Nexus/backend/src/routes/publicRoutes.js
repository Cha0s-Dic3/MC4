import express from 'express'
import path from 'node:path'
import { authenticateAdminCredentials, createAccessToken, verifyAccessToken } from '../auth.js'
import { config } from '../config.js'
import { execute, query } from '../db.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { asNonEmptyString, ensure, isValidEmail, parsePagination } from '../utils/validation.js'

export const publicRouter = express.Router()

publicRouter.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'cyber-nexus-backend' })
})

publicRouter.post('/auth/login', asyncHandler(async (req, res) => {
  const username = asNonEmptyString(req.body.username)
  const password = asNonEmptyString(req.body.password)

  ensure(username, 'Username is required')
  ensure(password, 'Password is required')

  if (!authenticateAdminCredentials(username, password)) {
    return res.status(401).json({ error: 'Invalid username or password.' })
  }

  const user = {
    username: config.adminUsername,
    role: config.adminRole,
  }

  const accessToken = createAccessToken(user)

  return res.json({
    accessToken,
    tokenType: 'Bearer',
    user,
  })
}))

publicRouter.get('/auth/me', asyncHandler(async (req, res) => {
  const authorizationHeader = req.headers.authorization ?? ''
  const [scheme, token] = authorizationHeader.split(' ')

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Authentication required.' })
  }

  const payload = verifyAccessToken(token)
  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired token.' })
  }

  return res.json({
    user: {
      username: payload.sub,
      role: payload.role,
    },
    expiresAt: payload.exp,
  })
}))

publicRouter.get('/projects', asyncHandler(async (req, res) => {
  const { limit, offset, page } = parsePagination(req.query)

  const [{ rows: projects }, { rows: totalRows }] = await Promise.all([
    query(
      `SELECT p.id, p.title, p.description, p.live_link, p.image_url, p.created_at,
       COALESCE(c.comment_count, 0) AS comment_count
       FROM projects p
       LEFT JOIN (
         SELECT project_id, COUNT(*) AS comment_count
         FROM project_comments
         GROUP BY project_id
       ) c ON c.project_id = p.id
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset],
    ),
    query('SELECT COUNT(*) AS total FROM projects'),
  ])

  res.json({
    data: projects,
    pagination: {
      page,
      limit,
      total: Number(totalRows[0]?.total ?? 0),
    },
  })
}))

publicRouter.get('/projects/:projectId', asyncHandler(async (req, res) => {
  const projectId = Number.parseInt(req.params.projectId, 10)
  ensure(Number.isInteger(projectId) && projectId > 0, 'Invalid project id')

  const { rows } = await query(
    `SELECT p.id, p.title, p.description, p.live_link, p.image_url, p.created_at,
     COALESCE(c.comment_count, 0) AS comment_count
     FROM projects p
     LEFT JOIN (
       SELECT project_id, COUNT(*) AS comment_count
       FROM project_comments
       GROUP BY project_id
     ) c ON c.project_id = p.id
     WHERE p.id = ?`,
    [projectId],
  )

  if (!rows[0]) {
    return res.status(404).json({ error: 'Project not found' })
  }

  return res.json(rows[0])
}))

publicRouter.get('/projects/:projectId/comments', asyncHandler(async (req, res) => {
  const projectId = Number.parseInt(req.params.projectId, 10)
  ensure(Number.isInteger(projectId) && projectId > 0, 'Invalid project id')

  const { limit, offset, page } = parsePagination(req.query)
  const [{ rows }, { rows: totalRows }] = await Promise.all([
    query(
      `SELECT id, project_id, commenter_name, commenter_email, comment, created_at
       FROM project_comments
       WHERE project_id = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [projectId, limit, offset],
    ),
    query('SELECT COUNT(*) AS total FROM project_comments WHERE project_id = ?', [projectId]),
  ])

  res.json({
    data: rows,
    pagination: {
      page,
      limit,
      total: Number(totalRows[0]?.total ?? 0),
    },
  })
}))

publicRouter.post('/projects/:projectId/comments', asyncHandler(async (req, res) => {
  const projectId = Number.parseInt(req.params.projectId, 10)
  ensure(Number.isInteger(projectId) && projectId > 0, 'Invalid project id')

  const commenterName = asNonEmptyString(req.body.name)
  const commenterEmail = asNonEmptyString(req.body.email) || null
  const comment = asNonEmptyString(req.body.comment)

  ensure(commenterName, 'Name is required')
  ensure(comment, 'Comment is required')
  if (commenterEmail) ensure(isValidEmail(commenterEmail), 'Email format is invalid')

  const projectExists = await query('SELECT id FROM projects WHERE id = ?', [projectId])
  if (!projectExists.rows[0]) {
    return res.status(404).json({ error: 'Project not found' })
  }

  const insertResult = await execute(
    `INSERT INTO project_comments (project_id, commenter_name, commenter_email, comment)
     VALUES (?, ?, ?, ?)`,
    [projectId, commenterName, commenterEmail, comment],
  )

  const { rows } = await query(
    `SELECT id, project_id, commenter_name, commenter_email, comment, created_at
     FROM project_comments
     WHERE id = ?`,
    [insertResult.insertId],
  )

  return res.status(201).json(rows[0])
}))

publicRouter.post('/messages', asyncHandler(async (req, res) => {
  const senderName = asNonEmptyString(req.body.name)
  const senderEmail = asNonEmptyString(req.body.email) || null
  const senderContact = asNonEmptyString(req.body.contact) || null
  const message = asNonEmptyString(req.body.message)

  ensure(senderName, 'Name is required')
  ensure(message, 'Message is required')
  ensure(senderEmail || senderContact, 'Provide either email or contact')
  if (senderEmail) ensure(isValidEmail(senderEmail), 'Email format is invalid')

  const insertResult = await execute(
    `INSERT INTO messages (sender_name, sender_email, sender_contact, message)
     VALUES (?, ?, ?, ?)`,
    [senderName, senderEmail, senderContact, message],
  )

  const { rows } = await query(
    `SELECT id, sender_name, sender_email, sender_contact, message, is_read, created_at
     FROM messages
     WHERE id = ?`,
    [insertResult.insertId],
  )

  return res.status(201).json(rows[0])
}))

publicRouter.get('/about', asyncHandler(async (_req, res) => {
  const { rows } = await query('SELECT id, headline, body, updated_at FROM about_content WHERE id = 1')
  return res.json(rows[0] ?? null)
}))

publicRouter.get('/cv/download', asyncHandler(async (_req, res) => {
  const { rows } = await query(
    `SELECT file_name, storage_path, mime_type
     FROM cv_documents
     WHERE is_active = 1
     ORDER BY uploaded_at DESC
     LIMIT 1`,
  )

  const cv = rows[0]
  if (!cv) {
    return res.status(404).json({ error: 'No CV uploaded yet.' })
  }

  const filePath = path.resolve(process.cwd(), cv.storage_path)
  return res.download(filePath, cv.file_name, {
    headers: {
      'Content-Type': cv.mime_type,
    },
  })
}))
