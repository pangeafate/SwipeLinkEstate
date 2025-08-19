// Simple mock that we can control in each test
const mockSingle = jest.fn()
const mockOrder = jest.fn(() => Promise.resolve({ data: [], error: null }))
const mockEq = jest.fn(() => ({ single: mockSingle }))
const mockIn = jest.fn(() => Promise.resolve({ data: [], error: null }))
const mockSelect = jest.fn(() => ({ eq: mockEq, single: mockSingle, in: mockIn, order: mockOrder }))
const mockInsert = jest.fn(() => ({ select: mockSelect }))
const mockFrom = jest.fn(() => ({
  insert: mockInsert,
  select: mockSelect,
  order: mockOrder
}))

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: mockFrom
  })
}))

import { LinkService } from '../link.service'

describe('LinkService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

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

      mockSingle.mockResolvedValue({
        data: mockLinkData,
        error: null
      })

      // ACT
      const result = await LinkService.createLink(propertyIds, name)

      // ASSERT
      expect(result).toBeDefined()
      expect(result.code).toBeDefined()
      expect(result.code).toHaveLength(8)
      expect(result.property_ids).toEqual(propertyIds)
      expect(result.name).toBe(name)
      expect(mockFrom).toHaveBeenCalledWith('links')
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

      mockSingle.mockResolvedValue({
        data: mockLinkData,
        error: null
      })

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
      
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      })

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

      // Mock the first call to get the link
      mockSingle.mockResolvedValueOnce({
        data: mockLink,
        error: null
      })

      // Mock the second call to get properties
      mockIn.mockResolvedValueOnce({
        data: mockProperties as any,
        error: null
      })

      // ACT
      const result = await LinkService.getLink(linkCode)

      // ASSERT
      expect(result).toBeDefined()
      expect(result.code).toBe(linkCode)
      expect(result.properties).toHaveLength(2)
      expect(result.properties[0].address).toBe('123 Test St')
      expect(mockFrom).toHaveBeenCalledWith('links')
      expect(mockFrom).toHaveBeenCalledWith('properties')
    })

    it('should throw error when link not found', async () => {
      // ARRANGE
      const linkCode = 'NOTFOUND'
      
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Link not found' }
      })

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

      // Mock successful link retrieval
      mockSingle.mockResolvedValueOnce({
        data: mockLink,
        error: null
      })

      // Mock failed properties loading
      mockIn.mockResolvedValueOnce({
        data: null,
        error: { message: 'Failed to load properties' }
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

      // Mock successful link retrieval
      mockSingle.mockResolvedValueOnce({
        data: mockLink,
        error: null
      })

      // Mock properties loading returning null data but no error
      mockIn.mockResolvedValueOnce({
        data: null,
        error: null
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

      mockOrder.mockResolvedValue({
        data: mockLinks,
        error: null
      })

      // ACT
      const result = await LinkService.getAgentLinks()

      // ASSERT
      expect(result).toHaveLength(2)
      expect(result[0].code).toBe('ABC12345')
      expect(result[0].name).toBe('Waterfront Collection')
      expect(result[1].code).toBe('XYZ98765')
      expect(result[1].name).toBe('Downtown Properties')
      expect(mockFrom).toHaveBeenCalledWith('links')
      expect(mockSelect).toHaveBeenCalledWith('*')
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
    })

    it('should return empty array when no links exist', async () => {
      // ARRANGE
      mockOrder.mockResolvedValue({
        data: [],
        error: null
      })

      // ACT
      const result = await LinkService.getAgentLinks()

      // ASSERT
      expect(result).toEqual([])
    })

    it('should handle null data gracefully', async () => {
      // ARRANGE
      mockOrder.mockResolvedValue({
        data: null,
        error: null
      })

      // ACT
      const result = await LinkService.getAgentLinks()

      // ASSERT
      expect(result).toEqual([])
    })

    it('should throw error when database query fails', async () => {
      // ARRANGE
      mockOrder.mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' }
      })

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

      mockOrder.mockResolvedValue({
        data: mockLinks,
        error: null
      })

      // ACT
      const result = await LinkService.getAgentLinks()

      // ASSERT
      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('Newer Collection') // Should be first (newer)
      expect(result[1].name).toBe('Older Collection') // Should be second (older)
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
    })
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

      mockSingle.mockResolvedValue({
        data: mockLinkData,
        error: null
      })

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

      mockSingle.mockResolvedValue({
        data: mockLinkData,
        error: null
      })

      // ACT
      const result = await LinkService.createLink(propertyIds, specialName)

      // ASSERT
      expect(result.name).toBe(specialName)
    })
  })
})