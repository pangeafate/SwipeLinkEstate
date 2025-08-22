/**
 * LoginForm Component Tests
 * TDD approach - tests before implementation
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '../LoginForm'
import { AuthService } from '../../auth.service'

// Mock AuthService
jest.mock('../../auth.service')

// Mock next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render login form with email and password fields', () => {
    // Act
    render(<LoginForm />)

    // Assert
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('should show validation errors for empty fields', async () => {
    // Arrange
    const user = userEvent.setup()

    // Act
    render(<LoginForm />)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
  })

  it('should show validation error for invalid email format', async () => {
    // Arrange
    const user = userEvent.setup()

    // Act
    render(<LoginForm />)
    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'invalid-email')
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument()
    })
  })

  it('should call AuthService.loginAgent with correct credentials', async () => {
    // Arrange
    const user = userEvent.setup()
    const mockLogin = jest.fn().mockResolvedValue({
      success: true,
      token: 'test-token',
      user: { id: '1', email: 'test@example.com', name: 'Test User', role: 'agent' }
    })
    ;(AuthService.loginAgent as jest.Mock) = mockLogin

    // Act
    render(<LoginForm />)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'SecurePass123!')
    await user.click(submitButton)

    // Assert
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'SecurePass123!'
      })
    })
  })

  it('should store token and redirect on successful login', async () => {
    // Arrange
    const user = userEvent.setup()
    const mockLogin = jest.fn().mockResolvedValue({
      success: true,
      token: 'test-token',
      user: { id: '1', email: 'test@example.com', name: 'Test User', role: 'agent' }
    })
    ;(AuthService.loginAgent as jest.Mock) = mockLogin

    const mockSetItem = jest.fn()
    Storage.prototype.setItem = mockSetItem

    // Act
    render(<LoginForm />)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'SecurePass123!')
    await user.click(submitButton)

    // Assert
    await waitFor(() => {
      expect(mockSetItem).toHaveBeenCalledWith('token', 'test-token')
      expect(mockSetItem).toHaveBeenCalledWith('user', JSON.stringify({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'agent'
      }))
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('should display error message on login failure', async () => {
    // Arrange
    const user = userEvent.setup()
    const mockLogin = jest.fn().mockResolvedValue({
      success: false,
      error: 'Invalid email or password'
    })
    ;(AuthService.loginAgent as jest.Mock) = mockLogin

    // Act
    render(<LoginForm />)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'WrongPassword')
    await user.click(submitButton)

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument()
    })
  })

  it('should show loading state during login', async () => {
    // Arrange
    const user = userEvent.setup()
    const mockLogin = jest.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        success: true,
        token: 'test-token',
        user: { id: '1', email: 'test@example.com', name: 'Test', role: 'agent' }
      }), 100))
    )
    ;(AuthService.loginAgent as jest.Mock) = mockLogin

    // Act
    render(<LoginForm />)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'SecurePass123!')
    await user.click(submitButton)

    // Assert
    expect(screen.getByText(/signing in/i)).toBeInTheDocument()
    expect(submitButton).toBeDisabled()

    await waitFor(() => {
      expect(screen.queryByText(/signing in/i)).not.toBeInTheDocument()
    })
  })

  it('should have a link to registration page', () => {
    // Act
    render(<LoginForm />)

    // Assert
    const registerLink = screen.getByText(/don't have an account/i)
    expect(registerLink).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /sign up/i })).toHaveAttribute('href', '/register')
  })
})