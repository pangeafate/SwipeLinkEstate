// Simple mock that we can control in each test
const mockSingle = jest.fn()
const mockEq = jest.fn(() => ({ single: mockSingle }))
const mockIn = jest.fn(() => Promise.resolve({ data: [], error: null }))
const mockSelect = jest.fn(() => ({ eq: mockEq, single: mockSingle, in: mockIn }))
const mockInsert = jest.fn(() => ({ select: mockSelect }))
const mockOrder = jest.fn(() => ({ select: mockSelect }))
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
  })
})