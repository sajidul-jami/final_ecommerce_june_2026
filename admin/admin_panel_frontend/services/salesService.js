import { apiRequest } from '@/lib/api'

// SALES SUMMARY
export const getSalesSummary = async () => {

    return apiRequest('/sales/summary')
}

// RECENT SALES
export const getRecentSales = async () => {

    const res = await apiRequest('/sales/recent')
    return res.data || []
}

// PAYMENT METHOD ANALYTICS
export const getPaymentAnalytics =
    async () => {

        return apiRequest(
            '/sales/payment-method'
        )
    }
