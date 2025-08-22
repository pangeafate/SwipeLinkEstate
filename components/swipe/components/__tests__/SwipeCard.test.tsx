/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import SwipeCard from '../SwipeCard'

// Mock TinderCard
jest.mock('react-tinder-card', () => {
  return function MockTinderCard({ children, onSwipe, onCardLeftScreen, ...props }: any) {
    return <div data-testid="tinder-card" {...props}>{children}</div>
  }
})

// Mock PropertySwipeCard
jest.mock('../PropertySwipeCard', () => {
  return function MockPropertySwipeCard({ property }: any) {
    return <div data-testid="property-swipe-card">{property.address}</div>
  }
})

const mockProperty = {
  id: '1',
  address: '123 Test St',
  price: 500000,
  bedrooms: 3,
  bathrooms: 2,
  area_sqft: 1500,
  image_url: '/test.jpg'
}

describe('SwipeCard', () => {
  const mockOnSwipe = jest.fn()
  const mockOnCardLeftScreen = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render swipe card area', () => {
    // ARRANGE & ACT
    render(
      <SwipeCard
        currentProperty={mockProperty}
        isProcessing={false}
        onSwipe={mockOnSwipe}
        onCardLeftScreen={mockOnCardLeftScreen}
      />
    )

    // ASSERT
    expect(screen.getByTestId('tinder-card')).toBeInTheDocument()
    expect(screen.getByTestId('property-swipe-card')).toBeInTheDocument()
    expect(screen.getByText('123 Test St')).toBeInTheDocument()
  })

  it('should show loading overlay when processing', () => {
    // ARRANGE & ACT
    render(
      <SwipeCard
        currentProperty={mockProperty}
        isProcessing={true}
        onSwipe={mockOnSwipe}
        onCardLeftScreen={mockOnCardLeftScreen}
      />
    )

    // ASSERT
    const loadingOverlay = screen.getByRole('status', { hidden: true })
    expect(loadingOverlay).toBeInTheDocument()
    expect(loadingOverlay).toHaveClass('absolute', 'inset-0', 'bg-black', 'bg-opacity-20')
  })

  it('should not show loading overlay when not processing', () => {
    // ARRANGE & ACT
    render(
      <SwipeCard
        currentProperty={mockProperty}
        isProcessing={false}
        onSwipe={mockOnSwipe}
        onCardLeftScreen={mockOnCardLeftScreen}
      />
    )

    // ASSERT
    expect(screen.queryByRole('status', { hidden: true })).not.toBeInTheDocument()
  })

  it('should render null when no current property', () => {
    // ARRANGE & ACT
    const { container } = render(
      <SwipeCard
        currentProperty={null}
        isProcessing={false}
        onSwipe={mockOnSwipe}
        onCardLeftScreen={mockOnCardLeftScreen}
      />
    )

    // ASSERT
    expect(container.firstChild).toBeNull()
  })
})