import { NextResponse } from 'next/server'

export function proxy(request) {
    const token = request.cookies.get('token')
    const isLoginPage = request.nextUrl.pathname === '/login'

    if (!token && !isLoginPage) {
        return NextResponse.redirect(
            new URL('/login', request.url)
        )
    }

    if (token && isLoginPage) {
        return NextResponse.redirect(
            new URL('/admin/dashboard', request.url)
        )
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/dashboard/:path*',
        '/orders/:path*',
        '/products/:path*',
        '/sales/:path*',
        '/users/:path*'
    ]
}
