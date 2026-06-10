import { apiRequest } from '@/lib/api'

export const getProducts = async () => {
    const res = await apiRequest('/products')
    return res.data || []
}

export const getProductById = async (id) => {
    const res = await apiRequest(`/products/${id}`)
    return res.data
}

export const addProduct = async (data) => {
    return apiRequest('/products/add', {
        method: 'POST',
        body: data
    })
}

export const updateProduct = async (id, data) => {
    return apiRequest(`/products/update/${id}`, {
        method: 'PUT',
        body: data
    })
}

export const deleteProduct = async (id) => {
    return apiRequest(`/products/delete/${id}`, {
        method: 'DELETE'
    })
}
