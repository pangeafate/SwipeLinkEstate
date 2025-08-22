/**
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react'
import { useUIStore } from '../useUIStore'

describe('useUIStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useUIStore.getState().reset()
  })

  it('should initialize with default state', () => {
    // ARRANGE & ACT
    const { result } = renderHook(() => useUIStore())

    // ASSERT
    expect(result.current.theme).toBe('light')
    expect(result.current.sidebarOpen).toBe(false)
    expect(result.current.modals.propertyForm).toBe(false)
    expect(result.current.modals.linkCreator).toBe(false)
    expect(result.current.modals.confirmDialog).toBe(false)
    expect(result.current.notifications).toEqual([])
  })

  it('should toggle theme correctly', () => {
    // ARRANGE
    const { result } = renderHook(() => useUIStore())

    // ACT - Toggle to dark
    act(() => {
      result.current.toggleTheme()
    })

    // ASSERT
    expect(result.current.theme).toBe('dark')

    // ACT - Toggle back to light
    act(() => {
      result.current.toggleTheme()
    })

    // ASSERT
    expect(result.current.theme).toBe('light')
  })

  it('should set theme directly', () => {
    // ARRANGE
    const { result } = renderHook(() => useUIStore())

    // ACT
    act(() => {
      result.current.setTheme('dark')
    })

    // ASSERT
    expect(result.current.theme).toBe('dark')
  })

  it('should toggle sidebar correctly', () => {
    // ARRANGE
    const { result } = renderHook(() => useUIStore())

    // ACT
    act(() => {
      result.current.toggleSidebar()
    })

    // ASSERT
    expect(result.current.sidebarOpen).toBe(true)

    // ACT - Toggle again
    act(() => {
      result.current.toggleSidebar()
    })

    // ASSERT
    expect(result.current.sidebarOpen).toBe(false)
  })

  it('should set sidebar state directly', () => {
    // ARRANGE
    const { result } = renderHook(() => useUIStore())

    // ACT
    act(() => {
      result.current.setSidebarOpen(true)
    })

    // ASSERT
    expect(result.current.sidebarOpen).toBe(true)
  })

  it('should handle modal state correctly', () => {
    // ARRANGE
    const { result } = renderHook(() => useUIStore())

    // ACT - Open property form modal
    act(() => {
      result.current.openModal('propertyForm')
    })

    // ASSERT
    expect(result.current.modals.propertyForm).toBe(true)
    expect(result.current.modals.linkCreator).toBe(false)

    // ACT - Close property form modal
    act(() => {
      result.current.closeModal('propertyForm')
    })

    // ASSERT
    expect(result.current.modals.propertyForm).toBe(false)

    // ACT - Open multiple modals
    act(() => {
      result.current.openModal('linkCreator')
      result.current.openModal('confirmDialog')
    })

    // ASSERT
    expect(result.current.modals.linkCreator).toBe(true)
    expect(result.current.modals.confirmDialog).toBe(true)
  })

  it('should close all modals', () => {
    // ARRANGE
    const { result } = renderHook(() => useUIStore())

    act(() => {
      result.current.openModal('propertyForm')
      result.current.openModal('linkCreator')
      result.current.openModal('confirmDialog')
    })

    // ACT
    act(() => {
      result.current.closeAllModals()
    })

    // ASSERT
    expect(result.current.modals.propertyForm).toBe(false)
    expect(result.current.modals.linkCreator).toBe(false)
    expect(result.current.modals.confirmDialog).toBe(false)
  })

  it('should add notifications correctly', () => {
    // ARRANGE
    const { result } = renderHook(() => useUIStore())
    
    const notification1 = {
      id: '1',
      type: 'success' as const,
      message: 'Property created successfully',
      duration: 3000
    }
    
    const notification2 = {
      id: '2',
      type: 'error' as const,
      message: 'Failed to create property',
      duration: 5000
    }

    // ACT
    act(() => {
      result.current.addNotification(notification1)
    })

    // ASSERT
    expect(result.current.notifications).toHaveLength(1)
    expect(result.current.notifications[0]).toEqual(notification1)

    // ACT - Add another notification
    act(() => {
      result.current.addNotification(notification2)
    })

    // ASSERT
    expect(result.current.notifications).toHaveLength(2)
  })

  it('should remove notifications correctly', () => {
    // ARRANGE
    const { result } = renderHook(() => useUIStore())
    
    const notification1 = {
      id: '1',
      type: 'success' as const,
      message: 'Success',
      duration: 3000
    }
    
    const notification2 = {
      id: '2',
      type: 'info' as const,
      message: 'Info',
      duration: 3000
    }

    act(() => {
      result.current.addNotification(notification1)
      result.current.addNotification(notification2)
    })

    // ACT - Remove first notification
    act(() => {
      result.current.removeNotification('1')
    })

    // ASSERT
    expect(result.current.notifications).toHaveLength(1)
    expect(result.current.notifications[0].id).toBe('2')
  })

  it('should clear all notifications', () => {
    // ARRANGE
    const { result } = renderHook(() => useUIStore())
    
    act(() => {
      result.current.addNotification({
        id: '1',
        type: 'success',
        message: 'Success',
        duration: 3000
      })
      result.current.addNotification({
        id: '2',
        type: 'error',
        message: 'Error',
        duration: 3000
      })
    })

    // ACT
    act(() => {
      result.current.clearNotifications()
    })

    // ASSERT
    expect(result.current.notifications).toEqual([])
  })

  it('should reset store correctly', () => {
    // ARRANGE
    const { result } = renderHook(() => useUIStore())
    
    act(() => {
      result.current.setTheme('dark')
      result.current.setSidebarOpen(true)
      result.current.openModal('propertyForm')
      result.current.addNotification({
        id: '1',
        type: 'info',
        message: 'Test',
        duration: 3000
      })
    })

    // ACT
    act(() => {
      result.current.reset()
    })

    // ASSERT (theme is preserved during reset as per implementation)
    expect(result.current.theme).toBe('dark')
    expect(result.current.sidebarOpen).toBe(false)
    expect(result.current.modals.propertyForm).toBe(false)
    expect(result.current.notifications).toEqual([])
  })
})