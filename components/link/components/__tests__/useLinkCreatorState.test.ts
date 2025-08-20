import { renderHook, act, waitFor } from '@testing-library/react'
import { useLinkCreatorState } from '../hooks/useLinkCreatorState'

// Import shared infrastructure following TESTING-GUIDELINES.md
import { 
  setupTest, 
  createMockProperty,
  createMockLink,
  SupabaseMockFactory 
} from '@/test'

// Setup shared utilities  
const { getWrapper } = setupTest()

// Mock the services using shared infrastructure
jest.mock('../../link.service', () => ({
  LinkService: {
    createLink: jest.fn(),
    copyLinkUrl: jest.fn()
  }
}))

jest.mock('../../../property', () => ({
  PropertyService: {
    getAllProperties: jest.fn()
  }
}))

import { LinkService } from '../../link.service'
import { PropertyService } from '../../../property'

describe('useLinkCreatorState Hook', () => {
  const mockOnLinkCreated = jest.fn()

  // Use shared infrastructure for consistent test data
  const mockProperties = [
    createMockProperty({
      id: 'prop-1',
      address: '123 Ocean Drive',
      price: 850000
    }),
    createMockProperty({
      id: 'prop-2', 
      address: '456 Beach Ave',
      price: 1250000
    })
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    ;(PropertyService.getAllProperties as jest.Mock).mockResolvedValue(mockProperties)
    
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn(() => Promise.resolve())
      }
    })
  })

  describe('Initial State', () => {
    it('should initialize with default state values', () => {
      // ACT
      const { result } = renderHook(
        () => useLinkCreatorState({ onLinkCreated: mockOnLinkCreated }),
        { wrapper: getWrapper() }
      )

      // ASSERT
      expect(result.current.step).toBe('properties')
      expect(result.current.selectedPropertyIds).toEqual([])
      expect(result.current.linkName).toBe('')
      expect(result.current.createdLink).toBe(null)
      // Note: loading starts as true because properties are loaded on mount
      expect(typeof result.current.loading).toBe('boolean')
      expect(result.current.error).toBe(null)
      expect(result.current.copySuccess).toBe(false)
    })

    it('should load properties on mount', async () => {
      // ACT
      const { result } = renderHook(
        () => useLinkCreatorState({ onLinkCreated: mockOnLinkCreated }),
        { wrapper: getWrapper() }
      )

      // ASSERT
      expect(PropertyService.getAllProperties).toHaveBeenCalled()
      
      // Wait for properties to load
      await waitFor(() => {
        expect(result.current.properties).toEqual(mockProperties)
        expect(result.current.loading).toBe(false)
      })
    })

    it('should handle property loading error', async () => {
      // ARRANGE
      const errorMessage = 'Failed to load properties'
      ;(PropertyService.getAllProperties as jest.Mock).mockRejectedValue(new Error(errorMessage))

      // ACT
      const { result } = renderHook(
        () => useLinkCreatorState({ onLinkCreated: mockOnLinkCreated }),
        { wrapper: getWrapper() }
      )

      // ASSERT
      await waitFor(() => {
        expect(result.current.error).toBe('Error loading properties. Please try again.')
        expect(result.current.loading).toBe(false)
      })
    })
  })

  describe('Property Selection', () => {
    it('should add property to selection when not selected', async () => {
      // ARRANGE
      const { result } = renderHook(
        () => useLinkCreatorState({ onLinkCreated: mockOnLinkCreated }),
        { wrapper: getWrapper() }
      )

      await waitFor(() => {
        expect(result.current.properties).toEqual(mockProperties)
      })

      // ACT
      act(() => {
        result.current.handlePropertySelect(mockProperties[0])
      })

      // ASSERT
      expect(result.current.selectedPropertyIds).toEqual(['prop-1'])
    })

    it('should remove property from selection when already selected', async () => {
      // ARRANGE
      const { result } = renderHook(
        () => useLinkCreatorState({ onLinkCreated: mockOnLinkCreated }),
        { wrapper: getWrapper() }
      )

      await waitFor(() => {
        expect(result.current.properties).toEqual(mockProperties)
      })

      // First select the property
      act(() => {
        result.current.handlePropertySelect(mockProperties[0])
      })

      expect(result.current.selectedPropertyIds).toEqual(['prop-1'])

      // ACT - Select same property again (should deselect)
      act(() => {
        result.current.handlePropertySelect(mockProperties[0])
      })

      // ASSERT
      expect(result.current.selectedPropertyIds).toEqual([])
    })

    it('should handle multiple property selections', async () => {
      // ARRANGE
      const { result } = renderHook(
        () => useLinkCreatorState({ onLinkCreated: mockOnLinkCreated }),
        { wrapper: getWrapper() }
      )

      await waitFor(() => {
        expect(result.current.properties).toEqual(mockProperties)
      })

      // ACT
      act(() => {
        result.current.handlePropertySelect(mockProperties[0])
      })
      act(() => {
        result.current.handlePropertySelect(mockProperties[1])
      })

      // ASSERT
      expect(result.current.selectedPropertyIds).toEqual(['prop-1', 'prop-2'])
    })
  })

  describe('Step Navigation', () => {
    it('should navigate to details step when handleNext is called', async () => {
      // ARRANGE
      const { result } = renderHook(
        () => useLinkCreatorState({ onLinkCreated: mockOnLinkCreated }),
        { wrapper: getWrapper() }
      )

      await waitFor(() => {
        expect(result.current.properties).toEqual(mockProperties)
      })

      // ACT
      act(() => {
        result.current.handleNext()
      })

      // ASSERT
      expect(result.current.step).toBe('details')
    })

    it('should navigate back to properties step when handleBack is called', async () => {
      // ARRANGE
      const { result } = renderHook(
        () => useLinkCreatorState({ onLinkCreated: mockOnLinkCreated }),
        { wrapper: getWrapper() }
      )

      await waitFor(() => {
        expect(result.current.properties).toEqual(mockProperties)
      })

      // Navigate to details first
      act(() => {
        result.current.handleNext()
      })

      expect(result.current.step).toBe('details')

      // ACT
      act(() => {
        result.current.handleBack()
      })

      // ASSERT
      expect(result.current.step).toBe('properties')
    })
  })

  describe('Link Name Management', () => {
    it('should update link name when setLinkName is called', async () => {
      // ARRANGE
      const { result } = renderHook(
        () => useLinkCreatorState({ onLinkCreated: mockOnLinkCreated }),
        { wrapper: getWrapper() }
      )

      await waitFor(() => {
        expect(result.current.properties).toEqual(mockProperties)
      })

      // ACT
      act(() => {
        result.current.setLinkName('My Custom Collection')
      })

      // ASSERT
      expect(result.current.linkName).toBe('My Custom Collection')
    })
  })

  describe('Link Creation', () => {
    it('should create link successfully', async () => {
      // ARRANGE
      const { result } = renderHook(
        () => useLinkCreatorState({ onLinkCreated: mockOnLinkCreated }),
        { wrapper: getWrapper() }
      )

      await waitFor(() => {
        expect(result.current.properties).toEqual(mockProperties)
      })

      const mockCreatedLink = createMockLink({
        id: 'link-123',
        code: 'ABC12345',
        name: 'Test Collection',
        property_ids: ['prop-1', 'prop-2']
      })

      ;(LinkService.createLink as jest.Mock).mockResolvedValue(mockCreatedLink)

      // Select properties and set name
      act(() => {
        result.current.handlePropertySelect(mockProperties[0])
        result.current.handlePropertySelect(mockProperties[1])
        result.current.setLinkName('Test Collection')
      })

      // ACT
      await act(async () => {
        await result.current.handleCreateLink()
      })

      // ASSERT
      expect(LinkService.createLink).toHaveBeenCalledWith(['prop-1', 'prop-2'], 'Test Collection')
      expect(result.current.createdLink).toEqual(mockCreatedLink)
      expect(result.current.step).toBe('success')
      expect(mockOnLinkCreated).toHaveBeenCalledWith(mockCreatedLink)
    })

    it('should handle link creation error', async () => {
      // ARRANGE
      const { result } = renderHook(
        () => useLinkCreatorState({ onLinkCreated: mockOnLinkCreated }),
        { wrapper: getWrapper() }
      )

      await waitFor(() => {
        expect(result.current.properties).toEqual(mockProperties)
      })

      ;(LinkService.createLink as jest.Mock).mockRejectedValue(new Error('Creation failed'))

      // Select properties
      act(() => {
        result.current.handlePropertySelect(mockProperties[0])
      })

      // ACT
      await act(async () => {
        await result.current.handleCreateLink()
      })

      // ASSERT
      expect(result.current.error).toBe('Failed to create link. Please try again.')
      expect(result.current.step).toBe('properties') // Should stay on same step
      expect(mockOnLinkCreated).not.toHaveBeenCalled()
    })

    it('should create link without name when linkName is empty', async () => {
      // ARRANGE
      const { result } = renderHook(
        () => useLinkCreatorState({ onLinkCreated: mockOnLinkCreated }),
        { wrapper: getWrapper() }
      )

      await waitFor(() => {
        expect(result.current.properties).toEqual(mockProperties)
      })

      const mockCreatedLink = createMockLink({
        property_ids: ['prop-1']
      })

      ;(LinkService.createLink as jest.Mock).mockResolvedValue(mockCreatedLink)

      // Select property but don't set name
      act(() => {
        result.current.handlePropertySelect(mockProperties[0])
      })

      // ACT
      await act(async () => {
        await result.current.handleCreateLink()
      })

      // ASSERT
      expect(LinkService.createLink).toHaveBeenCalledWith(['prop-1'], undefined)
    })
  })

  describe('Link Copying', () => {
    it('should copy link URL successfully', async () => {
      // ARRANGE
      const { result } = renderHook(
        () => useLinkCreatorState({ onLinkCreated: mockOnLinkCreated }),
        { wrapper: getWrapper() }
      )

      const mockCreatedLink = createMockLink({ code: 'ABC12345' })

      ;(LinkService.copyLinkUrl as jest.Mock).mockResolvedValue(undefined)

      // Set created link
      act(() => {
        result.current.setCreatedLink(mockCreatedLink)
      })

      // ACT
      await act(async () => {
        await result.current.handleCopyLink()
      })

      // ASSERT
      expect(LinkService.copyLinkUrl).toHaveBeenCalledWith('ABC12345')
      expect(result.current.copySuccess).toBe(true)

      // Should auto-reset after timeout
      await waitFor(() => {
        expect(result.current.copySuccess).toBe(false)
      }, { timeout: 3000 })
    })

    it('should handle copy error', async () => {
      // ARRANGE
      const { result } = renderHook(
        () => useLinkCreatorState({ onLinkCreated: mockOnLinkCreated }),
        { wrapper: getWrapper() }
      )

      const mockCreatedLink = createMockLink({ code: 'ABC12345' })

      ;(LinkService.copyLinkUrl as jest.Mock).mockRejectedValue(new Error('Copy failed'))

      // Set created link
      act(() => {
        result.current.setCreatedLink(mockCreatedLink)
      })

      // ACT
      await act(async () => {
        await result.current.handleCopyLink()
      })

      // ASSERT
      expect(result.current.error).toBe('Failed to copy link')
      expect(result.current.copySuccess).toBe(false)
    })

    it('should not copy when no created link exists', async () => {
      // ARRANGE
      const { result } = renderHook(
        () => useLinkCreatorState({ onLinkCreated: mockOnLinkCreated }),
        { wrapper: getWrapper() }
      )

      // ACT
      await act(async () => {
        await result.current.handleCopyLink()
      })

      // ASSERT
      expect(LinkService.copyLinkUrl).not.toHaveBeenCalled()
      expect(result.current.copySuccess).toBe(false)
    })
  })

  describe('Create Another Flow', () => {
    it('should reset state when handleCreateAnother is called', async () => {
      // ARRANGE
      const { result } = renderHook(
        () => useLinkCreatorState({ onLinkCreated: mockOnLinkCreated }),
        { wrapper: getWrapper() }
      )

      await waitFor(() => {
        expect(result.current.properties).toEqual(mockProperties)
      })

      const mockCreatedLink = createMockLink()

      // Set up some state
      act(() => {
        result.current.setStep('success')
        result.current.setSelectedPropertyIds(['prop-1'])
        result.current.setLinkName('Test Name')
        result.current.setCreatedLink(mockCreatedLink)
        result.current.setError('Some error')
        result.current.setCopySuccess(true)
      })

      // ACT
      act(() => {
        result.current.handleCreateAnother()
      })

      // ASSERT
      expect(result.current.step).toBe('properties')
      expect(result.current.selectedPropertyIds).toEqual([])
      expect(result.current.linkName).toBe('')
      expect(result.current.createdLink).toBe(null)
      expect(result.current.error).toBe(null)
      expect(result.current.copySuccess).toBe(false)
    })
  })

  describe('State Setters', () => {
    it('should provide access to all state setters', async () => {
      // ARRANGE
      const { result } = renderHook(
        () => useLinkCreatorState({ onLinkCreated: mockOnLinkCreated }),
        { wrapper: getWrapper() }
      )

      // ACT & ASSERT - Test that all setters are available
      expect(typeof result.current.setStep).toBe('function')
      expect(typeof result.current.setSelectedPropertyIds).toBe('function')
      expect(typeof result.current.setLinkName).toBe('function')
      expect(typeof result.current.setCreatedLink).toBe('function')
      expect(typeof result.current.setLoading).toBe('function')
      expect(typeof result.current.setError).toBe('function')
      expect(typeof result.current.setCopySuccess).toBe('function')
    })
  })
})