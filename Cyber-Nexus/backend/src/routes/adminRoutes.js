import express from 'express'
import path from 'node:path'
import { execute, query } from '../db.js'
import { requireAdmin } from '../middleware/requireAuth.js'
import { uploadCvPdf, uploadProjectImage } from '../upload.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { asNonEmptyString, ensure, isValidEmail, parsePagination } from '../utils/validation.js'

export const adminRouter = express.Router()

adminRouter.use(requireAdmin)

adminRouter.get('/projects', asyncHandler(async (req, res) => {
  const { limit, offset, page } = parsePagination(req.query)
  const [{ rows }, { rows: totalRows }] = await Promise.all([
    query(
      `SELECT id, title, description, live_link, image_url, created_at, updated_at
       FROM projects
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset],
    ),
    query('SELECT COUNT(*) AS total FROM projects'),
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

adminRouter.get('/overview', asyncHandler(async (_req, res) => {
  const [projects, messages, unreadMessages, comments, about] = await Promise.all([
    query('SELECT COUNT(*) AS count FROM projects'),
    query('SELECT COUNT(*) AS count FROM messages'),
    query('SELECT COUNT(*) AS count FROM messages WHERE is_read = 0'),
    query('SELECT COUNT(*) AS count FROM project_comments'),
    query('SELECT updated_at FROM about_content WHERE id = 1'),
  ])

  res.json({
    projects: Number(projects.rows[0].count),
    messages: Number(messages.rows[0].count),
    unreadMessages: Number(unreadMessages.rows[0].count),
    comments: Number(comments.rows[0].count),
    aboutLastUpdated: about.rows[0]?.updated_at ?? null,
  })
}))

adminRouter.post('/projects', uploadProjectImage.single('image'), asyncHandler(async (req, res) => {
  const title = asNonEmptyString(req.body.title)
  const description = asNonEmptyString(req.body.description)
  const liveLink = asNonEmptyString(req.body.liveLink)

  ensure(title, 'Title is required')
  ensure(description, 'Description is required')
  ensure(liveLink, 'Live link is required')
  ensure(req.file, 'Project image file is required')

  const imageUrl = `/uploads/project-images/${req.file.filename}`

  const insertResult = await execute(
    `INSERT INTO projects (title, description, live_link, image_url)
     VALUES (?, ?, ?, ?)`,
    [title, description, liveLink, imageUrl],
  )

  const { rows } = await query(
    `SELECT id, title, description, live_link, image_url, created_at, updated_at
     FROM projects
     WHERE id = ?`,
    [insertResult.insertId],
  )

  res.status(201).json(rows[0])
}))

adminRouter.put('/projects/:projectId', uploadProjectImage.single('image'), asyncHandler(async (req, res) => {
  const projectId = Number.parseInt(req.params.projectId, 10)
  ensure(Number.isInteger(projectId) && projectId > 0, 'Invalid project id')

  const existing = await query('SELECT id, image_url FROM projects WHERE id = ?', [projectId])
  if (!existing.rows[0]) {
    return res.status(404).json({ error: 'Project not found' })
  }

  const title = asNonEmptyString(req.body.title)
  const description = asNonEmptyString(req.body.description)
  const liveLink = asNonEmptyString(req.body.liveLink)

  ensure(title, 'Title is required')
  ensure(description, 'Description is required')
  ensure(liveLink, 'Live link is required')

  const imageUrl = req.file
    ? `/uploads/project-images/${req.file.filename}`
    : existing.rows[0].image_url

  const updateResult = await execute(
    `UPDATE projects
     SET title = ?, description = ?, live_link = ?, image_url = ?, updated_at = NOW()
     WHERE id = ?`,
    [title, description, liveLink, imageUrl, projectId],
  )

  if (updateResult.affectedRows === 0) {
    return res.status(404).json({ error: 'Project not found' })
  }

  const { rows } = await query(
    `SELECT id, title, description, live_link, image_url, created_at, updated_at
     FROM projects
     WHERE id = ?`,
    [projectId],
  )

  res.json(rows[0])
}))

adminRouter.delete('/projects/:projectId', asyncHandler(async (req, res) => {
  const projectId = Number.parseInt(req.params.projectId, 10)
  ensure(Number.isInteger(projectId) && projectId > 0, 'Invalid project id')

  const deleted = await execute('DELETE FROM projects WHERE id = ?', [projectId])
  if (deleted.affectedRows === 0) {
    return res.status(404).json({ error: 'Project not found' })
  }

  return res.status(204).send()
}))

adminRouter.get('/messages', asyncHandler(async (req, res) => {
  const { limit, offset, page } = parsePagination(req.query)
  const [{ rows }, { rows: totalRows }] = await Promise.all([
    query(
      `SELECT id, sender_name, sender_email, sender_contact, message, is_read, created_at
       FROM messages
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset],
    ),
    query('SELECT COUNT(*) AS total FROM messages'),
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

adminRouter.get('/messages/:messageId', asyncHandler(async (req, res) => {
  const messageId = Number.parseInt(req.params.messageId, 10)
  ensure(Number.isInteger(messageId) && messageId > 0, 'Invalid message id')

  const { rows } = await query(
    `SELECT id, sender_name, sender_email, sender_contact, message, is_read, created_at
     FROM messages
     WHERE id = ?`,
    [messageId],
  )

  if (!rows[0]) {
    return res.status(404).json({ error: 'Message not found' })
  }

  return res.json(rows[0])
}))

adminRouter.patch('/messages/:messageId/read', asyncHandler(async (req, res) => {
  const messageId = Number.parseInt(req.params.messageId, 10)
  ensure(Number.isInteger(messageId) && messageId > 0, 'Invalid message id')

  const isRead = Boolean(req.body.isRead)

  const updated = await execute(
    `UPDATE messages
     SET is_read = ?
     WHERE id = ?`,
    [isRead ? 1 : 0, messageId],
  )

  if (updated.affectedRows === 0) {
    return res.status(404).json({ error: 'Message not found' })
  }

  const { rows } = await query(
    `SELECT id, sender_name, sender_email, sender_contact, message, is_read, created_at
     FROM messages
     WHERE id = ?`,
    [messageId],
  )

  return res.json(rows[0])
}))

adminRouter.delete('/messages/:messageId', asyncHandler(async (req, res) => {
  const messageId = Number.parseInt(req.params.messageId, 10)
  ensure(Number.isInteger(messageId) && messageId > 0, 'Invalid message id')

  const deleted = await execute('DELETE FROM messages WHERE id = ?', [messageId])
  if (deleted.affectedRows === 0) {
    return res.status(404).json({ error: 'Message not found' })
  }

  return res.status(204).send()
}))

adminRouter.get('/comments/grouped', asyncHandler(async (_req, res) => {
  const { rows } = await query(
    `SELECT p.id AS project_id,
            p.title,
            COUNT(c.id) AS comment_count,
            MAX(c.created_at) AS latest_comment_at
     FROM projects p
     LEFT JOIN project_comments c ON p.id = c.project_id
     GROUP BY p.id, p.title
     ORDER BY comment_count DESC, p.created_at DESC`,
  )

  return res.json(rows)
}))

adminRouter.get('/comments/project/:projectId', asyncHandler(async (req, res) => {
  const projectId = Number.parseInt(req.params.projectId, 10)
  ensure(Number.isInteger(projectId) && projectId > 0, 'Invalid project id')

  const { rows } = await query(
    `SELECT id, project_id, commenter_name, commenter_email, comment, created_at
     FROM project_comments
     WHERE project_id = ?
     ORDER BY created_at DESC`,
    [projectId],
  )

  return res.json(rows)
}))

adminRouter.delete('/comments/:commentId', asyncHandler(async (req, res) => {
  const commentId = Number.parseInt(req.params.commentId, 10)
  ensure(Number.isInteger(commentId) && commentId > 0, 'Invalid comment id')

  const deleted = await execute('DELETE FROM project_comments WHERE id = ?', [commentId])
  if (deleted.affectedRows === 0) {
    return res.status(404).json({ error: 'Comment not found' })
  }

  return res.status(204).send()
}))

adminRouter.get('/about', asyncHandler(async (_req, res) => {
  const { rows } = await query('SELECT id, headline, body, updated_at FROM about_content WHERE id = 1')
  return res.json(rows[0] ?? null)
}))

adminRouter.put('/about', asyncHandler(async (req, res) => {
  const headline = asNonEmptyString(req.body.headline)
  const body = asNonEmptyString(req.body.body)
  ensure(headline, 'Headline is required')
  ensure(body, 'Body is required')

  await execute(
    `INSERT INTO about_content (id, headline, body, updated_at)
     VALUES (1, ?, ?, NOW())
     ON DUPLICATE KEY UPDATE
       headline = VALUES(headline),
       body = VALUES(body),
       updated_at = NOW()`,
    [headline, body],
  )

  const { rows } = await query('SELECT id, headline, body, updated_at FROM about_content WHERE id = 1')
  return res.json(rows[0])
}))

adminRouter.delete('/about', asyncHandler(async (_req, res) => {
  await execute(
    `INSERT INTO about_content (id, headline, body, updated_at)
     VALUES (1, 'About Naomie', '', NOW())
     ON DUPLICATE KEY UPDATE
       headline = VALUES(headline),
       body = VALUES(body),
       updated_at = NOW()`,
  )

  return res.status(204).send()
}))

adminRouter.get('/cv', asyncHandler(async (_req, res) => {
  const { rows } = await query(
    `SELECT id, file_name, storage_path, mime_type, file_size_bytes, is_active, uploaded_at
     FROM cv_documents
     ORDER BY uploaded_at DESC`,
  )

  return res.json(rows)
}))

adminRouter.post('/cv', uploadCvPdf.single('cv'), asyncHandler(async (req, res) => {
  ensure(req.file, 'PDF CV file is required')

  await execute('UPDATE cv_documents SET is_active = 0 WHERE is_active = 1')

  const storagePath = path.join('uploads', 'cv', req.file.filename).replaceAll('\\', '/')
  const insertResult = await execute(
    `INSERT INTO cv_documents (file_name, storage_path, mime_type, file_size_bytes, is_active)
     VALUES (?, ?, ?, ?, 1)`,
    [req.file.originalname, storagePath, req.file.mimetype, req.file.size],
  )

  const { rows } = await query(
    `SELECT id, file_name, storage_path, mime_type, file_size_bytes, is_active, uploaded_at
     FROM cv_documents
     WHERE id = ?`,
    [insertResult.insertId],
  )

  return res.status(201).json(rows[0])
}))

adminRouter.patch('/comments/:commentId', asyncHandler(async (req, res) => {
  const commentId = Number.parseInt(req.params.commentId, 10)
  ensure(Number.isInteger(commentId) && commentId > 0, 'Invalid comment id')

  const comment = asNonEmptyString(req.body.comment)
  const commenterName = asNonEmptyString(req.body.name)
  const commenterEmail = asNonEmptyString(req.body.email) || null

  ensure(comment, 'Comment is required')
  ensure(commenterName, 'Name is required')
  if (commenterEmail) ensure(isValidEmail(commenterEmail), 'Email format is invalid')

  const updated = await execute(
    `UPDATE project_comments
     SET commenter_name = ?, commenter_email = ?, comment = ?
     WHERE id = ?`,
    [commenterName, commenterEmail, comment, commentId],
  )

  if (updated.affectedRows === 0) {
    return res.status(404).json({ error: 'Comment not found' })
  }

  const { rows } = await query(
    `SELECT id, project_id, commenter_name, commenter_email, comment, created_at
     FROM project_comments
     WHERE id = ?`,
    [commentId],
  )

  return res.json(rows[0])
}))
