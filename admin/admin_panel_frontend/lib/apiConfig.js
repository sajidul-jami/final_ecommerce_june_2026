const trimSlash = (value = '') => value.replace(/\/$/, '')

const apiUrl = trimSlash(
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
)

const apiOrigin = apiUrl.replace(/\/api$/, '')

export const API_BASE_URL = apiUrl
export const UPLOAD_URL =
  process.env.NEXT_PUBLIC_UPLOAD_URL || `${apiOrigin}/upload`
export const PRODUCT_IMAGE_BASE_URL =
  process.env.NEXT_PUBLIC_PRODUCT_IMAGE_BASE_URL ||
  'http://localhost:9000/products/images/productsimg'
