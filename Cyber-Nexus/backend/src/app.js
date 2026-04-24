import compression from 'compression'
import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import pinoHttp from 'pino-http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { config } from './config.js'
import { errorHandler, notFound } from './middleware/errorHandlers.js'
import { adminRouter } from './routes/adminRoutes.js'
import { publicRouter } from './routes/publicRoutes.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const publicPath = path.resolve(__dirname, '..', 'public')
const uploadsPath = path.resolve(__dirname, '..', 'uploads')

export const app = express()

app.use(pinoHttp())
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}))
app.use(compression())
app.use(cors({ origin: config.corsOrigin }))

app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true, limit: '2mb' }))

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
})

app.use('/api', apiLimiter)

app.use('/uploads', express.static(uploadsPath))
app.use('/admin-panel', express.static(path.join(publicPath, 'admin-panel')))

app.use('/api', publicRouter)
app.use('/api/admin-panel', adminRouter)

app.get('/admin-panel', (_req, res) => {
  res.sendFile(path.join(publicPath, 'admin-panel', 'index.html'))
})

app.use(notFound)
app.use(errorHandler)
