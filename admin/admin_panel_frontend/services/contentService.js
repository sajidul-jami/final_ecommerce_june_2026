import { apiRequest } from '@/lib/api'

const list = async (path) => {
  const res = await apiRequest(`/content/${path}`)
  return res.data || []
}

export const getOffers = () => list('offers')
export const saveOffer = (data, id) => apiRequest(`/content/offers${id ? `/${id}` : ''}`, {
  method: id ? 'PUT' : 'POST',
  body: data
})
export const deleteOffer = (id) => apiRequest(`/content/offers/${id}`, { method: 'DELETE' })

export const getBrands = () => list('brands')
export const saveBrand = (data, id) => apiRequest(`/content/brands${id ? `/${id}` : ''}`, {
  method: id ? 'PUT' : 'POST',
  body: data
})
export const deleteBrand = (id) => apiRequest(`/content/brands/${id}`, { method: 'DELETE' })

export const getSliders = () => list('sliders')
export const saveSlider = (data, id) => apiRequest(`/content/sliders${id ? `/${id}` : ''}`, {
  method: id ? 'PUT' : 'POST',
  body: data
})
export const deleteSlider = (id) => apiRequest(`/content/sliders/${id}`, { method: 'DELETE' })

export const getSupportTickets = () => list('support')
export const updateSupportTicket = (id, data) => apiRequest(`/content/support/${id}`, {
  method: 'PUT',
  body: data
})

export const getReviews = () => list('reviews')
export const updateReview = (id, data) => apiRequest(`/content/reviews/${id}`, {
  method: 'PUT',
  body: data
})

export const getSocialLinks = () => list('social-links')
export const saveSocialLink = (data, id) => apiRequest(`/content/social-links${id ? `/${id}` : ''}`, {
  method: id ? 'PUT' : 'POST',
  body: data
})
export const deleteSocialLink = (id) => apiRequest(`/content/social-links/${id}`, { method: 'DELETE' })
