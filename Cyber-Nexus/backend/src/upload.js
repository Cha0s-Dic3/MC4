import fs from 'node:fs'
import path from 'node:path'
import multer from 'multer'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const uploadsRoot = path.resolve(__dirname, '..', 'uploads')
const projectImagesDir = path.join(uploadsRoot, 'project-images')
const cvDir = path.join(uploadsRoot, 'cv')

for (const dir of [uploadsRoot, projectImagesDir, cvDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

const imageStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, projectImagesDir),
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname || '').toLowerCase()
    const baseName = path
      .basename(file.originalname || 'image', extension)
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 60)
    const safeName = `${Date.now()}-${baseName || 'image'}${extension || '.jpg'}`
    cb(null, safeName)
  },
})

const cvStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, cvDir),
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname || '').toLowerCase() || '.pdf'
    const baseName = path
      .basename(file.originalname || 'cv', extension)
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 60)
    const safeName = `${Date.now()}-${baseName || 'cv'}${extension}`
    cb(null, safeName)
  },
})

const imageFileFilter = (_req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    cb(new Error('Only image files are allowed for project uploads.'))
    return
  }
  cb(null, true)
}

const cvFileFilter = (_req, file, cb) => {
  if (file.mimetype !== 'application/pdf') {
    cb(new Error('Only PDF files are allowed for CV uploads.'))
    return
  }
  cb(null, true)
}

export const uploadProjectImage = multer({
  storage: imageStorage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: imageFileFilter,
})

export const uploadCvPdf = multer({
  storage: cvStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: cvFileFilter,
})
