/**
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react'
import usePropertyValidation from '../hooks/usePropertyValidation'

describe('usePropertyValidation', () => {
  it('should initialize with empty errors', () => {
    // ARRANGE & ACT
    const { result } = renderHook(() => usePropertyValidation())

    // ASSERT
    expect(result.current.errors).toEqual({})
    expect(result.current.isValid).toBe(true)
  })

  it('should validate address field', () => {
    // ARRANGE
    const { result } = renderHook(() => usePropertyValidation())

    // ACT
    act(() => {
      result.current.validateField('address', '')
    })

    // ASSERT
    expect(result.current.errors.address).toBe('Property address is required')
    expect(result.current.isValid).toBe(false)
  })

  it('should validate price field', () => {
    // ARRANGE
    const { result } = renderHook(() => usePropertyValidation())

    // ACT
    act(() => {
      result.current.validateField('price', 'invalid')
    })

    // ASSERT
    expect(result.current.errors.price).toBe('Invalid price amount')
  })

  it('should validate bedrooms field', () => {
    // ARRANGE
    const { result } = renderHook(() => usePropertyValidation())

    // ACT
    act(() => {
      result.current.validateField('bedrooms', '0')
    })

    // ASSERT
    expect(result.current.errors.bedrooms).toBe('Property must have at least 1 bedroom')
  })

  it('should clear error when field becomes valid', () => {
    // ARRANGE
    const { result } = renderHook(() => usePropertyValidation())
    act(() => {
      result.current.validateField('address', '')
    })

    // ACT
    act(() => {
      result.current.validateField('address', '123 Main St')
    })

    // ASSERT
    expect(result.current.errors.address).toBeUndefined()
  })
})