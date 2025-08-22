import { LinkService } from '../link.service'
import { setupTest } from '@/test/utils/testSetup'
import { SupabaseMockFactory } from '@/test/mocks'

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn(),
}

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabaseClient
}))

describe('LinkService', () => {
  setupTest({ suppressConsoleErrors: true })

  describe('createLink', () => {
    it('should create a new link with property IDs and optional name', async () => {
      // ARRANGE
      const propertyIds = ['uuid-1', 'uuid-2', 'uuid-3']
      const name = 'Waterfront Collection'
      
      const mockLinkData = {
        id: 'link-uuid',
        code: 'ABC12345',
        name,
        property_ids: propertyIds,
        created_at: new Date().toISOString(),
        expires_at: null
      }

      // Setup mock chain for insert operation: .from('links').insert().select().single()
      const mockSingle = jest.fn().mockResolvedValue({
        data: mockLinkData,
        error: null
      })
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle })
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect })
      mockSupabaseClient.from.mockReturnValue({ insert: mockInsert })

      // ACT
      const result = await LinkService.createLink(propertyIds, name)

      // ASSERT
      expect(result).toBeDefined()
      expect(result.code).toBeDefined()
      expect(result.code).toHaveLength(8)
      expect(result.property_ids).toEqual(propertyIds)
      expect(result.name).toBe(name)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('links')
    })

    it('should create a link without name', async () => {
      // ARRANGE
      const propertyIds = ['uuid-1', 'uuid-2']
      
      const mockLinkData = {
        id: 'link-uuid',
        code: 'XYZ98765',
        name: null,
        property_ids: propertyIds,
        created_at: new Date().toISOString(),
        expires_at: null
      }

      // Setup mock chain for insert operation
      const mockSingle = jest.fn().mockResolvedValue({
        data: mockLinkData,
        error: null
      })
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle })
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect })
      mockSupabaseClient.from.mockReturnValue({ insert: mockInsert })

      // ACT
      const result = await LinkService.createLink(propertyIds)

      // ASSERT
      expect(result).toBeDefined()
      expect(result.code).toBeDefined()
      expect(result.property_ids).toEqual(propertyIds)
      expect(result.name).toBeNull()
    })

    it('should throw error with empty property IDs', async () => {
      // ARRANGE
      const propertyIds: string[] = []

      // ACT & ASSERT
      await expect(LinkService.createLink(propertyIds))
        .rejects
        .toThrow('Property IDs cannot be empty')
    })

    it('should throw error when database insert fails', async () => {
      // ARRANGE
      const propertyIds = ['uuid-1']
      
      // Setup mock chain for insert operation that fails
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      })
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle })
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect })
      mockSupabaseClient.from.mockReturnValue({ insert: mockInsert })

      // ACT & ASSERT
      await expect(LinkService.createLink(propertyIds))
        .rejects
        .toThrow('Failed to create link: Database error')
    })
  })

  describe('getLink', () => {
    it('should retrieve link with properties by code', async () => {
      // ARRANGE
      const linkCode = 'ABC12345'
      
      const mockLink = {
        id: 'link-uuid',
        code: linkCode,
        name: 'Test Collection',
        property_ids: JSON.stringify(['uuid-1', 'uuid-2']),
        created_at: new Date().toISOString(),
        expires_at: null
      }

      const mockProperties = [
        {
          id: 'uuid-1',
          address: '123 Test St',
          price: 500000,
          bedrooms: 2,
          bathrooms: 2.0,
          area_sqft: 1200,
          description: null,
          features: null,
          cover_image: 'image1.jpg',
          images: null,
          status: 'active',
          created_at: '2023-01-01T00:00:00.000Z',
          updated_at: '2023-01-01T00:00:00.000Z'
        },
        {
          id: 'uuid-2', 
          address: '456 Test Ave',
          price: 750000,
          bedrooms: 3,
          bathrooms: 2.5,
          area_sqft: 1800,
          description: null,
          features: null,
          cover_image: 'image2.jpg',
          images: null,
          status: 'active',
          created_at: '2023-01-01T00:00:00.000Z',
          updated_at: '2023-01-01T00:00:00.000Z'
        }
      ]

      // Setup mock chain for first query: .from('links').select('*').eq('code', code).single()
      const mockSingleForLink = jest.fn().mockResolvedValue({
        data: mockLink,
        error: null
      })
      const mockEqForLink = jest.fn().mockReturnValue({ single: mockSingleForLink })
      const mockSelectForLink = jest.fn().mockReturnValue({ eq: mockEqForLink })

      // Setup mock chain for second query: .from('properties').select('*').in('id', propertyIds)
      // Note: Status filter removed to fix link preview issue
      const mockInForProperties = jest.fn().mockResolvedValue({
        data: mockProperties,
        error: null
      })
      const mockSelectForProperties = jest.fn().mockReturnValue({ in: mockInForProperties })

      // Mock different behaviors for different table calls
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'links') {
          return { select: mockSelectForLink }
        } else if (table === 'properties') {
          return { select: mockSelectForProperties }
        }
        throw new Error(`Unexpected table: ${table}`)
      })

      // ACT
      const result = await LinkService.getLink(linkCode)

      // ASSERT
      expect(result).toBeDefined()
      expect(result.code).toBe(linkCode)
      expect(result.properties).toHaveLength(2)
      expect(result.properties[0].address).toBe('123 Test St')
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('links')
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('properties')
    })

    it('should throw error when link not found', async () => {
      // ARRANGE
      const linkCode = 'NOTFOUND'
      
      // Setup mock chain for first query that fails
      const mockSingleForLink = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Link not found' }
      })
      const mockEqForLink = jest.fn().mockReturnValue({ single: mockSingleForLink })
      const mockSelectForLink = jest.fn().mockReturnValue({ eq: mockEqForLink })
      mockSupabaseClient.from.mockReturnValue({ select: mockSelectForLink })

      // ACT & ASSERT
      await expect(LinkService.getLink(linkCode))
        .rejects
        .toThrow('Link not found')
    })

    it('should throw error when properties loading fails', async () => {
      // ARRANGE
      const linkCode = 'ABC12345'
      
      const mockLink = {
        id: 'link-uuid',
        code: linkCode,
        name: 'Test Collection',
        property_ids: JSON.stringify(['uuid-1', 'uuid-2']),
        created_at: new Date().toISOString(),
        expires_at: null
      }

      // Setup mock chain for successful link retrieval
      const mockSingleForLink = jest.fn().mockResolvedValue({
        data: mockLink,
        error: null
      })
      const mockEqForLink = jest.fn().mockReturnValue({ single: mockSingleForLink })
      const mockSelectForLink = jest.fn().mockReturnValue({ eq: mockEqForLink })

      // Setup mock chain for failed properties loading  
      const mockInForProperties = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Failed to load properties' }
      })
      const mockSelectForProperties = jest.fn().mockReturnValue({ in: mockInForProperties })

      // Mock different behaviors for different table calls
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'links') {
          return { select: mockSelectForLink }
        } else if (table === 'properties') {
          return { select: mockSelectForProperties }
        }
        throw new Error(`Unexpected table: ${table}`)
      })

      // ACT & ASSERT
      await expect(LinkService.getLink(linkCode))
        .rejects
        .toThrow('Failed to load properties: Failed to load properties')
    })

    it('should handle empty properties result', async () => {
      // ARRANGE
      const linkCode = 'ABC12345'
      
      const mockLink = {
        id: 'link-uuid',
        code: linkCode,
        name: 'Test Collection',
        property_ids: JSON.stringify(['uuid-1', 'uuid-2']),
        created_at: new Date().toISOString(),
        expires_at: null
      }

      // Setup mock chain for successful link retrieval
      const mockSingleForLink = jest.fn().mockResolvedValue({
        data: mockLink,
        error: null
      })
      const mockEqForLink = jest.fn().mockReturnValue({ single: mockSingleForLink })
      const mockSelectForLink = jest.fn().mockReturnValue({ eq: mockEqForLink })

      // Setup mock chain for empty properties result
      const mockInForProperties = jest.fn().mockResolvedValue({
        data: null,
        error: null
      })
      const mockSelectForProperties = jest.fn().mockReturnValue({ in: mockInForProperties })

      // Mock different behaviors for different table calls
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'links') {
          return { select: mockSelectForLink }
        } else if (table === 'properties') {
          return { select: mockSelectForProperties }
        }
        throw new Error(`Unexpected table: ${table}`)
      })

      // ACT
      const result = await LinkService.getLink(linkCode)

      // ASSERT
      expect(result).toBeDefined()
      expect(result.code).toBe(linkCode)
      expect(result.properties).toEqual([])
    })
  })

  describe('generateLinkCode', () => {
    it('should generate 8-character alphanumeric code', () => {
      // ACT
      const code = LinkService.generateLinkCode()

      // ASSERT
      expect(code).toHaveLength(8)
      expect(code).toMatch(/^[A-Za-z0-9]{8}$/)
    })

    it('should generate unique codes', () => {
      // ACT
      const code1 = LinkService.generateLinkCode()
      const code2 = LinkService.generateLinkCode()

      // ASSERT
      expect(code1).not.toBe(code2)
    })
  })

  describe('copyLinkUrl', () => {
    const mockWriteText = jest.fn()
    
    beforeEach(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: mockWriteText
        },
        writable: true
      })
    })

    it('should copy link URL to clipboard', async () => {
      // ARRANGE
      const linkCode = 'ABC12345'
      const expectedUrl = `${window.location.origin}/link/${linkCode}`
      mockWriteText.mockResolvedValue(undefined)

      // ACT
      await LinkService.copyLinkUrl(linkCode)

      // ASSERT
      expect(mockWriteText).toHaveBeenCalledWith(expectedUrl)
    })

    it('should throw error when clipboard not available', async () => {
      // ARRANGE
      const linkCode = 'ABC12345'
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        writable: true
      })

      // ACT & ASSERT
      await expect(LinkService.copyLinkUrl(linkCode))
        .rejects
        .toThrow('Clipboard not available')
    })

    it('should throw error when clipboard writeText fails', async () => {
      // ARRANGE
      const linkCode = 'ABC12345'
      mockWriteText.mockRejectedValue(new Error('Clipboard operation failed'))

      // ACT & ASSERT
      await expect(LinkService.copyLinkUrl(linkCode))
        .rejects
        .toThrow('Clipboard operation failed')
    })

    it('should handle null navigator clipboard', async () => {
      // ARRANGE
      const linkCode = 'ABC12345'
      Object.defineProperty(navigator, 'clipboard', {
        value: null,
        writable: true
      })

      // ACT & ASSERT
      await expect(LinkService.copyLinkUrl(linkCode))
        .rejects
        .toThrow('Clipboard not available')
    })
  })

  describe('getAgentLinks', () => {
    it('should retrieve all links for agent dashboard', async () => {
      // ARRANGE
      const mockLinks = [
        {
          id: 'link-1',
          code: 'ABC12345',
          name: 'Waterfront Collection',
          property_ids: JSON.stringify(['uuid-1', 'uuid-2']),
          created_at: '2023-01-01T00:00:00.000Z',
          expires_at: null
        },
        {
          id: 'link-2',
          code: 'XYZ98765',
          name: 'Downtown Properties',
          property_ids: JSON.stringify(['uuid-3', 'uuid-4']),
          created_at: '2023-01-02T00:00:00.000Z',
          expires_at: null
        }
      ]

      // Setup mock chain for: .from('links').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(from, to)
      const mockRange = jest.fn().mockResolvedValue({
        data: mockLinks,
        error: null,
        count: mockLinks.length
      })
      const mockOrder = jest.fn().mockReturnValue({ range: mockRange })
      const mockSelect = jest.fn().mockReturnValue({ order: mockOrder })
      mockSupabaseClient.from.mockReturnValue({ select: mockSelect })

      // ACT
      const result = await LinkService.getAgentLinks()

      // ASSERT
      expect(result.data).toHaveLength(2)
      expect(result.data[0].code).toBe('ABC12345')
      expect(result.data[0].name).toBe('Waterfront Collection')
      expect(result.data[1].code).toBe('XYZ98765')
      expect(result.data[1].name).toBe('Downtown Properties')
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('links')
      expect(mockSelect).toHaveBeenCalledWith('*', { count: 'exact' })
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
    })

    it('should return empty array when no links exist', async () => {
      // ARRANGE
      const mockRange = jest.fn().mockResolvedValue({
        data: [],
        error: null,
        count: 0
      })
      const mockOrder = jest.fn().mockReturnValue({ range: mockRange })
      const mockSelect = jest.fn().mockReturnValue({ order: mockOrder })
      mockSupabaseClient.from.mockReturnValue({ select: mockSelect })

      // ACT
      const result = await LinkService.getAgentLinks()

      // ASSERT
      expect(result.data).toEqual([])
      expect(result.count).toBe(0)
    })

    it('should handle null data gracefully', async () => {
      // ARRANGE
      const mockRange = jest.fn().mockResolvedValue({
        data: null,
        error: null,
        count: 0
      })
      const mockOrder = jest.fn().mockReturnValue({ range: mockRange })
      const mockSelect = jest.fn().mockReturnValue({ order: mockOrder })
      mockSupabaseClient.from.mockReturnValue({ select: mockSelect })

      // ACT
      const result = await LinkService.getAgentLinks()

      // ASSERT
      expect(result.data).toEqual([])
      expect(result.count).toBe(0)
    })

    it('should throw error when database query fails', async () => {
      // ARRANGE
      const mockRange = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' },
        count: null
      })
      const mockOrder = jest.fn().mockReturnValue({ range: mockRange })
      const mockSelect = jest.fn().mockReturnValue({ order: mockOrder })
      mockSupabaseClient.from.mockReturnValue({ select: mockSelect })

      // ACT & ASSERT
      await expect(LinkService.getAgentLinks())
        .rejects
        .toThrow('Failed to fetch links: Database connection failed')
    })

    it('should order links by created_at descending', async () => {
      // ARRANGE
      const mockLinks = [
        {
          id: 'link-2',
          code: 'XYZ98765',
          name: 'Newer Collection',
          property_ids: JSON.stringify(['uuid-3']),
          created_at: '2023-01-02T00:00:00.000Z',
          expires_at: null
        },
        {
          id: 'link-1',
          code: 'ABC12345',
          name: 'Older Collection',
          property_ids: JSON.stringify(['uuid-1']),
          created_at: '2023-01-01T00:00:00.000Z',
          expires_at: null
        }
      ]

      const mockRange = jest.fn().mockResolvedValue({
        data: mockLinks,
        error: null,
        count: mockLinks.length
      })
      const mockOrder = jest.fn().mockReturnValue({ range: mockRange })
      const mockSelect = jest.fn().mockReturnValue({ order: mockOrder })
      mockSupabaseClient.from.mockReturnValue({ select: mockSelect })

      // ACT
      const result = await LinkService.getAgentLinks()

      // ASSERT
      expect(result.data).toHaveLength(2)
      expect(result.data[0].name).toBe('Newer Collection') // Should be first (newer)
      expect(result.data[1].name).toBe('Older Collection') // Should be second (older)
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
    })
  })

  describe('getAgentLinksSimple', () => {
    it('should retrieve simple links without properties', async () => {
      // ARRANGE
      const mockLinks = [
        {
          id: 'link-1',
          code: 'ABC12345',
          name: 'Waterfront Collection',
          property_ids: JSON.stringify(['uuid-1', 'uuid-2']),
          created_at: '2023-01-01T00:00:00.000Z'
        },
        {
          id: 'link-2',
          code: 'XYZ98765',
          name: 'Downtown Properties',
          property_ids: JSON.stringify(['uuid-3', 'uuid-4']),
          created_at: '2023-01-02T00:00:00.000Z'
        }
      ]

      // Setup mock chain for: .from('links').select('id, code, name, created_at, property_ids').order('created_at', { ascending: false })
      const mockOrder = jest.fn().mockResolvedValue({
        data: mockLinks,
        error: null
      })
      const mockSelect = jest.fn().mockReturnValue({ order: mockOrder })
      mockSupabaseClient.from.mockReturnValue({ select: mockSelect })

      // ACT
      const result = await LinkService.getAgentLinksSimple()

      // ASSERT
      expect(result).toHaveLength(2)
      expect(result[0].code).toBe('ABC12345')
      expect(result[0].name).toBe('Waterfront Collection')
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('links')
      expect(mockSelect).toHaveBeenCalledWith('id, code, name, created_at, property_ids')
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
    })

    it('should handle empty result gracefully', async () => {
      // ARRANGE
      const mockOrder = jest.fn().mockResolvedValue({
        data: [],
        error: null
      })
      const mockSelect = jest.fn().mockReturnValue({ order: mockOrder })
      mockSupabaseClient.from.mockReturnValue({ select: mockSelect })

      // ACT
      const result = await LinkService.getAgentLinksSimple()

      // ASSERT
      expect(result).toEqual([])
    })

    it('should throw error when query fails', async () => {
      // ARRANGE
      const mockOrder = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      })
      const mockSelect = jest.fn().mockReturnValue({ order: mockOrder })
      mockSupabaseClient.from.mockReturnValue({ select: mockSelect })

      // ACT & ASSERT
      await expect(LinkService.getAgentLinksSimple())
        .rejects
        .toThrow('Failed to fetch links: Database error')
    })
  })

  describe('deleteLink', () => {
    it('should delete link successfully', async () => {
      // ARRANGE
      const linkCode = 'ABC12345'

      // Setup mock chain for: .from('links').delete().eq('code', code)
      const mockEq = jest.fn().mockResolvedValue({
        error: null
      })
      const mockDelete = jest.fn().mockReturnValue({ eq: mockEq })
      mockSupabaseClient.from.mockReturnValue({ delete: mockDelete })

      // ACT
      await LinkService.deleteLink(linkCode)

      // ASSERT
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('links')
      expect(mockEq).toHaveBeenCalledWith('code', linkCode)
    })

    it('should throw error when delete fails', async () => {
      // ARRANGE
      const linkCode = 'ABC12345'

      const mockEq = jest.fn().mockResolvedValue({
        error: { message: 'Delete failed' }
      })
      const mockDelete = jest.fn().mockReturnValue({ eq: mockEq })
      mockSupabaseClient.from.mockReturnValue({ delete: mockDelete })

      // ACT & ASSERT
      await expect(LinkService.deleteLink(linkCode))
        .rejects
        .toThrow('Failed to delete link: Delete failed')
    })
  })

  describe('updateLink', () => {
    it('should update link name and property IDs', async () => {
      // ARRANGE
      const linkCode = 'ABC12345'
      const updates = {
        name: 'Updated Collection',
        property_ids: ['uuid-1', 'uuid-3']
      }

      const mockUpdatedLink = {
        id: 'link-uuid',
        code: linkCode,
        name: updates.name,
        property_ids: JSON.stringify(updates.property_ids),
        created_at: new Date().toISOString(),
        expires_at: null
      }

      // Setup mock chain for: .from('links').update().eq('code', code).select().single()
      const mockSingle = jest.fn().mockResolvedValue({
        data: mockUpdatedLink,
        error: null
      })
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle })
      const mockEq = jest.fn().mockReturnValue({ select: mockSelect })
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq })
      mockSupabaseClient.from.mockReturnValue({ update: mockUpdate })

      // ACT
      const result = await LinkService.updateLink(linkCode, updates)

      // ASSERT
      expect(result).toBeDefined()
      expect(result.name).toBe(updates.name)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('links')
      expect(mockUpdate).toHaveBeenCalledWith({
        name: updates.name,
        property_ids: JSON.stringify(updates.property_ids)
      })
      expect(mockEq).toHaveBeenCalledWith('code', linkCode)
    })

    it('should update only name when property_ids not provided', async () => {
      // ARRANGE
      const linkCode = 'ABC12345'
      const updates = { name: 'New Name Only' }

      const mockUpdatedLink = {
        id: 'link-uuid',
        code: linkCode,
        name: updates.name,
        property_ids: JSON.stringify(['uuid-1']),
        created_at: new Date().toISOString(),
        expires_at: null
      }

      const mockSingle = jest.fn().mockResolvedValue({
        data: mockUpdatedLink,
        error: null
      })
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle })
      const mockEq = jest.fn().mockReturnValue({ select: mockSelect })
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq })
      mockSupabaseClient.from.mockReturnValue({ update: mockUpdate })

      // ACT
      const result = await LinkService.updateLink(linkCode, updates)

      // ASSERT
      expect(result.name).toBe(updates.name)
      expect(mockUpdate).toHaveBeenCalledWith({ name: updates.name })
    })

    it('should throw error when update fails', async () => {
      // ARRANGE
      const linkCode = 'ABC12345'
      const updates = { name: 'Failed Update' }

      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Update failed' }
      })
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle })
      const mockEq = jest.fn().mockReturnValue({ select: mockSelect })
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq })
      mockSupabaseClient.from.mockReturnValue({ update: mockUpdate })

      // ACT & ASSERT
      await expect(LinkService.updateLink(linkCode, updates))
        .rejects
        .toThrow('Failed to update link: Update failed')
    })
  })

  describe('getLinkAnalytics', () => {
    // Note: These tests are simplified due to dynamic import complexity in Jest
    // The actual method handles analytics service failure gracefully with fallback values
    it('should have getLinkAnalytics method available', () => {
      // ASSERT
      expect(typeof LinkService.getLinkAnalytics).toBe('function')
    })

    it('should return fallback analytics when service unavailable', async () => {
      // ARRANGE
      const linkCode = 'NONEXISTENT'
      
      // Mock console.error to avoid test output noise
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      // ACT - This will fail to import the analytics service and use fallback
      const result = await LinkService.getLinkAnalytics(linkCode)

      // ASSERT - Should return fallback values
      expect(result).toEqual({
        totalViews: 0,
        uniqueViews: 0,
        totalSwipes: 0,
        totalLikes: 0,
        totalDislikes: 0,
        recentActivity: []
      })

      // Cleanup
      consoleSpy.mockRestore()
    })
  })

  it('should retrieve link with properties regardless of status field', async () => {
    // ARRANGE - This test verifies the fix for the user's issue where:
    // Links are now successfully retrieved even if properties don't have status='active'
    const linkCode = 'DASH123'
    
    const mockLink = {
      id: 'dashboard-link',
      code: linkCode,
      name: 'Dashboard Collection',
      property_ids: JSON.stringify(['prop-1', 'prop-2']),
      created_at: '2024-01-01T00:00:00Z',
      expires_at: null
    }

    const mockProperties = [
      {
        id: 'prop-1',
        address: '123 Dashboard St',
        price: 500000,
        bedrooms: 2,
        bathrooms: 2.0,
        area_sqft: 1200,
        // Note: No explicit status field - this would previously cause issues
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z'
      },
      {
        id: 'prop-2',
        address: '456 Dashboard Ave',
        price: 750000,
        bedrooms: 3,
        bathrooms: 2.5,
        area_sqft: 1800,
        status: null, // Explicitly null status
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z'
      }
    ]

    // Setup mock chain for successful link retrieval
    const mockSingleForLink = jest.fn().mockResolvedValue({
      data: mockLink,
      error: null
    })
    const mockEqForLink = jest.fn().mockReturnValue({ single: mockSingleForLink })
    const mockSelectForLink = jest.fn().mockReturnValue({ eq: mockEqForLink })

    // Setup mock chain for properties query - now returns all properties regardless of status
    const mockInForProperties = jest.fn().mockResolvedValue({
      data: mockProperties,
      error: null
    })
    const mockSelectForProperties = jest.fn().mockReturnValue({ in: mockInForProperties })

    // Mock different behaviors for different table calls
    mockSupabaseClient.from.mockImplementation((table: string) => {
      if (table === 'links') {
        return { select: mockSelectForLink }
      } else if (table === 'properties') {
        return { select: mockSelectForProperties }
      }
      throw new Error(`Unexpected table: ${table}`)
    })

    // ACT
    const result = await LinkService.getLink(linkCode)

    // ASSERT - The fix! Link now properly includes all properties
    expect(result).toBeDefined()
    expect(result.code).toBe(linkCode)
    expect(result.name).toBe('Dashboard Collection')
    expect(result.properties).toHaveLength(2) // Properties are now included!
    expect(result.properties[0].address).toBe('123 Dashboard St')
    expect(result.properties[1].address).toBe('456 Dashboard Ave')
    
    // Verify no status filter was applied
    expect(mockInForProperties).toHaveBeenCalledWith('id', ['prop-1', 'prop-2'])
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle null property IDs in createLink', async () => {
      // ARRANGE
      const propertyIds = null as any

      // ACT & ASSERT
      await expect(LinkService.createLink(propertyIds))
        .rejects
        .toThrow('Property IDs cannot be empty')
    })

    it('should handle undefined property IDs in createLink', async () => {
      // ARRANGE
      const propertyIds = undefined as any

      // ACT & ASSERT
      await expect(LinkService.createLink(propertyIds))
        .rejects
        .toThrow('Property IDs cannot be empty')
    })

    it('should generate different codes on multiple calls', () => {
      // ACT - Generate multiple codes
      const codes = new Set()
      for (let i = 0; i < 100; i++) {
        codes.add(LinkService.generateLinkCode())
      }

      // ASSERT - Should have high uniqueness (allowing for rare collisions)
      expect(codes.size).toBeGreaterThan(95) // At least 95% unique
    })

    it('should handle very long link names', async () => {
      // ARRANGE
      const propertyIds = ['uuid-1']
      const veryLongName = 'a'.repeat(1000)
      
      const mockLinkData = {
        id: 'link-uuid',
        code: 'ABC12345',
        name: veryLongName,
        property_ids: propertyIds,
        created_at: new Date().toISOString(),
        expires_at: null
      }

      // Setup mock chain for insert operation
      const mockSingle = jest.fn().mockResolvedValue({
        data: mockLinkData,
        error: null
      })
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle })
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect })
      mockSupabaseClient.from.mockReturnValue({ insert: mockInsert })

      // ACT
      const result = await LinkService.createLink(propertyIds, veryLongName)

      // ASSERT
      expect(result.name).toBe(veryLongName)
    })

    it('should handle special characters in link names', async () => {
      // ARRANGE
      const propertyIds = ['uuid-1']
      const specialName = 'Link with émojis 🏠 & symbols!'
      
      const mockLinkData = {
        id: 'link-uuid',
        code: 'ABC12345',
        name: specialName,
        property_ids: propertyIds,
        created_at: new Date().toISOString(),
        expires_at: null
      }

      // Setup mock chain for insert operation
      const mockSingle = jest.fn().mockResolvedValue({
        data: mockLinkData,
        error: null
      })
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle })
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect })
      mockSupabaseClient.from.mockReturnValue({ insert: mockInsert })

      // ACT
      const result = await LinkService.createLink(propertyIds, specialName)

      // ASSERT
      expect(result.name).toBe(specialName)
    })
  })
})