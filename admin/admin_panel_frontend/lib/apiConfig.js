// lib/apiConfig.js

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || ''

export const UPLOAD_URL =
  process.env.NEXT_PUBLIC_UPLOAD_URL || 'http://localhost:3001/upload'

export const PRODUCT_IMAGE_BASE_URL =
  process.env.NEXT_PUBLIC_PRODUCT_IMAGE_BASE_URL || 'http://localhost:9000/ecommerce'
