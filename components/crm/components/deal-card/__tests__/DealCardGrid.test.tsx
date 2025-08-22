import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { DealCardGrid } from '../DealCardGrid'
import { mockDeals, mockDeal } from './mockData'

describe('DealCardGrid Component', () => {
  const mockOnDealClick = jest.fn()
  const mockOnQuickAction = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render grid of deals', () => {
    render(
      <DealCardGrid 
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

  it('should apply default 3-column grid layout', () => {
    const { container } = render(<DealCardGrid deals={mockDeals} />)

    const gridContainer = container.firstChild as HTMLElement
    expect(gridContainer).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3')
  })

  it('should apply 1-column grid layout when specified', () => {
    const { container } = render(<DealCardGrid deals={mockDeals} columns={1} />)

    const gridContainer = container.firstChild as HTMLElement
    expect(gridContainer).toHaveClass('grid-cols-1')
    expect(gridContainer).not.toHaveClass('md:grid-cols-2')
  })

  it('should apply 2-column grid layout when specified', () => {
    const { container } = render(<DealCardGrid deals={mockDeals} columns={2} />)

    const gridContainer = container.firstChild as HTMLElement
    expect(gridContainer).toHaveClass('grid-cols-1', 'md:grid-cols-2')
    expect(gridContainer).not.toHaveClass('lg:grid-cols-3')
  })

  it('should apply 4-column grid layout when specified', () => {
    const { container } = render(<DealCardGrid deals={mockDeals} columns={4} />)

    const gridContainer = container.firstChild as HTMLElement
    expect(gridContainer).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-4')
  })

  it('should display loading skeleton in grid layout', () => {
    render(<DealCardGrid deals={[]} loading />)

    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons).toHaveLength(6)

    const skeletonElements = document.querySelectorAll('.bg-gray-200.h-48')
    expect(skeletonElements).toHaveLength(6)
  })

  it('should display loading skeleton with correct grid layout', () => {
    const { container } = render(<DealCardGrid deals={[]} loading columns={2} />)

    const gridContainer = container.firstChild as HTMLElement
    expect(gridContainer).toHaveClass('grid-cols-1', 'md:grid-cols-2')
  })

  it('should display empty state when no deals', () => {
    render(<DealCardGrid deals={[]} />)

    expect(screen.getByText('📊')).toBeInTheDocument()
    expect(screen.getByText('No deals found')).toBeInTheDocument()
  })

  it('should display empty state with larger icon', () => {
    const { container } = render(<DealCardGrid deals={[]} />)

    const emptyIcon = container.querySelector('.text-4xl')
    expect(emptyIcon).toBeInTheDocument()
    expect(emptyIcon).toHaveTextContent('📊')
  })

  it('should center empty state across full grid', () => {
    const { container } = render(<DealCardGrid deals={[]} />)

    const emptyState = container.querySelector('.col-span-full')
    expect(emptyState).toBeInTheDocument()
    expect(emptyState).toHaveClass('text-center', 'py-12')
  })

  it('should call onDealClick when deal is clicked', () => {
    render(
      <DealCardGrid 
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
      <DealCardGrid 
        deals={[mockDeal]} 
        onQuickAction={mockOnQuickAction}
      />
    )

    const callButton = screen.getByText('Call')
    fireEvent.click(callButton)

    expect(mockOnQuickAction).toHaveBeenCalledWith(mockDeal, 'call')
  })

  it('should handle deals without click handlers', () => {
    render(<DealCardGrid deals={[mockDeal]} />)

    expect(screen.getByText('Downtown Condo Deal')).toBeInTheDocument()
    // Should not crash without handlers
  })

  it('should apply grid gap correctly', () => {
    const { container } = render(<DealCardGrid deals={mockDeals} />)

    const gridContainer = container.firstChild as HTMLElement
    expect(gridContainer).toHaveClass('gap-6')
  })

  it('should assign unique keys to each deal card', () => {
    const { container } = render(<DealCardGrid deals={mockDeals} />)

    const dealCards = container.querySelectorAll('[class*="bg-white"]')
    expect(dealCards).toHaveLength(5) // 5 mock deals
  })

  it('should not display loading state when not loading', () => {
    render(<DealCardGrid deals={mockDeals} loading={false} />)

    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons).toHaveLength(0)
  })

  it('should handle single deal correctly', () => {
    render(<DealCardGrid deals={[mockDeal]} />)

    expect(screen.getByText('Downtown Condo Deal')).toBeInTheDocument()
    expect(screen.queryByText('Suburban House Deal')).not.toBeInTheDocument()
  })

  it('should display all deal information for each card', () => {
    render(<DealCardGrid deals={[mockDeal]} />)

    // Check that deal card content is rendered
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Properties:')).toBeInTheDocument()
    expect(screen.getByText('Engagement:')).toBeInTheDocument()
    expect(screen.getByText('85/100')).toBeInTheDocument()
  })

  it('should handle empty deals array gracefully', () => {
    render(<DealCardGrid deals={[]} />)

    expect(screen.getByText('No deals found')).toBeInTheDocument()
    expect(screen.queryByText('Downtown Condo Deal')).not.toBeInTheDocument()
  })

  it('should render loading state with correct skeleton count and height', () => {
    render(<DealCardGrid deals={[]} loading />)

    const loadingItems = document.querySelectorAll('.animate-pulse')
    expect(loadingItems).toHaveLength(6)

    const skeletonBars = document.querySelectorAll('.bg-gray-200.h-48')
    expect(skeletonBars).toHaveLength(6)
  })

  it('should maintain deal order in grid layout', () => {
    render(<DealCardGrid deals={mockDeals} />)

    const dealTitles = screen.getAllByText(/Deal$|Property$/)
    expect(dealTitles[0]).toHaveTextContent('Downtown Condo Deal')
    expect(dealTitles[1]).toHaveTextContent('Suburban House Deal')
    expect(dealTitles[2]).toHaveTextContent('Beachfront Property')
  })

  it('should fallback to 3-column layout for invalid column count', () => {
    const { container } = render(<DealCardGrid deals={mockDeals} columns={10} />)

    const gridContainer = container.firstChild as HTMLElement
    expect(gridContainer).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3')
  })

  it('should apply basic grid classes', () => {
    const { container } = render(<DealCardGrid deals={mockDeals} />)

    const gridContainer = container.firstChild as HTMLElement
    expect(gridContainer).toHaveClass('grid')
  })

  it('should handle loading state with different column configurations', () => {
    const { container: container1 } = render(<DealCardGrid deals={[]} loading columns={1} />)
    const { container: container4 } = render(<DealCardGrid deals={[]} loading columns={4} />)

    const grid1 = container1.firstChild as HTMLElement
    const grid4 = container4.firstChild as HTMLElement

    expect(grid1).toHaveClass('grid-cols-1')
    expect(grid4).toHaveClass('lg:grid-cols-4')
  })

  it('should render grid layout with proper responsive breakpoints', () => {
    const { container } = render(<DealCardGrid deals={mockDeals} columns={3} />)

    const gridContainer = container.firstChild as HTMLElement
    expect(gridContainer).toHaveClass('grid-cols-1') // mobile
    expect(gridContainer).toHaveClass('md:grid-cols-2') // tablet
    expect(gridContainer).toHaveClass('lg:grid-cols-3') // desktop
  })
})