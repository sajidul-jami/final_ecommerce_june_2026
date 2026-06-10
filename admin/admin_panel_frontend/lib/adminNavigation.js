import {
  BarChart3,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users
} from 'lucide-react'

export const adminNavigation = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: Package },
  { href: '/admin/users', label: 'Customers', icon: Users },
  { href: '/admin/sales', label: 'Sales', icon: BarChart3 },
  { href: '/admin/admin_users', label: 'Admin Users', icon: Users }
]

export const getAdminPageTitle = (pathname = '') => {
  if (pathname.startsWith('/admin/orders')) return 'Orders'
  if (pathname.startsWith('/admin/products')) return 'Products'
  if (pathname.startsWith('/admin/categories')) return 'Categories'
  if (pathname.startsWith('/admin/users')) return 'Customers'
  if (pathname.startsWith('/admin/sales')) return 'Sales'
  if (pathname.startsWith('/admin/admin_users')) return 'Admin Users'
  if (pathname.startsWith('/admin/dashboard')) return 'Dashboard'
  return 'Admin'
}
