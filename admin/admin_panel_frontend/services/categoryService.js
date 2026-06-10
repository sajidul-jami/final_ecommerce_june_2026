import { apiRequest } from '@/lib/api'

// GET ALL
export const getCategories = async () => {
    const res = await apiRequest('/categories')
    return res.data || []
}

// GET ONE
export const getCategoryById = async (id) => {
    const res = await apiRequest(`/categories/${id}`)
    return res.data
}

// ADD
export const addCategory = async (data) => {
    return apiRequest('/categories/add', {
        method: 'POST',
        body: data
    })
}

// UPDATE
export const updateCategory = async (id, data) => {
    return apiRequest(`/categories/update/${id}`, {
        method: 'PUT',
        body: data
    })
}

// DELETE
export const deleteCategory = async (id) => {
    return apiRequest(`/categories/delete/${id}`, {
        method: 'DELETE'
    })
}