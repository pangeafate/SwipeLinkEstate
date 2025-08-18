import type { PropertyInsert } from '../supabase/types'

/**
 * Validate property data before creation/update
 */
export function validatePropertyData(data: Partial<PropertyInsert>): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Required fields
  if (!data.address || data.address.trim().length === 0) {
    errors.push('Address is required')
  }

  // Price validation
  if (data.price !== undefined && data.price !== null) {
    if (data.price < 0) {
      errors.push('Price must be positive')
    }
    if (data.price > 100000000) {
      errors.push('Price must be less than $100M')
    }
  }

  // Bedrooms validation
  if (data.bedrooms !== undefined && data.bedrooms !== null) {
    if (data.bedrooms < 0 || data.bedrooms > 20) {
      errors.push('Bedrooms must be between 0 and 20')
    }
  }

  // Bathrooms validation
  if (data.bathrooms !== undefined && data.bathrooms !== null) {
    if (data.bathrooms < 0 || data.bathrooms > 20) {
      errors.push('Bathrooms must be between 0 and 20')
    }
  }

  // Area validation
  if (data.area_sqft !== undefined && data.area_sqft !== null) {
    if (data.area_sqft < 0 || data.area_sqft > 50000) {
      errors.push('Area must be between 0 and 50,000 sq ft')
    }
  }

  // Description validation
  if (data.description && data.description.length > 2000) {
    errors.push('Description must be less than 2000 characters')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate link code format (8 characters, alphanumeric)
 */
export function validateLinkCode(code: string): boolean {
  const codeRegex = /^[a-zA-Z0-9]{8}$/
  return codeRegex.test(code)
}

/**
 * Generate a random link code
 */
export function generateLinkCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Validate file is an image
 */
export function validateImageFile(file: File): {
  isValid: boolean
  error?: string
} {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  const maxSize = 10 * 1024 * 1024 // 10MB

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'File must be JPEG, PNG, or WebP format'
    }
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File must be less than 10MB'
    }
  }

  return { isValid: true }
}