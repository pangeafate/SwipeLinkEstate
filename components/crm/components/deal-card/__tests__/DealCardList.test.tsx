import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { DealCardList } from '../DealCardList'
import { mockDeals, mockDeal } from './mockData'

describe('DealCardList Component', () => {
  const mockOnDealClick = jest.fn()
  const mockOnQuickAction = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render list of deals', () => {
    render(
      <DealCardList 
        deals={mockDeals} 
        onDealClick={mockOnDealClick}
        onQuickAction={mockOnQuickAction}
      />
    )

    expect(screen.getByText('Downtown Condo Deal')).toBeInTheDocument()
    expect(screen.getByText('Suburban House Deal')).toBeInTheDocument()
    expect(screen.getByText('Beachfront Property')).toBeInTheDocument()
    expect(screen.getByText('City Apartment Deal')).toBeInTheDocument()
    expect(screen.getByText('Basic Deal')).toBeInTheDocument()
  })

  it('should display loading skeleton when loading', () => {
    render(<DealCardList deals={[]} loading />)

    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons).toHaveLength(3)

    const skeletonElements = document.querySelectorAll('.bg-gray-200')
    expect(skeletonElements.length).toBeGreaterThan(0)
  })

  it('should display empty state when no deals', () => {
    render(<DealCardList deals={[]} />)

    expect(screen.getByText('📊')).toBeInTheDocument()
    expect(screen.getByText('No deals found')).toBeInTheDocument()
  })

  it('should display custom empty message', () => {
    const customMessage = 'No active deals available'
    render(<DealCardList deals={[]} emptyMessage={customMessage} />)

    expect(screen.getByText(customMessage)).toBeInTheDocument()
  })

  it('should call onDealClick when deal is clicked', () => {
    render(
      <DealCardList 
        deals={[mockDeal]} 
        onDealClick={mockOnDealClick}
      />
    )

    const dealCard = screen.getByText('Downtown Condo Deal')
    fireEvent.click(dealCard)

    expect(mockOnDealClick).toHaveBeenCalledWith(mockDeal)
  })

  it('should call onQuickAction when action button is clicked', () => {
    render(
      <DealCardList 
        deals={[mockDeal]} 
        onQuickAction={mockOnQuickAction}
      />
    )

    const callButton = screen.getByText('Call')
    fireEvent.click(callButton)

    expect(mockOnQuickAction).toHaveBeenCalledWith(mockDeal, 'call')
  })

  it('should handle deals without click handlers', () => {
    render(<DealCardList deals={[mockDeal]} />)

    expect(screen.getByText('Downtown Condo Deal')).toBeInTheDocument()
    // Should not crash without handlers
  })

  it('should render deals in vertical layout', () => {
    const { container } = render(
      <DealCardList deals={mockDeals} />
    )

    const listContainer = container.firstChild as HTMLElement
    expect(listContainer).toHaveClass('space-y-4')
  })

  it('should assign unique keys to each deal card', () => {
    const { container } = render(
      <DealCardList deals={mockDeals} />
    )

    const dealCards = container.querySelectorAll('[class*="bg-white"]')
    expect(dealCards).toHaveLength(5) // 5 mock deals
  })

  it('should not display loading state when not loading', () => {
    render(<DealCardList deals={mockDeals} loading={false} />)

    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons).toHaveLength(0)
  })

  it('should handle single deal correctly', () => {
    render(<DealCardList deals={[mockDeal]} />)

    expect(screen.getByText('Downtown Condo Deal')).toBeInTheDocument()
    expect(screen.queryByText('Suburban House Deal')).not.toBeInTheDocument()
  })

  it('should display all deal information for each card', () => {
    render(<DealCardList deals={[mockDeal]} />)

    // Check that deal card content is rendered
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Properties:')).toBeInTheDocument()
    expect(screen.getByText('Engagement:')).toBeInTheDocument()
    expect(screen.getByText('85/100')).toBeInTheDocument()
  })

  it('should apply correct container styling', () => {
    const { container } = render(<DealCardList deals={mockDeals} />)

    const listContainer = container.firstChild as HTMLElement
    expect(listContainer).toHaveClass('space-y-4')
  })

  it('should handle empty deals array gracefully', () => {
    render(<DealCardList deals={[]} />)

    expect(screen.getByText('No deals found')).toBeInTheDocument()
    expect(screen.queryByText('Downtown Condo Deal')).not.toBeInTheDocument()
  })

  it('should render loading state with correct skeleton count', () => {
    render(<DealCardList deals={[]} loading />)

    const loadingItems = document.querySelectorAll('.animate-pulse')
    expect(loadingItems).toHaveLength(3)

    const skeletonBars = document.querySelectorAll('.bg-gray-200.h-32')
    expect(skeletonBars).toHaveLength(3)
  })

  it('should center empty state content', () => {
    const { container } = render(<DealCardList deals={[]} />)

    const emptyState = container.querySelector('.text-center')
    expect(emptyState).toBeInTheDocument()
    expect(emptyState).toHaveClass('py-12')
  })

  it('should maintain deal order', () => {
    render(<DealCardList deals={mockDeals} />)

    const dealTitles = screen.getAllByText(/Deal$|Property$/)
    expect(dealTitles[0]).toHaveTextContent('Downtown Condo Deal')
    expect(dealTitles[1]).toHaveTextContent('Suburban House Deal')
    expect(dealTitles[2]).toHaveTextContent('Beachfront Property')
  })
})