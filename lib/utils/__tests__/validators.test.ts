// Validators utility tests
import {
  validatePropertyData,
  validateEmail,
  validateLinkCode,
  generateLinkCode,
  validateImageFile
} from '../validators'

describe('validators', () => {
  describe('validateEmail', () => {
    it('should validate correct email formats', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name@domain.co.uk')).toBe(true)
      expect(validateEmail('agent+tag@realestate.com')).toBe(true)
    })

    it('should reject invalid email formats', () => {
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('@domain.com')).toBe(false)
      expect(validateEmail('user@')).toBe(false)
      expect(validateEmail('')).toBe(false)
    })
  })

  describe('validatePropertyData', () => {
    const validProperty = {
      address: '123 Main Street, Miami, FL',
      price: 500000,
      bedrooms: 3,
      bathrooms: 2,
      area_sqft: 1800,
      description: 'Beautiful property'
    }

    it('should validate a complete valid property', () => {
      const result = validatePropertyData(validProperty)
      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should require address', () => {
      const result = validatePropertyData({ ...validProperty, address: '' })
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Address is required')
    })

    it('should validate price range', () => {
      let result = validatePropertyData({ ...validProperty, price: -100 })
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Price must be positive')

      result = validatePropertyData({ ...validProperty, price: 200000000 })
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Price must be less than $100M')
    })

    it('should validate bedrooms range', () => {
      let result = validatePropertyData({ ...validProperty, bedrooms: -1 })
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Bedrooms must be between 0 and 20')

      result = validatePropertyData({ ...validProperty, bedrooms: 25 })
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Bedrooms must be between 0 and 20')
    })

    it('should validate bathrooms range', () => {
      let result = validatePropertyData({ ...validProperty, bathrooms: -1 })
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Bathrooms must be between 0 and 20')

      result = validatePropertyData({ ...validProperty, bathrooms: 25 })
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Bathrooms must be between 0 and 20')
    })

    it('should validate area range', () => {
      let result = validatePropertyData({ ...validProperty, area_sqft: -100 })
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Area must be between 0 and 50,000 sq ft')

      result = validatePropertyData({ ...validProperty, area_sqft: 60000 })
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Area must be between 0 and 50,000 sq ft')
    })

    it('should validate description length', () => {
      const longDescription = 'a'.repeat(2001)
      const result = validatePropertyData({ ...validProperty, description: longDescription })
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Description must be less than 2000 characters')
    })

    it('should handle multiple errors', () => {
      const result = validatePropertyData({
        address: '',
        price: -100,
        bedrooms: 25
      })
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBe(3)
    })
  })

  describe('validateLinkCode', () => {
    it('should validate 8-character alphanumeric codes', () => {
      expect(validateLinkCode('ABC12345')).toBe(true)
      expect(validateLinkCode('abcd1234')).toBe(true)
      expect(validateLinkCode('XyZ89012')).toBe(true)
    })

    it('should reject invalid codes', () => {
      expect(validateLinkCode('ABC123')).toBe(false) // too short
      expect(validateLinkCode('ABC123456')).toBe(false) // too long
      expect(validateLinkCode('ABC123@#')).toBe(false) // special characters
      expect(validateLinkCode('')).toBe(false) // empty
    })
  })

  describe('generateLinkCode', () => {
    it('should generate 8-character codes', () => {
      const code = generateLinkCode()
      expect(code).toHaveLength(8)
    })

    it('should generate valid codes', () => {
      const code = generateLinkCode()
      expect(validateLinkCode(code)).toBe(true)
    })

    it('should generate different codes', () => {
      const code1 = generateLinkCode()
      const code2 = generateLinkCode()
      expect(code1).not.toBe(code2)
    })
  })

  describe('validateImageFile', () => {
    it('should validate JPEG files', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' })
      const result = validateImageFile(file)
      expect(result.isValid).toBe(true)
    })

    it('should validate PNG files', () => {
      const file = new File([''], 'test.png', { type: 'image/png' })
      const result = validateImageFile(file)
      expect(result.isValid).toBe(true)
    })

    it('should reject non-image files', () => {
      const file = new File([''], 'test.txt', { type: 'text/plain' })
      const result = validateImageFile(file)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('File must be JPEG, PNG, or WebP format')
    })

    it('should reject files that are too large', () => {
      const largeContent = new Array(11 * 1024 * 1024).fill('a').join('') // 11MB
      const file = new File([largeContent], 'test.jpg', { type: 'image/jpeg' })
      const result = validateImageFile(file)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('File must be less than 10MB')
    })
  })
})