const express = require('express')
const router = express.Router()
const multer = require('multer')
const Minio = require('minio')

const upload = multer({ storage: multer.memoryStorage() })
const requiredMinioEnv = ['MINIO_ENDPOINT', 'MINIO_ACCESS_KEY', 'MINIO_SECRET_KEY', 'MINIO_PUBLIC_URL']
const missingMinioEnv = requiredMinioEnv.filter((key) => !process.env[key])

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

// =========================
// IMAGE UPLOAD (NEW)
// =========================
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const file = req.file

    if (!file) {
      return res.status(400).json({ success: false, message: 'No file' })
    }

    const fileName =
      `images/productsimg/${file.originalname}`

    await minioClient.putObject(
      'products',
      fileName,
      file.buffer,
      file.size,
      { 'Content-Type': file.mimetype }
    )

    const publicBaseUrl = process.env.MINIO_PUBLIC_URL
    const url = `${publicBaseUrl.replace(/\/$/, '')}/products/${fileName}`

    res.json({
      success: true,
      url,
      fileName: file.originalname
    })

  } catch (err) {
    console.error('Upload failed:', err.message)
    res.status(500).json({ success: false, message: err.message || 'Upload failed' })
  }
})

module.exports = router
