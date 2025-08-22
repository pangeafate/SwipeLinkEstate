/**
 * Auth Module Public Exports
 * Central export point for authentication functionality
 */

// Services
export { AuthService } from './auth.service'

// Types
export type {
  User,
  UserRole,
  RegisterData,
  LoginCredentials,
  AuthResponse,
  SessionValidation,
  LogoutResponse
} from './types/auth.types'

// Components
export { LoginForm } from './components/LoginForm'
export { RegisterForm } from './components/RegisterForm'

// Middleware
export { authMiddleware } from './middleware/authMiddleware'

// Hooks (to be added)
// export { useAuth } from './hooks/useAuth'
// export { useSession } from './hooks/useSession'