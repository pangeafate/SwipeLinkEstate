// Formatters utility tests
import {
  formatPrice,
  formatArea,
  formatBedsBaths,
  formatFeatures,
  formatDate,
  formatRelativeTime,
  formatShortAddress
} from '../formatters'

describe('formatters', () => {
  describe('formatPrice', () => {
    it('should format valid price as currency', () => {
      expect(formatPrice(1200000)).toBe('$1,200,000')
      expect(formatPrice(500000)).toBe('$500,000')
    })

    it('should handle null/zero/undefined price', () => {
      expect(formatPrice(null)).toBe('Price on request')
      expect(formatPrice(0)).toBe('Price on request')
    })
  })

  describe('formatArea', () => {
    it('should format valid area with sq ft', () => {
      expect(formatArea(1800)).toBe('1,800 sq ft')
      expect(formatArea(2500)).toBe('2,500 sq ft')
    })

    it('should handle null area', () => {
      expect(formatArea(null)).toBe('')
      expect(formatArea(0)).toBe('')
    })
  })

  describe('formatBedsBaths', () => {
    it('should format beds and baths correctly', () => {
      expect(formatBedsBaths(3, 2)).toBe('3 beds, 2 baths')
      expect(formatBedsBaths(1, 1)).toBe('1 bed, 1 bath')
      expect(formatBedsBaths(4, 3)).toBe('4 beds, 3 baths')
    })

    it('should handle only beds', () => {
      expect(formatBedsBaths(2, null)).toBe('2 beds')
      expect(formatBedsBaths(1, null)).toBe('1 bed')
    })

    it('should handle only baths', () => {
      expect(formatBedsBaths(null, 2)).toBe('2 baths')
      expect(formatBedsBaths(null, 1)).toBe('1 bath')
    })

    it('should handle no beds or baths', () => {
      expect(formatBedsBaths(null, null)).toBe('')
    })
  })

  describe('formatFeatures', () => {
    it('should capitalize features correctly', () => {
      expect(formatFeatures(['ocean view', 'balcony'])).toEqual(['Ocean View', 'Balcony'])
      expect(formatFeatures(['pool', 'garage parking'])).toEqual(['Pool', 'Garage Parking'])
    })

    it('should handle null/empty features', () => {
      expect(formatFeatures(null)).toEqual([])
      expect(formatFeatures([])).toEqual([])
    })

    it('should handle non-array input', () => {
      expect(formatFeatures('not-an-array' as any)).toEqual([])
    })
  })

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const result = formatDate('2024-01-15')
      expect(result).toBe('Jan 15, 2024')
    })
  })

  describe('formatRelativeTime', () => {
    beforeEach(() => {
      // Mock current time to Jan 15, 2024 12:00 PM
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2024-01-15T12:00:00Z'))
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should handle "just now"', () => {
      const now = new Date().toISOString()
      expect(formatRelativeTime(now)).toBe('Just now')
    })

    it('should handle minutes ago', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
      expect(formatRelativeTime(fiveMinutesAgo)).toBe('5 mins ago')
      
      const oneMinuteAgo = new Date(Date.now() - 1 * 60 * 1000).toISOString()
      expect(formatRelativeTime(oneMinuteAgo)).toBe('1 min ago')
    })

    it('should handle hours ago', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      expect(formatRelativeTime(twoHoursAgo)).toBe('2 hours ago')
      
      const oneHourAgo = new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      expect(formatRelativeTime(oneHourAgo)).toBe('1 hour ago')
    })

    it('should handle days ago', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      expect(formatRelativeTime(threeDaysAgo)).toBe('3 days ago')
    })

    it('should fall back to formatted date for old dates', () => {
      const oldDate = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString()
      expect(formatRelativeTime(oldDate)).toMatch(/Dec \d+, 2023/)
    })
  })

  describe('formatShortAddress', () => {
    it('should shorten full address to first two parts', () => {
      expect(formatShortAddress('123 Ocean Drive, Miami Beach, FL 33139'))
        .toBe('123 Ocean Drive, Miami Beach')
    })

    it('should handle short addresses', () => {
      expect(formatShortAddress('123 Main Street'))
        .toBe('123 Main Street')
    })

    it('should handle single part addresses', () => {
      expect(formatShortAddress('Property Name'))
        .toBe('Property Name')
    })
  })
})