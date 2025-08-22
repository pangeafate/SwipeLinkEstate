/**
 * Authentication Service
 * Handles user registration, login, and session management
 */

import { createClient } from '@/lib/supabase/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import {
  User,
  UserWithPassword,
  RegisterData,
  LoginCredentials,
  AuthResponse,
  SessionValidation,
  LogoutResponse,
  JWTPayload
} from './types/auth.types'

// JWT secret - in production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export class AuthService {
  /**
   * Register a new agent
   */
  static async registerAgent(userData: RegisterData): Promise<AuthResponse> {
    try {
      const supabase = createClient()
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(userData.password, 10)
      
      // Insert user into database
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          email: userData.email,
          password_hash: hashedPassword,
          name: userData.name,
          role: userData.role
        })
        .select()
        .single()
      
      if (error) {
        return {
          success: false,
          error: error.message
        }
      }
      
      // Remove password from response
      const { password_hash, ...userWithoutPassword } = newUser as any
      
      return {
        success: true,
        user: userWithoutPassword
      }
    } catch (error) {
      console.error('Registration error:', error)
      return {
        success: false,
        error: 'Failed to register user'
      }
    }
  }
  
  /**
   * Login an agent
   */
  static async loginAgent(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const supabase = createClient()
      
      // Get user by email
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', credentials.email)
        .single()
      
      if (error || !user) {
        return {
          success: false,
          error: 'Invalid email or password'
        }
      }
      
      // Verify password
      const isValidPassword = await bcrypt.compare(
        credentials.password,
        user.password_hash
      )
      
      if (!isValidPassword) {
        return {
          success: false,
          error: 'Invalid email or password'
        }
      }
      
      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role
        } as JWTPayload,
        JWT_SECRET,
        { expiresIn: '24h' }
      )
      
      // Remove password from response
      const { password_hash, ...userWithoutPassword } = user
      
      return {
        success: true,
        token,
        user: userWithoutPassword
      }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        error: 'Failed to login'
      }
    }
  }
  
  /**
   * Validate a session token
   */
  static async validateSession(token: string): Promise<SessionValidation> {
    try {
      // Verify JWT token
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
      
      // Check if token is revoked (optional - for logout functionality)
      const supabase = createClient()
      const { data: revokedToken } = await supabase
        .from('revoked_tokens')
        .select('token')
        .eq('token', token)
        .single()
      
      if (revokedToken) {
        return {
          valid: false,
          error: 'Token has been revoked'
        }
      }
      
      return {
        valid: true,
        user: {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role
        }
      }
    } catch (error: any) {
      return {
        valid: false,
        error: error.message || 'Invalid token'
      }
    }
  }
  
  /**
   * Logout an agent
   */
  static async logoutAgent(token: string): Promise<LogoutResponse> {
    try {
      const supabase = createClient()
      
      // Add token to revoked tokens list
      const { error } = await supabase
        .from('revoked_tokens')
        .insert({
          token,
          revoked_at: new Date().toISOString()
        })
        .select()
      
      if (error) {
        return {
          success: false,
          error: error.message
        }
      }
      
      return {
        success: true,
        message: 'Logged out successfully'
      }
    } catch (error) {
      console.error('Logout error:', error)
      return {
        success: false,
        error: 'Failed to logout'
      }
    }
  }
}