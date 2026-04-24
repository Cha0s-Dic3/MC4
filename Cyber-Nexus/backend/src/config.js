import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '..', '.env') })

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value ?? '', 10)
  return Number.isNaN(parsed) ? fallback : parsed
}

export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: toInt(process.env.PORT, 4000),
  dbHost: process.env.DB_HOST ?? '127.0.0.1',
  dbPort: toInt(process.env.DB_PORT, 3306),
  dbUser: process.env.DB_USER ?? 'root',
  dbPassword: process.env.DB_PASSWORD ?? '',
  dbName: process.env.DB_NAME ?? 'cyber',
  adminUsername: process.env.ADMIN_USERNAME ?? 'Jehovahniss',
  adminPassword: process.env.ADMIN_PASSWORD ?? 'naomie@123',
  adminRole: process.env.ADMIN_ROLE ?? 'admin',
  authSecret: process.env.AUTH_SECRET ?? 'replace-this-secret',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  maxPoolSize: toInt(process.env.MAX_POOL_SIZE, 20),
}
