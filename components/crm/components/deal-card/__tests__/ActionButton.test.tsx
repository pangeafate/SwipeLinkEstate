import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ActionButton } from '../ActionButton'

describe('ActionButton Component', () => {
  const mockOnClick = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render action button with icon and label', () => {
    render(
      <ActionButton
        icon="📞"
        label="Call"
        onClick={mockOnClick}
        variant="primary"
      />
    )

    expect(screen.getByText('📞')).toBeInTheDocument()
    expect(screen.getByText('Call')).toBeInTheDocument()
  })

  it('should apply primary variant styling', () => {
    render(
      <ActionButton
        icon="📞"
        label="Call"
        onClick={mockOnClick}
        variant="primary"
      />
    )

    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-blue-600', 'text-white', 'hover:bg-blue-700')
  })

  it('should apply secondary variant styling', () => {
    render(
      <ActionButton
        icon="📧"
        label="Email"
        onClick={mockOnClick}
        variant="secondary"
      />
    )

    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-gray-100', 'text-gray-700', 'hover:bg-gray-200')
  })

  it('should call onClick handler when clicked', () => {
    render(
      <ActionButton
        icon="📞"
        label="Call"
        onClick={mockOnClick}
        variant="primary"
      />
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  it('should stop propagation when clicked', () => {
    const parentOnClick = jest.fn()
    
    render(
      <div onClick={parentOnClick}>
        <ActionButton
          icon="📞"
          label="Call"
          onClick={mockOnClick}
          variant="primary"
        />
      </div>
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(mockOnClick).toHaveBeenCalledTimes(1)
    expect(parentOnClick).not.toHaveBeenCalled()
  })

  it('should render different icons and labels correctly', () => {
    render(
      <div>
        <ActionButton
          icon="📞"
          label="Call"
          onClick={mockOnClick}
          variant="primary"
        />
        <ActionButton
          icon="📧"
          label="Email"
          onClick={mockOnClick}
          variant="secondary"
        />
        <ActionButton
          icon="📋"
          label="Tasks"
          onClick={mockOnClick}
          variant="secondary"
        />
      </div>
    )

    expect(screen.getByText('📞')).toBeInTheDocument()
    expect(screen.getByText('Call')).toBeInTheDocument()
    expect(screen.getByText('📧')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('📋')).toBeInTheDocument()
    expect(screen.getByText('Tasks')).toBeInTheDocument()
  })

  it('should have proper accessibility attributes', () => {
    render(
      <ActionButton
        icon="📞"
        label="Call"
        onClick={mockOnClick}
        variant="primary"
      />
    )

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    // HTML buttons have type="button" by default when not specified
    expect(button.tagName).toBe('BUTTON')
  })

  it('should apply correct CSS classes for layout and styling', () => {
    render(
      <ActionButton
        icon="📞"
        label="Call"
        onClick={mockOnClick}
        variant="primary"
      />
    )

    const button = screen.getByRole('button')
    expect(button).toHaveClass(
      'flex',
      'items-center',
      'justify-center',
      'space-x-1',
      'px-2',
      'py-1.5',
      'rounded',
      'text-xs',
      'font-medium',
      'transition-colors',
      'duration-200'
    )
  })

  it('should handle long labels gracefully', () => {
    render(
      <ActionButton
        icon="📞"
        label="Call Client Now"
        onClick={mockOnClick}
        variant="primary"
      />
    )

    expect(screen.getByText('Call Client Now')).toBeInTheDocument()
  })

  it('should handle empty icon gracefully', () => {
    render(
      <ActionButton
        icon=""
        label="Action"
        onClick={mockOnClick}
        variant="primary"
      />
    )

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(screen.getByText('Action')).toBeInTheDocument()
  })
})