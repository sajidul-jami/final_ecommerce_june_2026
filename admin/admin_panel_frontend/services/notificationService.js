import { getSupportTickets, getReviews, getCustomerMessages } from '@/services/contentService'
import { getOrders } from '@/services/orderService'

export const getAdminNotifications = async () => {
  const [orders, tickets, reviews, messages] = await Promise.all([
    getOrders().catch(() => []),
    getSupportTickets().catch(() => []),
    getReviews().catch(() => []),
    getCustomerMessages().catch(() => [])
  ])

  const pendingOrders = orders.filter((order) => order.order_status === 'Pending')
  const openTickets = tickets.filter((ticket) => ['Open', 'In Progress'].includes(ticket.status || 'Open'))
  const pendingReviews = reviews.filter((review) => review.status === 'Pending')
  const openMessages = messages.filter((message) => (message.status || 'Open') === 'Open')

  const items = [
    ...pendingOrders.slice(0, 5).map((order) => ({
      id: `order-${order.id}`,
      title: `Order #${order.id} is pending`,
      description: `${order.full_name || 'Guest customer'} - ${order.payment_method || 'Payment pending'}`,
      href: `/admin/orders/${order.id}`,
      tone: 'amber'
    })),
    ...openTickets.slice(0, 4).map((ticket) => ({
      id: `support-${ticket.id}`,
      title: ticket.subject || 'Support ticket',
      description: `${ticket.name || 'Customer'} - ${ticket.status || 'Open'}`,
      href: '/admin/support',
      tone: ticket.priority === 'High' ? 'rose' : 'blue'
    })),
    ...openMessages.slice(0, 4).map((message) => ({
      id: `message-${message.id}`,
      title: message.subject || 'Customer message',
      description: `${message.name || 'Customer'} - ${message.phone || 'No phone'}`,
      href: '/admin/messages',
      tone: 'blue'
    })),
    ...pendingReviews.slice(0, 4).map((review) => ({
      id: `review-${review.id}`,
      title: 'Review waiting for approval',
      description: review.product_name || `Product #${review.product_id}`,
      href: '/admin/reviews',
      tone: 'emerald'
    }))
  ]

  return {
    count: pendingOrders.length + openTickets.length + openMessages.length + pendingReviews.length,
    items,
    summary: {
      pendingOrders: pendingOrders.length,
      openTickets: openTickets.length,
      openMessages: openMessages.length,
      pendingReviews: pendingReviews.length
    }
  }
}
