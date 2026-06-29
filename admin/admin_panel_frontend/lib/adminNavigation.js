import {
  BarChart3,
  BadgePercent,
  Images,
  LayoutDashboard,
  LifeBuoy,
  Package,
  Share2,
  ShoppingBag,
  Star,
  Tags,
  Users
} from 'lucide-react'

export const adminNavigation = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: Package },
  { href: '/admin/brands', label: 'Brands', icon: Tags },
  { href: '/admin/offers', label: 'Offers', icon: BadgePercent },
  { href: '/admin/sliders', label: 'Sliders', icon: Images },
  { href: '/admin/users', label: 'Customers', icon: Users },
  { href: '/admin/support', label: 'Support', icon: LifeBuoy },
  { href: '/admin/reviews', label: 'Reviews', icon: Star },
  { href: '/admin/social-links', label: 'Social Links', icon: Share2 },
  { href: '/admin/sales', label: 'Sales', icon: BarChart3 },
  { href: '/admin/admin_users', label: 'Admin Users', icon: Users }
]

export const getAdminPageTitle = (pathname = '') => {
  if (pathname.startsWith('/admin/orders')) return 'Orders'
  if (pathname.startsWith('/admin/products')) return 'Products'
  if (pathname.startsWith('/admin/categories')) return 'Categories'
  if (pathname.startsWith('/admin/brands')) return 'Brands'
  if (pathname.startsWith('/admin/offers')) return 'Offers'
  if (pathname.startsWith('/admin/sliders')) return 'Sliders'
  if (pathname.startsWith('/admin/users')) return 'Customers'
  if (pathname.startsWith('/admin/support')) return 'Support'
  if (pathname.startsWith('/admin/reviews')) return 'Reviews'
  if (pathname.startsWith('/admin/social-links')) return 'Social Links'
  if (pathname.startsWith('/admin/sales')) return 'Sales'
  if (pathname.startsWith('/admin/admin_users')) return 'Admin Users'
  if (pathname.startsWith('/admin/dashboard')) return 'Dashboard'
  return 'Admin'
}
