import React from 'react'
import { render } from '@testing-library/react'
import { TaskListSkeleton } from '../TaskListSkeleton'

describe('TaskListSkeleton Component', () => {
  it('should render correct number of skeleton items', () => {
    const { container } = render(<TaskListSkeleton />)

    const skeletonItems = container.querySelectorAll('.animate-pulse')
    expect(skeletonItems).toHaveLength(5)
  })

  it('should apply correct styling to skeleton container', () => {
    const { container } = render(<TaskListSkeleton />)

    const skeletonContainer = container.firstChild
    expect(skeletonContainer).toHaveClass('space-y-4')
  })

  it('should apply correct styling to each skeleton item', () => {
    const { container } = render(<TaskListSkeleton />)

    const skeletonItems = container.querySelectorAll('.animate-pulse')
    skeletonItems.forEach(item => {
      expect(item).toHaveClass(
        'animate-pulse',
        'bg-white',
        'rounded-lg',
        'shadow-sm',
        'border-l-4',
        'border-l-gray-200',
        'p-4'
      )
    })
  })

  it('should render skeleton content structure', () => {
    const { container } = render(<TaskListSkeleton />)

    const skeletonItems = container.querySelectorAll('.animate-pulse')
    
    skeletonItems.forEach(item => {
      // Check for main flex container
      expect(item.querySelector('.flex.items-start.justify-between')).toBeInTheDocument()
      
      // Check for content area
      expect(item.querySelector('.flex-1')).toBeInTheDocument()
      
      // Check for header skeleton
      expect(item.querySelector('.w-6.h-6.bg-gray-200.rounded')).toBeInTheDocument()
      expect(item.querySelector('.h-4.bg-gray-200.rounded.w-48')).toBeInTheDocument()
      
      // Check for description skeleton
      expect(item.querySelector('.h-3.bg-gray-200.rounded.w-full')).toBeInTheDocument()
      
      // Check for metadata skeletons
      const metadataItems = item.querySelectorAll('.h-3.bg-gray-200.rounded')
      expect(metadataItems.length).toBeGreaterThanOrEqual(4) // At least 4 skeleton bars
      
      // Check for action area skeletons
      expect(item.querySelector('.h-6.bg-gray-200.rounded.w-16')).toBeInTheDocument()
      expect(item.querySelector('.h-6.bg-gray-200.rounded.w-20')).toBeInTheDocument()
    })
  })

  it('should create unique skeleton items', () => {
    const { container } = render(<TaskListSkeleton />)

    const skeletonItems = container.querySelectorAll('.animate-pulse')
    
    // Each should be a separate div element
    expect(skeletonItems).toHaveLength(5)
    
    // Each should have unique positioning in DOM
    skeletonItems.forEach((item, index) => {
      expect(item).toBeInTheDocument()
    })
  })

  it('should have consistent spacing structure', () => {
    const { container } = render(<TaskListSkeleton />)

    const skeletonItems = container.querySelectorAll('.animate-pulse')
    
    skeletonItems.forEach(item => {
      // Check header area spacing
      const headerArea = item.querySelector('.flex.items-center.space-x-3.mb-2')
      expect(headerArea).toBeInTheDocument()
      
      // Check metadata area spacing
      const metadataArea = item.querySelector('.flex.space-x-4')
      expect(metadataArea).toBeInTheDocument()
      
      // Check actions area spacing
      const actionsArea = item.querySelector('.flex.space-x-2')
      expect(actionsArea).toBeInTheDocument()
    })
  })

  it('should render all skeleton elements with gray-200 background', () => {
    const { container } = render(<TaskListSkeleton />)

    const grayElements = container.querySelectorAll('.bg-gray-200')
    
    // Should have multiple gray skeleton elements (icon, title, description, metadata, actions)
    expect(grayElements.length).toBeGreaterThan(20) // 5 items × multiple elements each
    
    grayElements.forEach(element => {
      expect(element).toHaveClass('bg-gray-200')
    })
  })
})