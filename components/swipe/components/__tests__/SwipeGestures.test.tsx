/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import SwipeGestures from '../SwipeGestures'

// Mock Framer Motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  },
  useMotionValue: jest.fn(() => ({
    set: jest.fn(),
    get: jest.fn(() => 0)
  })),
  useTransform: jest.fn(() => ({
    set: jest.fn()
  }))
}))

const mockProperty = {
  id: '1',
  address: '123 Test St',
  price: 500000,
  bedrooms: 3,
  bathrooms: 2,
  area_sqft: 1500,
  property_type: 'house',
  status: 'active',
  cover_image: '/test.jpg',
  images: ['/test.jpg'],
  features: ['garage'],
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z'
}

describe('SwipeGestures', () => {
  it('should render draggable card', () => {
    // ARRANGE & ACT
    render(
      <SwipeGestures
        property={mockProperty}
        onDragEnd={jest.fn()}
        isProcessing={false}
      />
    )

    // ASSERT
    expect(screen.getByText('$500,000')).toBeInTheDocument()
  })

  it('should call onDragEnd when drag ends', () => {
    // ARRANGE
    const handleDragEnd = jest.fn()
    render(
      <SwipeGestures
        property={mockProperty}
        onDragEnd={handleDragEnd}
        isProcessing={false}
      />
    )

    // ACT
    const card = screen.getByText('$500,000').closest('div')
    fireEvent.dragEnd(card!, { offset: { x: 200, y: 0 }, velocity: { x: 0, y: 0 } })

    // ASSERT
    expect(handleDragEnd).toHaveBeenCalled()
  })
})