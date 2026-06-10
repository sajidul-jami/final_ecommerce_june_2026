import { apiRequest } from '@/lib/api'

// GET ALL ORDERS
export const getOrders = async () => {

    const res = await apiRequest('/orders')
    return res.data || []
}

// GET SINGLE ORDER
export const getOrderById = async (id) => {

    const res = await apiRequest(`/orders/${id}`)
    return res.data
}

// CREATE ORDER
export const createOrder = async (data) => {

    return apiRequest('/orders', {
        method: 'POST',
        body: data
    })
}

// UPDATE ORDER
export const updateOrder = async (
    id,
    data
) => {

    return apiRequest(`/orders/${id}`, {
        method: 'PUT',
        body: data
    })
}

// UPDATE ORDER STATUS
export const updateOrderStatus = async (
    id,
    status
) => {

    return apiRequest(
        `/orders/${id}/status`,
        {
            method: 'PATCH',
            body: { order_status: status }
        }
    )
}

// DELETE ORDER
export const deleteOrder = async (id) => {

    return apiRequest(`/orders/${id}`, {
        method: 'DELETE'
    })
}
