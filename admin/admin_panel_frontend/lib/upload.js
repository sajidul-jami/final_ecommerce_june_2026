import { UPLOAD_URL } from './apiConfig'

export const uploadImages = async (files, options = {}) => {
  const fileList = Array.from(files || []).filter(Boolean)

  if (!fileList.length) return []

  const formData = new FormData()
  fileList.forEach((file) => formData.append('photos', file))
  if (options.productName) formData.append('productName', options.productName)
  if (options.type) formData.append('type', options.type)
  if (options.folder) formData.append('folder', options.folder)

  let response

  try {
    response = await fetch(UPLOAD_URL, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    })
  } catch {
    throw new Error(
      `Image upload failed. Check NEXT_PUBLIC_UPLOAD_URL (${UPLOAD_URL}) and backend CORS.`
    )
  }

  let data

  try {
    data = await response.json()
  } catch {
    throw new Error('Image upload returned an invalid response')
  }

  if (!response.ok || !data.success) {
    throw new Error(data.message || data.err || 'Image upload failed')
  }

  return Array.isArray(data.files) && data.files.length
    ? data.files.map((file) => file.fileName || file.objectKey).filter(Boolean)
    : [data.fileName].filter(Boolean)
}

export const uploadProductImages = async (files, productName = '') =>
  uploadImages(files, { productName })

export const uploadProductImage = async (file, productName = '') => {
  const files = await uploadProductImages([file], productName)
  return files[0] || ''
}
