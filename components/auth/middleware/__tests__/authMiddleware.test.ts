/**
 * Auth Middleware Tests
 * TDD approach - tests before implementation
 */

import { authMiddleware } from '../authMiddleware'
import { AuthService } from '../../auth.service'
import { NextRequest, NextResponse } from 'next/server'

// Mock AuthService
jest.mock('../../auth.service')

// Mock NextResponse
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    redirect: jest.fn((url) => ({ url, redirect: true })),
    next: jest.fn(() => ({ next: true }))
  }
}))

describe('authMiddleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should allow access to public routes without authentication', async () => {
    // Arrange
    const req = {
      nextUrl: { pathname: '/login' },
      headers: new Map()
    } as unknown as NextRequest

    // Act
    const response = await authMiddleware(req)

    // Assert
    expect(response).toEqual({ next: true })
    expect(AuthService.validateSession).not.toHaveBeenCalled()
  })

  it('should allow access to home page without authentication', async () => {
    // Arrange
    const req = {
      nextUrl: { pathname: '/' },
      headers: new Map()
    } as unknown as NextRequest

    // Act
    const response = await authMiddleware(req)

    // Assert
    expect(response).toEqual({ next: true })
  })

  it('should redirect to login if no token provided for protected route', async () => {
    // Arrange
    const req = {
      nextUrl: { pathname: '/dashboard' },
      headers: new Map(),
      url: 'http://localhost:3000/dashboard'
    } as unknown as NextRequest

    // Act
    const response = await authMiddleware(req)

    // Assert
    expect(response).toEqual({
      url: new URL('/login', 'http://localhost:3000'),
      redirect: true
    })
  })

  it('should redirect to login if token is invalid', async () => {
    // Arrange
    const mockValidate = jest.fn().mockResolvedValue({
      valid: false,
      error: 'Invalid token'
    })
    ;(AuthService.validateSession as jest.Mock) = mockValidate

    const req = {
      nextUrl: { pathname: '/dashboard' },
      headers: new Map([['authorization', 'Bearer invalid-token']]),
      url: 'http://localhost:3000/dashboard'
    } as unknown as NextRequest

    // Act
    const response = await authMiddleware(req)

    // Assert
    expect(mockValidate).toHaveBeenCalledWith('invalid-token')
    expect(response).toEqual({
      url: new URL('/login', 'http://localhost:3000'),
      redirect: true
    })
  })

  it('should allow access if token is valid', async () => {
    // Arrange
    const mockValidate = jest.fn().mockResolvedValue({
      valid: true,
      user: { id: '1', email: 'test@example.com', name: 'Test', role: 'agent' }
    })
    ;(AuthService.validateSession as jest.Mock) = mockValidate

    const req = {
      nextUrl: { pathname: '/dashboard' },
      headers: new Map([['authorization', 'Bearer valid-token']]),
      url: 'http://localhost:3000/dashboard'
    } as unknown as NextRequest

    // Act
    const response = await authMiddleware(req)

    // Assert
    expect(mockValidate).toHaveBeenCalledWith('valid-token')
    expect(response).toEqual({ next: true })
  })

  it('should check role permissions for admin routes', async () => {
    // Arrange
    const mockValidate = jest.fn().mockResolvedValue({
      valid: true,
      user: { id: '1', email: 'test@example.com', name: 'Test', role: 'agent' }
    })
    ;(AuthService.validateSession as jest.Mock) = mockValidate

    const req = {
      nextUrl: { pathname: '/admin/users' },
      headers: new Map([['authorization', 'Bearer valid-token']]),
      url: 'http://localhost:3000/admin/users'
    } as unknown as NextRequest

    // Act
    const response = await authMiddleware(req)

    // Assert
    expect(response).toEqual({
      url: new URL('/dashboard', 'http://localhost:3000'),
      redirect: true
    })
  })

  it('should allow admin access to admin routes', async () => {
    // Arrange
    const mockValidate = jest.fn().mockResolvedValue({
      valid: true,
      user: { id: '1', email: 'admin@example.com', name: 'Admin', role: 'admin' }
    })
    ;(AuthService.validateSession as jest.Mock) = mockValidate

    const req = {
      nextUrl: { pathname: '/admin/users' },
      headers: new Map([['authorization', 'Bearer valid-token']]),
      url: 'http://localhost:3000/admin/users'
    } as unknown as NextRequest

    // Act
    const response = await authMiddleware(req)

    // Assert
    expect(response).toEqual({ next: true })
  })

  it('should extract token from cookies if not in headers', async () => {
    // Arrange
    const mockValidate = jest.fn().mockResolvedValue({
      valid: true,
      user: { id: '1', email: 'test@example.com', name: 'Test', role: 'agent' }
    })
    ;(AuthService.validateSession as jest.Mock) = mockValidate

    const req = {
      nextUrl: { pathname: '/dashboard' },
      headers: new Map(),
      cookies: {
        get: jest.fn().mockReturnValue({ value: 'cookie-token' })
      },
      url: 'http://localhost:3000/dashboard'
    } as unknown as NextRequest

    // Act
    const response = await authMiddleware(req)

    // Assert
    expect(mockValidate).toHaveBeenCalledWith('cookie-token')
    expect(response).toEqual({ next: true })
  })
})