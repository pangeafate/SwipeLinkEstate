/**
 * RegisterForm Component Tests
 * TDD approach - tests before implementation
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RegisterForm } from '../RegisterForm'
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

describe('RegisterForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render registration form with all required fields', () => {
    // Act
    render(<RegisterForm />)

    // Assert
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
  })

  it('should show validation errors for empty fields', async () => {
    // Arrange
    const user = userEvent.setup()

    // Act
    render(<RegisterForm />)
    const submitButton = screen.getByRole('button', { name: /sign up/i })
    await user.click(submitButton)

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument()
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
  })

  it('should show validation error for invalid email format', async () => {
    // Arrange
    const user = userEvent.setup()

    // Act
    render(<RegisterForm />)
    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'invalid-email')
    const submitButton = screen.getByRole('button', { name: /sign up/i })
    await user.click(submitButton)

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument()
    })
  })

  it('should show validation error for weak password', async () => {
    // Arrange
    const user = userEvent.setup()

    // Act
    render(<RegisterForm />)
    const passwordInput = screen.getByLabelText(/^password$/i)
    await user.type(passwordInput, 'weak')
    const submitButton = screen.getByRole('button', { name: /sign up/i })
    await user.click(submitButton)

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
    })
  })

  it('should show validation error when passwords do not match', async () => {
    // Arrange
    const user = userEvent.setup()

    // Act
    render(<RegisterForm />)
    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    
    await user.type(passwordInput, 'SecurePass123!')
    await user.type(confirmPasswordInput, 'DifferentPass123!')
    
    const submitButton = screen.getByRole('button', { name: /sign up/i })
    await user.click(submitButton)

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    })
  })

  it('should call AuthService.registerAgent with correct data', async () => {
    // Arrange
    const user = userEvent.setup()
    const mockRegister = jest.fn().mockResolvedValue({
      success: true,
      token: 'test-token',
      user: { id: '1', email: 'test@example.com', name: 'Test User', role: 'agent' }
    })
    ;(AuthService.registerAgent as jest.Mock) = mockRegister

    // Act
    render(<RegisterForm />)
    const nameInput = screen.getByLabelText(/name/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /sign up/i })

    await user.type(nameInput, 'Test User')
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'SecurePass123!')
    await user.type(confirmPasswordInput, 'SecurePass123!')
    await user.click(submitButton)

    // Assert
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'SecurePass123!',
        role: 'agent'
      })
    })
  })

  it('should store token and redirect on successful registration', async () => {
    // Arrange
    const user = userEvent.setup()
    const mockRegister = jest.fn().mockResolvedValue({
      success: true,
      token: 'test-token',
      user: { id: '1', email: 'test@example.com', name: 'Test User', role: 'agent' }
    })
    ;(AuthService.registerAgent as jest.Mock) = mockRegister

    const mockSetItem = jest.fn()
    Storage.prototype.setItem = mockSetItem

    // Act
    render(<RegisterForm />)
    const nameInput = screen.getByLabelText(/name/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /sign up/i })

    await user.type(nameInput, 'Test User')
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'SecurePass123!')
    await user.type(confirmPasswordInput, 'SecurePass123!')
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

  it('should display error message on registration failure', async () => {
    // Arrange
    const user = userEvent.setup()
    const mockRegister = jest.fn().mockResolvedValue({
      success: false,
      error: 'Email already exists'
    })
    ;(AuthService.registerAgent as jest.Mock) = mockRegister

    // Act
    render(<RegisterForm />)
    const nameInput = screen.getByLabelText(/name/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /sign up/i })

    await user.type(nameInput, 'Test User')
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'SecurePass123!')
    await user.type(confirmPasswordInput, 'SecurePass123!')
    await user.click(submitButton)

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/email already exists/i)).toBeInTheDocument()
    })
  })

  it('should show loading state during registration', async () => {
    // Arrange
    const user = userEvent.setup()
    const mockRegister = jest.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        success: true,
        token: 'test-token',
        user: { id: '1', email: 'test@example.com', name: 'Test', role: 'agent' }
      }), 100))
    )
    ;(AuthService.registerAgent as jest.Mock) = mockRegister

    // Act
    render(<RegisterForm />)
    const nameInput = screen.getByLabelText(/name/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /sign up/i })

    await user.type(nameInput, 'Test User')
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'SecurePass123!')
    await user.type(confirmPasswordInput, 'SecurePass123!')
    await user.click(submitButton)

    // Assert
    expect(screen.getByText(/creating account/i)).toBeInTheDocument()
    expect(submitButton).toBeDisabled()

    await waitFor(() => {
      expect(screen.queryByText(/creating account/i)).not.toBeInTheDocument()
    })
  })

  it('should have a link to login page', () => {
    // Act
    render(<RegisterForm />)

    // Assert
    const loginLink = screen.getByText(/already have an account/i)
    expect(loginLink).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/login')
  })

  it('should display role selector with agent as default', () => {
    // Act
    render(<RegisterForm />)

    // Assert
    const roleSelect = screen.getByLabelText(/role/i)
    expect(roleSelect).toBeInTheDocument()
    expect(roleSelect).toHaveValue('agent')
  })

  it('should allow selecting different roles', async () => {
    // Arrange
    const user = userEvent.setup()

    // Act
    render(<RegisterForm />)
    const roleSelect = screen.getByLabelText(/role/i)
    
    await user.selectOptions(roleSelect, 'supervisor')

    // Assert
    expect(roleSelect).toHaveValue('supervisor')
  })
})