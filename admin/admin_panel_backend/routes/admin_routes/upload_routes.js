const express = require('express')
const router = express.Router()
const multer = require('multer')
const Minio = require('minio')

const upload = multer({ storage: multer.memoryStorage() })

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: Number(process.env.MINIO_PORT || 9000),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'admin',
  secretKey: process.env.MINIO_SECRET_KEY || 'password123'
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

    const publicBaseUrl = process.env.MINIO_PUBLIC_URL || 'http://localhost:9000'
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
