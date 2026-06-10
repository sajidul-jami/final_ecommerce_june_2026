import { apiRequest } from '@/lib/api'

// LOGIN
export const loginAdmin = async (data) => {
  return apiRequest('/auth/login', {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(data),
  })
}

// LOGOUT
export const logoutAdmin = async () => {
  return apiRequest('/auth/logout', {
    method: 'POST',
    credentials: 'include',
  })
}

// GET ALL ADMINS
export const getAdmins = async () => {
  return apiRequest('/auth/admins', {
    method: 'GET',
    credentials: 'include',
  })
}

// CREATE ADMIN (REGISTER)
export const registerAdmin = async (data) => {
  return apiRequest('/auth/register', {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(data),
  })
}

export const updateAdmin = async (id, data) => {
  return apiRequest(`/auth/admins/${id}`, {
    method: 'PUT',
    credentials: 'include',
    body: JSON.stringify(data),
  })
}

export const deleteAdmin = async (id) => {
  return apiRequest(`/auth/admins/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
}

