/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import FormInput from '../FormInput'

describe('FormInput', () => {
  it('should render input with label', () => {
    // ARRANGE & ACT
    render(
      <FormInput
        id="test-input"
        label="Test Label"
        value=""
        onChange={jest.fn()}
      />
    )

    // ASSERT
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveAttribute('id', 'test-input')
  })

  it('should display error message when error provided', () => {
    // ARRANGE & ACT
    render(
      <FormInput
        id="test-input"
        label="Test Label"
        value=""
        onChange={jest.fn()}
        error="Test error message"
      />
    )

    // ASSERT
    expect(screen.getByText('Test error message')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveClass('border-red-300')
  })

  it('should call onChange when input value changes', () => {
    // ARRANGE
    const handleChange = jest.fn()
    render(
      <FormInput
        id="test-input"
        label="Test Label"
        value=""
        onChange={handleChange}
      />
    )

    // ACT
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test value' } })

    // ASSERT
    expect(handleChange).toHaveBeenCalledWith('test value')
  })

  it('should show required asterisk when required', () => {
    // ARRANGE & ACT
    render(
      <FormInput
        id="test-input"
        label="Test Label"
        value=""
        onChange={jest.fn()}
        required={true}
      />
    )

    // ASSERT
    expect(screen.getByText('Test Label *')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveAttribute('required')
  })
})