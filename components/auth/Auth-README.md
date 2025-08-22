# Authentication Module

## Purpose
Handles user authentication, authorization, and session management for SwipeLink Estate agents and administrators.

## Architecture Overview

```
Authentication Flow:
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Browser    │────▶│  Auth Pages  │────▶│ Auth Service │
│              │     │ Login/Register│     │              │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                            ┌─────────────────────┴─────────────────────┐
                            ▼                                           ▼
                     ┌──────────────┐                           ┌──────────────┐
                     │   Database   │                           │ JWT Tokens   │
                     │ users table  │                           │   Session    │
                     └──────────────┘                           └──────────────┘
```

## Module Structure

- **auth.service.ts** - Core authentication logic (registration, login, validation)
- **types/auth.types.ts** - TypeScript interfaces for auth data
- **components/** - Login and registration UI components
- **hooks/** - React hooks for auth state management
- **middleware/** - Route protection middleware

## Public API

| Function | Input | Output | Purpose |
|----------|-------|--------|---------|
| registerAgent | RegisterData | AuthResponse | Create new agent account |
| loginAgent | LoginCredentials | AuthResponse | Authenticate agent and get token |
| validateSession | token: string | SessionValidation | Verify JWT token validity |
| logoutAgent | token: string | LogoutResponse | Revoke session token |

## Security Features

### Password Security
- Passwords hashed using bcrypt with salt rounds of 10
- Never stored in plain text
- Password requirements enforced on frontend

### Session Management
- JWT tokens with 24-hour expiration
- Token revocation on logout
- Secure HTTP-only cookies for token storage (future)

### Role-Based Access Control
- Three roles: agent, supervisor, admin
- Middleware checks role permissions
- Database RLS policies enforce data access

## Database Schema

### Users Table
```sql
users {
  id: UUID (primary key)
  email: TEXT (unique)
  password_hash: TEXT
  name: TEXT
  role: TEXT (agent|supervisor|admin)
  created_at: TIMESTAMPTZ
  updated_at: TIMESTAMPTZ
}
```

### Revoked Tokens Table
```sql
revoked_tokens {
  id: UUID (primary key)
  token: TEXT (unique)
  revoked_at: TIMESTAMPTZ
}
```

## Usage Examples

### Registration
```typescript
const result = await AuthService.registerAgent({
  email: 'agent@example.com',
  password: 'SecurePass123!',
  name: 'John Doe',
  role: 'agent'
})

if (result.success) {
  console.log('User registered:', result.user)
} else {
  console.error('Registration failed:', result.error)
}
```

### Login
```typescript
const result = await AuthService.loginAgent({
  email: 'agent@example.com',
  password: 'SecurePass123!'
})

if (result.success) {
  localStorage.setItem('token', result.token)
  console.log('Logged in:', result.user)
} else {
  console.error('Login failed:', result.error)
}
```

### Session Validation
```typescript
const token = localStorage.getItem('token')
const validation = await AuthService.validateSession(token)

if (validation.valid) {
  console.log('Valid session for:', validation.user)
} else {
  console.error('Invalid session:', validation.error)
  // Redirect to login
}
```

## Testing

The module follows TDD principles with comprehensive test coverage:
- Unit tests for all service methods
- Component tests for login/register forms
- Integration tests for complete auth flow
- Mock factories for consistent test data

Run tests:
```bash
npm test components/auth
```

## Security Considerations

1. **Never expose JWT secret** - Use environment variables
2. **Implement rate limiting** - Prevent brute force attacks
3. **Use HTTPS only** - Encrypt data in transit
4. **Validate input** - Sanitize all user inputs
5. **Log security events** - Track login attempts and failures
6. **Regular token rotation** - Consider refresh tokens for long sessions

## Future Enhancements

- [ ] Two-factor authentication (2FA)
- [ ] OAuth integration (Google, GitHub)
- [ ] Email verification
- [ ] Password reset flow
- [ ] Remember me functionality
- [ ] Session activity tracking
- [ ] IP-based access control
- [ ] Audit logging

## Dependencies

- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT token generation
- **@supabase/supabase-js** - Database client
- **React Hook Form** - Form validation (components)
- **Zod** - Schema validation