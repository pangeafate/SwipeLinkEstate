import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { DealCard } from '../DealCard'
import { mockDeal, mockDealCold, mockDealMinimal } from './mockData'

describe('DealCard Component', () => {
  const mockOnClick = jest.fn()
  const mockOnQuickAction = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render deal card with basic information', () => {
    render(<DealCard deal={mockDeal} />)

    expect(screen.getByText('Downtown Condo Deal')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Properties:')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('Engagement:')).toBeInTheDocument()
    expect(screen.getByText('85/100')).toBeInTheDocument()
  })

  it('should display temperature indicator with correct color', () => {
    const { container } = render(<DealCard deal={mockDeal} />)
    
    const tempIndicator = container.querySelector('.bg-red-500')
    expect(tempIndicator).toBeInTheDocument()
    expect(screen.getByText('hot')).toBeInTheDocument()
  })

  it('should display cold temperature correctly', () => {
    const { container } = render(<DealCard deal={mockDealCold} />)
    
    const tempIndicator = container.querySelector('.bg-gray-500')
    expect(tempIndicator).toBeInTheDocument()
    expect(screen.getByText('cold')).toBeInTheDocument()
  })

  it('should show deal value when available', () => {
    render(<DealCard deal={mockDeal} />)

    expect(screen.getByText('Est. Value:')).toBeInTheDocument()
    expect(screen.getByText('$150k')).toBeInTheDocument()
    expect(screen.getByText('Sessions:')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
  })

  it('should hide deal value section when not available', () => {
    render(<DealCard deal={mockDealMinimal} />)

    expect(screen.queryByText('Est. Value:')).not.toBeInTheDocument()
    expect(screen.queryByText('Sessions:')).not.toBeInTheDocument()
  })

  it('should display progress bar in normal mode', () => {
    render(<DealCard deal={mockDeal} />)

    expect(screen.getByText('Deal Progress')).toBeInTheDocument()
    expect(screen.getByText('qualified')).toBeInTheDocument()
  })

  it('should hide progress bar in compact mode', () => {
    render(<DealCard deal={mockDeal} compact />)

    expect(screen.queryByText('Deal Progress')).not.toBeInTheDocument()
  })

  it('should display status badge with correct styling', () => {
    render(<DealCard deal={mockDeal} />)

    expect(screen.getByText('ACTIVE')).toBeInTheDocument()
  })

  it('should format last activity time correctly', () => {
    render(<DealCard deal={mockDeal} />)

    // Should show some time ago format or date - could be either based on when test runs
    const timeElement = screen.getByText(/ago|No activity|\d{1,2}\/\d{1,2}\/\d{4}/)
    expect(timeElement).toBeInTheDocument()
  })

  it('should handle no last activity', () => {
    render(<DealCard deal={mockDealMinimal} />)

    expect(screen.getByText('No activity')).toBeInTheDocument()
  })

  it('should display tags when available', () => {
    render(<DealCard deal={mockDeal} />)

    expect(screen.getByText('VIP')).toBeInTheDocument()
    expect(screen.getByText('Hot Lead')).toBeInTheDocument()
    expect(screen.getByText('Luxury')).toBeInTheDocument()
    expect(screen.getByText('+1 more')).toBeInTheDocument() // 4 tags, showing 3 + more
  })

  it('should hide tags section when no tags', () => {
    render(<DealCard deal={mockDealMinimal} />)

    expect(screen.queryByText('VIP')).not.toBeInTheDocument()
  })

  it('should show action buttons by default', () => {
    render(<DealCard deal={mockDeal} onQuickAction={mockOnQuickAction} />)

    expect(screen.getByText('Call')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Tasks')).toBeInTheDocument()
  })

  it('should hide action buttons when showActions is false', () => {
    render(<DealCard deal={mockDeal} showActions={false} onQuickAction={mockOnQuickAction} />)

    expect(screen.queryByText('Call')).not.toBeInTheDocument()
    expect(screen.queryByText('Email')).not.toBeInTheDocument()
    expect(screen.queryByText('Tasks')).not.toBeInTheDocument()
  })

  it('should show compact actions in compact mode', () => {
    render(<DealCard deal={mockDeal} compact onQuickAction={mockOnQuickAction} />)

    const callButton = screen.getByTitle('Call client')
    const emailButton = screen.getByTitle('Email client')
    
    expect(callButton).toBeInTheDocument()
    expect(emailButton).toBeInTheDocument()
    expect(screen.queryByText('Call')).not.toBeInTheDocument() // No labels in compact mode
  })

  it('should call onClick handler when card is clicked', () => {
    render(<DealCard deal={mockDeal} onClick={mockOnClick} />)

    const card = screen.getByText('Downtown Condo Deal').closest('div')
    fireEvent.click(card!)

    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  it('should call onQuickAction handler for action buttons', () => {
    render(<DealCard deal={mockDeal} onQuickAction={mockOnQuickAction} />)

    const callButton = screen.getByText('Call')
    fireEvent.click(callButton)

    expect(mockOnQuickAction).toHaveBeenCalledWith('call')
  })

  it('should prevent event bubbling on action buttons', () => {
    render(<DealCard deal={mockDeal} onClick={mockOnClick} onQuickAction={mockOnQuickAction} />)

    const callButton = screen.getByText('Call')
    fireEvent.click(callButton)

    expect(mockOnQuickAction).toHaveBeenCalledWith('call')
    expect(mockOnClick).not.toHaveBeenCalled()
  })

  it('should apply compact styling correctly', () => {
    const { container } = render(<DealCard deal={mockDeal} compact />)

    const card = container.firstChild as HTMLElement
    expect(card).toHaveClass('p-3')
    
    const title = screen.getByText('Downtown Condo Deal')
    expect(title).toHaveClass('text-sm')
  })

  it('should apply normal styling by default', () => {
    const { container } = render(<DealCard deal={mockDeal} />)

    const card = container.firstChild as HTMLElement
    expect(card).toHaveClass('p-4')
    
    const title = screen.getByText('Downtown Condo Deal')
    expect(title).toHaveClass('text-base')
  })

  it('should show hover effects when clickable', () => {
    const { container } = render(<DealCard deal={mockDeal} onClick={mockOnClick} />)

    const card = container.firstChild as HTMLElement
    expect(card).toHaveClass('cursor-pointer', 'hover:shadow-md', 'hover:border-gray-300')
  })

  it('should not show hover effects when not clickable', () => {
    const { container } = render(<DealCard deal={mockDeal} />)

    const card = container.firstChild as HTMLElement
    expect(card).not.toHaveClass('cursor-pointer')
  })

  it('should handle missing client name gracefully', () => {
    render(<DealCard deal={mockDealMinimal} />)

    expect(screen.getByText('Basic Deal')).toBeInTheDocument()
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
  })

  it('should display engagement score with correct color', () => {
    render(<DealCard deal={mockDeal} />)

    const engagementScore = screen.getByText('85/100')
    expect(engagementScore).toHaveClass('text-red-600', 'font-semibold') // High engagement
  })

  it('should display low engagement score with gray color', () => {
    render(<DealCard deal={mockDealMinimal} />)

    const engagementScore = screen.getByText('15/100')
    expect(engagementScore).toHaveClass('text-gray-600') // Low engagement
  })

  it('should truncate long deal names', () => {
    const longNameDeal = {
      ...mockDeal,
      dealName: 'This is a very long deal name that should be truncated when displayed'
    }

    render(<DealCard deal={longNameDeal} />)

    const title = screen.getByText(longNameDeal.dealName)
    expect(title).toHaveClass('truncate')
  })

  it('should truncate long client names', () => {
    const longClientNameDeal = {
      ...mockDeal,
      clientName: 'This is a very long client name that should be truncated'
    }

    render(<DealCard deal={longClientNameDeal} />)

    const clientName = screen.getByText(longClientNameDeal.clientName!)
    expect(clientName).toHaveClass('truncate')
  })
})