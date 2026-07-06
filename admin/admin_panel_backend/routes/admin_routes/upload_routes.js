const express = require('express')
const router = express.Router()
const multer = require('multer')
const Minio = require('minio')

const upload = multer({ storage: multer.memoryStorage() })
const requiredMinioEnv = ['MINIO_ENDPOINT', 'MINIO_ACCESS_KEY', 'MINIO_SECRET_KEY', 'MINIO_PUBLIC_URL']
const missingMinioEnv = requiredMinioEnv.filter((key) => !process.env[key])
const MINIO_BUCKET = process.env.MINIO_BUCKET || 'ecommerce'

if (missingMinioEnv.length > 0) {
  throw new Error(`Missing required MinIO environment variable(s): ${missingMinioEnv.join(', ')}`)
}

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: Number(process.env.MINIO_PORT || 9000),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY
})

const slugify = (value = '') =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'product'

const safeFileName = (fileName = '') => {
  const parts = String(fileName).split('.')
  const ext = parts.length > 1 ? parts.pop().toLowerCase().replace(/[^a-z0-9]/g, '') : ''
  const base = slugify(parts.join('.') || fileName)
  const suffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
  return `${base}-${suffix}${ext ? `.${ext}` : ''}`
}

const uploadFiles = async (files, req) => {
  const productSlug = slugify(req.body.productName || req.body.product_name || req.body.name)
  const folder = slugify(req.body.folder || productSlug)
  const type = req.body.type === 'brand-logo'
    ? 'logo/brands'
    : req.body.type === 'website-logo'
      ? 'logo/website'
      : req.body.type === 'slideshow'
        ? 'slideshow'
        : `products/${folder}`
  const publicBaseUrl = process.env.MINIO_PUBLIC_URL.replace(/\/$/, '')

  const uploaded = []

  for (const file of files) {
    const objectKey = `${type}/${safeFileName(file.originalname)}`

    await minioClient.putObject(
      MINIO_BUCKET,
      objectKey,
      file.buffer,
      file.size,
      { 'Content-Type': file.mimetype }
    )

    uploaded.push({
      fileName: objectKey,
      objectKey,
      url: `${publicBaseUrl}/${MINIO_BUCKET}/${objectKey}`,
      originalName: file.originalname
    })
  }

  return uploaded
}

// =========================
// IMAGE UPLOAD
// =========================
router.post('/', upload.fields([{ name: 'photos', maxCount: 12 }, { name: 'photo', maxCount: 1 }]), async (req, res) => {
  try {
    const files = [
      ...(req.files?.photos || []),
      ...(req.files?.photo || [])
    ]

    if (!files.length) {
      return res.status(400).json({ success: false, message: 'No file' })
    }

    const uploaded = await uploadFiles(files, req)
    const first = uploaded[0]

    res.json({
      success: true,
      url: first.url,
      fileName: first.fileName,
      files: uploaded
    })

  } catch (err) {
    console.error('Upload failed:', err.message)
    res.status(500).json({ success: false, message: err.message || 'Upload failed' })
  }
})

router.post('/single', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file' })
    }

    const uploaded = await uploadFiles([req.file], req)
    res.json({
      success: true,
      url: uploaded[0].url,
      fileName: uploaded[0].fileName,
      files: uploaded
    })
  } catch (err) {
    console.error('Upload failed:', err.message)
    res.status(500).json({ success: false, message: err.message || 'Upload failed' })
  }
})

module.exports = router
