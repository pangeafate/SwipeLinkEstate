import { useState, useCallback } from 'react'

interface FieldErrors {
  address?: string
  price?: string
  bedrooms?: string
  bathrooms?: string
  area_sqft?: string
}

export default function usePropertyValidation() {
  const [errors, setErrors] = useState<FieldErrors>({})

  const validateField = useCallback((field: keyof FieldErrors, value: string) => {
    let error: string | undefined

    switch (field) {
      case 'address':
        if (!value?.trim()) {
          error = 'Property address is required'
        }
        break

      case 'price':
        if (!value?.trim()) {
          error = 'Property price is required'
        } else {
          const priceNum = parseFloat(value.replace(/[^\d.]/g, ''))
          if (isNaN(priceNum) || priceNum <= 0) {
            error = 'Invalid price amount'
          }
        }
        break

      case 'bedrooms':
        if (!value?.trim()) {
          error = 'Number of bedrooms is required'
        } else {
          const bedroomsNum = parseInt(value)
          if (isNaN(bedroomsNum)) {
            error = 'Invalid number of bedrooms'
          } else if (bedroomsNum !== parseFloat(value)) {
            error = 'Bedrooms must be a whole number'
          } else if (bedroomsNum <= 0) {
            error = 'Property must have at least 1 bedroom'
          }
        }
        break

      case 'bathrooms':
        if (!value?.trim()) {
          error = 'Number of bathrooms is required'
        } else {
          const bathroomsNum = parseFloat(value)
          if (isNaN(bathroomsNum)) {
            error = 'Invalid number of bathrooms'
          } else if (bathroomsNum <= 0) {
            error = 'Property must have at least 1 bathroom'
          }
        }
        break

      case 'area_sqft':
        if (value?.trim()) {
          const areaNum = parseInt(value)
          if (isNaN(areaNum) || areaNum <= 0) {
            error = 'Area must be a positive number'
          }
        }
        break
    }

    setErrors(prev => ({
      ...prev,
      [field]: error
    }))
  }, [])

  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  const validateAll = useCallback((formData: Record<string, string>) => {
    const newErrors: FieldErrors = {}
    
    Object.keys(formData).forEach(field => {
      const value = formData[field]
      let error: string | undefined

      switch (field) {
        case 'address':
          if (!value?.trim()) error = 'Property address is required'
          break
        case 'price':
          if (!value?.trim()) {
            error = 'Property price is required'
          } else {
            const priceNum = parseFloat(value.replace(/[^\d.]/g, ''))
            if (isNaN(priceNum) || priceNum <= 0) error = 'Invalid price amount'
          }
          break
        case 'bedrooms':
          if (!value?.trim()) {
            error = 'Number of bedrooms is required'
          } else {
            const bedroomsNum = parseInt(value)
            if (isNaN(bedroomsNum)) error = 'Invalid number of bedrooms'
            else if (bedroomsNum !== parseFloat(value)) error = 'Bedrooms must be a whole number'
            else if (bedroomsNum <= 0) error = 'Property must have at least 1 bedroom'
          }
          break
        case 'bathrooms':
          if (!value?.trim()) {
            error = 'Number of bathrooms is required'
          } else {
            const bathroomsNum = parseFloat(value)
            if (isNaN(bathroomsNum)) error = 'Invalid number of bathrooms'
            else if (bathroomsNum <= 0) error = 'Property must have at least 1 bathroom'
          }
          break
        case 'area_sqft':
          if (value?.trim()) {
            const areaNum = parseInt(value)
            if (isNaN(areaNum) || areaNum <= 0) error = 'Area must be a positive number'
          }
          break
      }

      if (error) {
        newErrors[field as keyof FieldErrors] = error
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [])

  const isValid = Object.keys(errors).length === 0 || !Object.values(errors).some(error => error)

  return {
    errors,
    validateField,
    validateAll,
    clearErrors,
    isValid
  }
}