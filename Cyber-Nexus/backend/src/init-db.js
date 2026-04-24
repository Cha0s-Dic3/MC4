import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { pool } from './db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function splitSqlStatements(sqlText) {
  return sqlText
    .split(';')
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0)
}

async function run() {
  const schemaPath = path.resolve(__dirname, '..', 'sql', 'schema.sql')
  const seedPath = path.resolve(__dirname, '..', 'sql', 'seed.sql')

  const schemaSql = fs.readFileSync(schemaPath, 'utf8')
  const seedSql = fs.readFileSync(seedPath, 'utf8')

  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    for (const statement of splitSqlStatements(schemaSql)) {
      await connection.query(statement)
    }

    for (const statement of splitSqlStatements(seedSql)) {
      await connection.query(statement)
    }

    await connection.commit()
    console.log('Database initialized successfully.')
  } catch (error) {
    await connection.rollback()
    console.error('Database initialization failed.', error)
    process.exitCode = 1
  } finally {
    connection.release()
    await pool.end()
  }
}

run()
