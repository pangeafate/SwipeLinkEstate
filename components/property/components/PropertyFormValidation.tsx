/**
 * Property form validation logic
 * Extracted from PropertyForm.tsx to maintain file size limits
 */
import { FormData, FieldErrors } from './PropertyFormTypes'

export function validatePropertyForm(formData: FormData): { isValid: boolean; errors: FieldErrors } {
  const errors: FieldErrors = {}
  let isValid = true

  // Address validation
  if (!formData.address?.trim()) {
    errors.address = 'Address is required'
    isValid = false
  }

  // Price validation
  if (!formData.price?.trim()) {
    errors.price = 'Price is required'
    isValid = false
  } else {
    const priceNum = parseFloat(formData.price)
    if (isNaN(priceNum)) {
      errors.price = 'Invalid price value'
      isValid = false
    } else if (priceNum <= 0) {
      errors.price = 'Price must be greater than 0'
      isValid = false
    }
  }

  // Bedrooms validation
  if (!formData.bedrooms?.trim()) {
    errors.bedrooms = 'Number of bedrooms is required'
    isValid = false
  } else {
    const bedroomsNum = parseInt(formData.bedrooms)
    if (isNaN(bedroomsNum)) {
      errors.bedrooms = 'Invalid number of bedrooms'
      isValid = false
    } else if (bedroomsNum !== parseFloat(formData.bedrooms)) {
      errors.bedrooms = 'Bedrooms must be a whole number'
      isValid = false
    } else if (bedroomsNum <= 0) {
      errors.bedrooms = 'Property must have at least 1 bedroom'
      isValid = false
    }
  }

  // Bathrooms validation
  if (!formData.bathrooms?.trim()) {
    errors.bathrooms = 'Number of bathrooms is required'
    isValid = false
  } else {
    const bathroomsNum = parseFloat(formData.bathrooms)
    if (isNaN(bathroomsNum)) {
      errors.bathrooms = 'Invalid number of bathrooms'
      isValid = false
    } else if (bathroomsNum <= 0) {
      errors.bathrooms = 'Property must have at least 1 bathroom'
      isValid = false
    }
  }

  // Area validation (optional but if provided, must be valid)
  if (formData.area_sqft?.trim()) {
    const areaNum = parseInt(formData.area_sqft)
    if (isNaN(areaNum) || areaNum <= 0) {
      errors.area_sqft = 'Area must be a positive number'
      isValid = false
    }
  }

  return { isValid, errors }
}