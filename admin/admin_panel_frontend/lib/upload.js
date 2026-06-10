import { UPLOAD_URL } from './apiConfig'

export const uploadProductImage = async (file) => {
  const formData = new FormData()
  formData.append('photo', file)

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

  return data.fileName
}
