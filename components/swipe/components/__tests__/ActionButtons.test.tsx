/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ActionButtons from '../ActionButtons'

describe('ActionButtons', () => {
  it('should render all three action buttons', () => {
    // ARRANGE & ACT
    render(
      <ActionButtons
        onAction={jest.fn()}
        isProcessing={false}
      />
    )

    // ASSERT
    expect(screen.getByLabelText('Pass (swipe left)')).toBeInTheDocument()
    expect(screen.getByLabelText('Consider (swipe down)')).toBeInTheDocument()
    expect(screen.getByLabelText('Like (swipe right)')).toBeInTheDocument()
  })

  it('should call onAction with correct direction when buttons are clicked', () => {
    // ARRANGE
    const handleAction = jest.fn()
    render(
      <ActionButtons
        onAction={handleAction}
        isProcessing={false}
      />
    )

    // ACT
    fireEvent.click(screen.getByLabelText('Pass (swipe left)'))
    fireEvent.click(screen.getByLabelText('Consider (swipe down)'))
    fireEvent.click(screen.getByLabelText('Like (swipe right)'))

    // ASSERT
    expect(handleAction).toHaveBeenCalledTimes(3)
    expect(handleAction).toHaveBeenCalledWith('left')
    expect(handleAction).toHaveBeenCalledWith('down')
    expect(handleAction).toHaveBeenCalledWith('right')
  })

  it('should disable buttons when processing', () => {
    // ARRANGE & ACT
    render(
      <ActionButtons
        onAction={jest.fn()}
        isProcessing={true}
      />
    )

    // ASSERT
    expect(screen.getByLabelText('Pass (swipe left)')).toBeDisabled()
    expect(screen.getByLabelText('Consider (swipe down)')).toBeDisabled()
    expect(screen.getByLabelText('Like (swipe right)')).toBeDisabled()
  })
})