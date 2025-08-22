/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import SwipeHints from '../SwipeHints'

describe('SwipeHints', () => {
  it('should render all swipe direction hints', () => {
    // ARRANGE & ACT
    render(<SwipeHints />)

    // ASSERT
    expect(screen.getByText('Swipe left to pass')).toBeInTheDocument()
    expect(screen.getByText('Swipe down to consider')).toBeInTheDocument()
    expect(screen.getByText('Swipe right to like')).toBeInTheDocument()
  })

  it('should display direction emojis', () => {
    // ARRANGE & ACT
    render(<SwipeHints />)

    // ASSERT
    expect(screen.getByText('👈')).toBeInTheDocument()
    expect(screen.getByText('👇')).toBeInTheDocument()
    expect(screen.getByText('👉')).toBeInTheDocument()
  })

  it('should have proper styling structure', () => {
    // ARRANGE & ACT
    const { container } = render(<SwipeHints />)

    // ASSERT
    const mainDiv = container.firstChild
    expect(mainDiv).toHaveClass('bg-white', 'border-t', 'p-4')
    
    const gridDiv = container.querySelector('.grid')
    expect(gridDiv).toHaveClass('grid', 'grid-cols-3', 'gap-4')
  })
})