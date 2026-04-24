import mysql from 'mysql2/promise'
import { config } from './config.js'

export const pool = mysql.createPool({
  host: config.dbHost,
  port: config.dbPort,
  user: config.dbUser,
  password: config.dbPassword,
  database: config.dbName,
  waitForConnections: true,
  connectionLimit: config.maxPoolSize,
  queueLimit: 0,
  charset: 'utf8mb4',
})

export async function query(text, params = []) {
  const [rows] = await pool.execute(text, params)
  return { rows: Array.isArray(rows) ? rows : [] }
}

export async function execute(text, params = []) {
  const [result] = await pool.execute(text, params)
  return result
}
