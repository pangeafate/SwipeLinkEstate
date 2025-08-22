/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import SwipeEmptyState from '../SwipeEmptyState'

describe('SwipeEmptyState', () => {
  it('should render empty state message', () => {
    // ARRANGE & ACT
    render(<SwipeEmptyState />)

    // ASSERT
    expect(screen.getByText('No properties available')).toBeInTheDocument()
    expect(screen.getByText('Check back later for new listings')).toBeInTheDocument()
  })

  it('should display house emoji', () => {
    // ARRANGE & ACT
    render(<SwipeEmptyState />)

    // ASSERT
    expect(screen.getByText('🏠')).toBeInTheDocument()
  })

  it('should center content properly', () => {
    // ARRANGE & ACT
    const { container } = render(<SwipeEmptyState />)

    // ASSERT
    const mainDiv = container.firstChild
    expect(mainDiv).toHaveClass('flex', 'items-center', 'justify-center', 'h-screen', 'bg-gray-50')
  })
})