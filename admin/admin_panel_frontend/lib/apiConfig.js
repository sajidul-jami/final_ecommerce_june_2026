const trimSlash = (value = '') => value.replace(/\/$/, '')

const requiredPublicEnv = [
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_UPLOAD_URL',
  'NEXT_PUBLIC_PRODUCT_IMAGE_BASE_URL',
]

const missingPublicEnv = requiredPublicEnv.filter((key) => !process.env[key])

if (missingPublicEnv.length > 0) {
  throw new Error(`Missing required public environment variable(s): ${missingPublicEnv.join(', ')}`)
}

const apiUrl = trimSlash(process.env.NEXT_PUBLIC_API_URL)

export const API_BASE_URL = apiUrl
export const UPLOAD_URL = trimSlash(process.env.NEXT_PUBLIC_UPLOAD_URL)
export const PRODUCT_IMAGE_BASE_URL = trimSlash(process.env.NEXT_PUBLIC_PRODUCT_IMAGE_BASE_URL)
