/**
 * Auth Middleware
 * Protects routes and validates authentication
 */

import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '../auth.service'

// Define public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/about',
  '/contact'
]

// Define role-based route permissions
const ROLE_ROUTES: Record<string, string[]> = {
  admin: ['/admin', '/admin/*'],
  supervisor: ['/supervisor', '/supervisor/*', '/admin/reports'],
  agent: ['/dashboard', '/properties', '/clients']
}

export async function authMiddleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow access to public routes
  if (PUBLIC_ROUTES.includes(pathname) || pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  // Extract token from headers or cookies
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '') || req.cookies.get('token')?.value

  // Redirect to login if no token
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  try {
    // Validate token
    const validation = await AuthService.validateSession(token)

    if (!validation.valid || !validation.user) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Check role-based permissions
    const userRole = validation.user.role

    // Admin can access everything
    if (userRole === 'admin') {
      return NextResponse.next()
    }

    // Check if route requires admin access
    if (pathname.startsWith('/admin')) {
      // Only admin can access admin routes (except specific supervisor routes)
      if (userRole === 'supervisor' && pathname === '/admin/reports') {
        return NextResponse.next()
      }
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Check if route requires supervisor access
    if (pathname.startsWith('/supervisor')) {
      if (userRole === 'supervisor' || userRole === 'admin') {
        return NextResponse.next()
      }
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Allow access to general protected routes
    return NextResponse.next()
  } catch (error) {
    // Redirect to login on any error
    return NextResponse.redirect(new URL('/login', req.url))
  }
}