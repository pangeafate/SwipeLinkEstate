/**
 * AuthService Tests
 * Following TDD approach - tests written before implementation
 */

import { AuthService } from '../auth.service'
import { createClient } from '@/lib/supabase/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Mock dependencies
jest.mock('@/lib/supabase/client')
jest.mock('bcryptjs')
jest.mock('jsonwebtoken')

describe('AuthService', () => {
  const mockSupabase = {
    from: jest.fn(),
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn()
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  describe('registerAgent', () => {
    it('should register a new agent with hashed password', async () => {
      // Arrange
      const userData = {
        email: 'agent@test.com',
        password: 'SecurePass123!',
        name: 'Test Agent',
        role: 'agent' as const
      }

      const hashedPassword = 'hashed_password_123'
      const newUser = {
        id: 'user-123',
        email: userData.email,
        name: userData.name,
        role: userData.role,
        created_at: new Date().toISOString()
      }

      ;(bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword)
      
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: newUser,
              error: null
            })
          })
        })
      })

      // Act
      const result = await AuthService.registerAgent(userData)

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10)
      expect(mockSupabase.from).toHaveBeenCalledWith('users')
      expect(result).toEqual({
        success: true,
        user: newUser
      })
    })

    it('should handle registration errors', async () => {
      // Arrange
      const userData = {
        email: 'agent@test.com',
        password: 'SecurePass123!',
        name: 'Test Agent',
        role: 'agent' as const
      }

      ;(bcrypt.hash as jest.Mock).mockResolvedValue('hashed')
      
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Email already exists' }
            })
          })
        })
      })

      // Act
      const result = await AuthService.registerAgent(userData)

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Email already exists'
      })
    })
  })

  describe('loginAgent', () => {
    it('should login agent and return JWT token', async () => {
      // Arrange
      const credentials = {
        email: 'agent@test.com',
        password: 'SecurePass123!'
      }

      const user = {
        id: 'user-123',
        email: credentials.email,
        password_hash: 'hashed_password',
        name: 'Test Agent',
        role: 'agent'
      }

      const token = 'jwt_token_123'

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: user,
              error: null
            })
          })
        })
      })

      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)
      ;(jwt.sign as jest.Mock).mockReturnValue(token)

      // Act
      const result = await AuthService.loginAgent(credentials)

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith('users')
      expect(bcrypt.compare).toHaveBeenCalledWith(credentials.password, user.password_hash)
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: user.id, email: user.email, role: user.role },
        expect.any(String),
        { expiresIn: '24h' }
      )
      expect(result).toEqual({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      })
    })

    it('should reject invalid credentials', async () => {
      // Arrange
      const credentials = {
        email: 'agent@test.com',
        password: 'WrongPassword'
      }

      const user = {
        id: 'user-123',
        email: credentials.email,
        password_hash: 'hashed_password',
        name: 'Test Agent',
        role: 'agent'
      }

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: user,
              error: null
            })
          })
        })
      })

      ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

      // Act
      const result = await AuthService.loginAgent(credentials)

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Invalid email or password'
      })
    })
  })

  describe('validateSession', () => {
    it('should validate a valid JWT token', async () => {
      // Arrange
      const token = 'valid_jwt_token'
      const decoded = {
        userId: 'user-123',
        email: 'agent@test.com',
        role: 'agent'
      }

      ;(jwt.verify as jest.Mock).mockReturnValue(decoded)

      // Act
      const result = await AuthService.validateSession(token)

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith(token, expect.any(String))
      expect(result).toEqual({
        valid: true,
        user: decoded
      })
    })

    it('should reject invalid JWT token', async () => {
      // Arrange
      const token = 'invalid_jwt_token'

      ;(jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token')
      })

      // Act
      const result = await AuthService.validateSession(token)

      // Assert
      expect(result).toEqual({
        valid: false,
        error: 'Invalid token'
      })
    })
  })

  describe('logoutAgent', () => {
    it('should invalidate the session token', async () => {
      // Arrange
      const token = 'jwt_token_123'
      
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: { token, revoked_at: new Date().toISOString() },
            error: null
          })
        })
      })

      // Act
      const result = await AuthService.logoutAgent(token)

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith('revoked_tokens')
      expect(result).toEqual({
        success: true,
        message: 'Logged out successfully'
      })
    })
  })
})