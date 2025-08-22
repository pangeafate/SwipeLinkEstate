/**
 * Authentication Types
 * Defines interfaces for auth system
 */

export type UserRole = 'agent' | 'supervisor' | 'admin'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  created_at?: string
  updated_at?: string
}

export interface UserWithPassword extends User {
  password_hash: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
  role: UserRole
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  token?: string
  user?: User
  error?: string
}

export interface SessionValidation {
  valid: boolean
  user?: {
    userId: string
    email: string
    role: UserRole
  }
  error?: string
}

export interface LogoutResponse {
  success: boolean
  message?: string
  error?: string
}

export interface JWTPayload {
  userId: string
  email: string
  role: UserRole
  iat?: number
  exp?: number
}