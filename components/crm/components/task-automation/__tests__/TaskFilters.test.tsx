import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { TaskFilters } from '../TaskFilters'
import type { TaskFilters as TaskFiltersType } from '../../../types'

describe('TaskFilters Component', () => {
  const mockOnFiltersChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render priority and type filters', () => {
    const filters: TaskFiltersType = {}
    render(<TaskFilters filters={filters} onFiltersChange={mockOnFiltersChange} />)

    expect(screen.getByDisplayValue('All Priorities')).toBeInTheDocument()
    expect(screen.getByDisplayValue('All Types')).toBeInTheDocument()
  })

  it('should display current priority filter value', () => {
    const filters: TaskFiltersType = { priority: ['high'] }
    render(<TaskFilters filters={filters} onFiltersChange={mockOnFiltersChange} />)

    const prioritySelect = screen.getByDisplayValue('High Priority')
    expect(prioritySelect).toBeInTheDocument()
  })

  it('should display current type filter value', () => {
    const filters: TaskFiltersType = { type: ['call'] }
    render(<TaskFilters filters={filters} onFiltersChange={mockOnFiltersChange} />)

    const typeSelect = screen.getByDisplayValue('Calls')
    expect(typeSelect).toBeInTheDocument()
  })

  it('should call onFiltersChange when priority filter changes', () => {
    const filters: TaskFiltersType = {}
    render(<TaskFilters filters={filters} onFiltersChange={mockOnFiltersChange} />)

    const prioritySelect = screen.getByDisplayValue('All Priorities')
    fireEvent.change(prioritySelect, { target: { value: 'high' } })

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      priority: ['high']
    })
  })

  it('should call onFiltersChange when type filter changes', () => {
    const filters: TaskFiltersType = {}
    render(<TaskFilters filters={filters} onFiltersChange={mockOnFiltersChange} />)

    const typeSelect = screen.getByDisplayValue('All Types')
    fireEvent.change(typeSelect, { target: { value: 'email' } })

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      type: ['email']
    })
  })

  it('should clear priority filter when "All Priorities" selected', () => {
    const filters: TaskFiltersType = { priority: ['high'], type: ['call'] }
    render(<TaskFilters filters={filters} onFiltersChange={mockOnFiltersChange} />)

    const prioritySelect = screen.getByDisplayValue('High Priority')
    fireEvent.change(prioritySelect, { target: { value: '' } })

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      type: ['call'],
      priority: undefined
    })
  })

  it('should clear type filter when "All Types" selected', () => {
    const filters: TaskFiltersType = { priority: ['high'], type: ['call'] }
    render(<TaskFilters filters={filters} onFiltersChange={mockOnFiltersChange} />)

    const typeSelect = screen.getByDisplayValue('Calls')
    fireEvent.change(typeSelect, { target: { value: '' } })

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      priority: ['high'],
      type: undefined
    })
  })

  it('should render all priority options', () => {
    const filters: TaskFiltersType = {}
    render(<TaskFilters filters={filters} onFiltersChange={mockOnFiltersChange} />)

    expect(screen.getByRole('option', { name: 'All Priorities' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'High Priority' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Medium Priority' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Low Priority' })).toBeInTheDocument()
  })

  it('should render all type options', () => {
    const filters: TaskFiltersType = {}
    render(<TaskFilters filters={filters} onFiltersChange={mockOnFiltersChange} />)

    expect(screen.getByRole('option', { name: 'All Types' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Calls' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Emails' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Showings' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Follow-ups' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Nurture' })).toBeInTheDocument()
  })

  it('should apply correct styling to filter selects', () => {
    const filters: TaskFiltersType = {}
    const { container } = render(<TaskFilters filters={filters} onFiltersChange={mockOnFiltersChange} />)

    const selects = container.querySelectorAll('select')
    selects.forEach(select => {
      expect(select).toHaveClass(
        'border',
        'border-gray-300',
        'rounded',
        'px-3',
        'py-1',
        'text-sm',
        'focus:ring-2',
        'focus:ring-blue-500'
      )
    })
  })

  it('should maintain existing filters when changing one filter', () => {
    const filters: TaskFiltersType = { priority: ['high'], type: ['call'] }
    render(<TaskFilters filters={filters} onFiltersChange={mockOnFiltersChange} />)

    const prioritySelect = screen.getByDisplayValue('High Priority')
    fireEvent.change(prioritySelect, { target: { value: 'medium' } })

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      type: ['call'],
      priority: ['medium']
    })
  })

  it('should handle empty filters object', () => {
    const filters: TaskFiltersType = {}
    render(<TaskFilters filters={filters} onFiltersChange={mockOnFiltersChange} />)

    const prioritySelect = screen.getByDisplayValue('All Priorities')
    const typeSelect = screen.getByDisplayValue('All Types')

    expect(prioritySelect).toBeInTheDocument()
    expect(typeSelect).toBeInTheDocument()
  })
})