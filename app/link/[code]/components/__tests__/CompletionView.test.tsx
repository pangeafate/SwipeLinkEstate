/**
 * CompletionView Component Tests
 * Testing completion summary display
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CompletionView } from '../CompletionView'
import { setupTest } from '@/test'

// Setup shared utilities
const { getWrapper } = setupTest()

describe('CompletionView Component', () => {
  const defaultProps = {
    linkName: 'Miami Beach Collection',
    buckets: {
      'prop-1': 'love' as const,
      'prop-2': 'love' as const,
      'prop-3': 'maybe' as const,
      'prop-4': 'pass' as const
    },
    onBrowseAgain: jest.fn()
  }

  it('should render completion message', () => {
    // ACT
    render(
      <CompletionView {...defaultProps} />,
      { wrapper: getWrapper() }
    )

    // ASSERT
    expect(screen.getByText('Thanks for browsing!')).toBeInTheDocument()
    expect(screen.getByText(/You've finished reviewing Miami Beach Collection/)).toBeInTheDocument()
  })

  it('should display bucket counts correctly', () => {
    // ACT
    render(
      <CompletionView {...defaultProps} />,
      { wrapper: getWrapper() }
    )

    // ASSERT
    expect(screen.getByText('2')).toBeInTheDocument() // Loved count
    expect(screen.getByText('1')).toBeInTheDocument() // Considering count
    expect(screen.getByText('1')).toBeInTheDocument() // Passed count
    expect(screen.getByText('Loved')).toBeInTheDocument()
    expect(screen.getByText('Considering')).toBeInTheDocument()
    expect(screen.getByText('Passed')).toBeInTheDocument()
  })

  it('should handle browse again button click', async () => {
    // ARRANGE
    const user = userEvent.setup()
    const mockBrowseAgain = jest.fn()
    
    // ACT
    render(
      <CompletionView {...defaultProps} onBrowseAgain={mockBrowseAgain} />,
      { wrapper: getWrapper() }
    )

    await user.click(screen.getByText('Browse Again'))

    // ASSERT
    expect(mockBrowseAgain).toHaveBeenCalled()
  })

  it('should display agent follow-up message', () => {
    // ACT
    render(
      <CompletionView {...defaultProps} />,
      { wrapper: getWrapper() }
    )

    // ASSERT
    expect(screen.getByText(/Your preferences have been saved/)).toBeInTheDocument()
    expect(screen.getByText(/An agent will follow up with you soon/)).toBeInTheDocument()
  })

  it('should have link to explore more properties', () => {
    // ACT
    render(
      <CompletionView {...defaultProps} />,
      { wrapper: getWrapper() }
    )

    // ASSERT
    const exploreLink = screen.getByText('Explore More Properties')
    expect(exploreLink).toBeInTheDocument()
    expect(exploreLink.closest('a')).toHaveAttribute('href', '/')
  })

  it('should handle empty buckets', () => {
    // ARRANGE
    const emptyProps = {
      ...defaultProps,
      buckets: {}
    }

    // ACT
    render(
      <CompletionView {...emptyProps} />,
      { wrapper: getWrapper() }
    )

    // ASSERT
    expect(screen.getAllByText('0')).toHaveLength(3) // All counts should be 0
  })

  it('should use default name when linkName not provided', () => {
    // ARRANGE
    const noNameProps = {
      ...defaultProps,
      linkName: ''
    }

    // ACT
    render(
      <CompletionView {...noNameProps} />,
      { wrapper: getWrapper() }
    )

    // ASSERT
    expect(screen.getByText(/You've finished reviewing this property collection/)).toBeInTheDocument()
  })
})