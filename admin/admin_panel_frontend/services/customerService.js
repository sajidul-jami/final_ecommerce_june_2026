import { apiRequest } from '@/lib/api'

export const getCustomers = async () => {
    const res = await apiRequest('/customers')
    return res.data || []
}
