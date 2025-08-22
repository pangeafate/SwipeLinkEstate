import {
  getTemperatureColor,
  getStatusColor,
  getEngagementColor,
  formatTimeAgo,
  getStageProgress,
  getGridCols
} from '../deal-card.utils'

describe('Deal Card Utilities', () => {
  describe('getTemperatureColor', () => {
    it('should return correct color for hot temperature', () => {
      expect(getTemperatureColor('hot')).toBe('bg-red-500')
    })

    it('should return correct color for warm temperature', () => {
      expect(getTemperatureColor('warm')).toBe('bg-orange-500')
    })

    it('should return correct color for cold temperature', () => {
      expect(getTemperatureColor('cold')).toBe('bg-gray-500')
    })
  })

  describe('getStatusColor', () => {
    it('should return correct color for active status', () => {
      expect(getStatusColor('active')).toBe('bg-blue-100 text-blue-800 border-blue-200')
    })

    it('should return correct color for qualified status', () => {
      expect(getStatusColor('qualified')).toBe('bg-green-100 text-green-800 border-green-200')
    })

    it('should return correct color for nurturing status', () => {
      expect(getStatusColor('nurturing')).toBe('bg-yellow-100 text-yellow-800 border-yellow-200')
    })

    it('should return correct color for closed-won status', () => {
      expect(getStatusColor('closed-won')).toBe('bg-emerald-100 text-emerald-800 border-emerald-200')
    })

    it('should return correct color for closed-lost status', () => {
      expect(getStatusColor('closed-lost')).toBe('bg-red-100 text-red-800 border-red-200')
    })
  })

  describe('getEngagementColor', () => {
    it('should return red color for high engagement (>= 80)', () => {
      expect(getEngagementColor(80)).toBe('text-red-600 font-semibold')
      expect(getEngagementColor(90)).toBe('text-red-600 font-semibold')
      expect(getEngagementColor(100)).toBe('text-red-600 font-semibold')
    })

    it('should return orange color for medium engagement (50-79)', () => {
      expect(getEngagementColor(50)).toBe('text-orange-600 font-medium')
      expect(getEngagementColor(65)).toBe('text-orange-600 font-medium')
      expect(getEngagementColor(79)).toBe('text-orange-600 font-medium')
    })

    it('should return gray color for low engagement (< 50)', () => {
      expect(getEngagementColor(0)).toBe('text-gray-600')
      expect(getEngagementColor(25)).toBe('text-gray-600')
      expect(getEngagementColor(49)).toBe('text-gray-600')
    })
  })

  describe('formatTimeAgo', () => {
    it('should return "No activity" for null input', () => {
      expect(formatTimeAgo(null)).toBe('No activity')
    })

    it('should format minutes ago correctly', () => {
      const now = new Date()
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)
      expect(formatTimeAgo(fiveMinutesAgo.toISOString())).toBe('5m ago')
    })

    it('should format hours ago correctly', () => {
      const now = new Date()
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000)
      expect(formatTimeAgo(twoHoursAgo.toISOString())).toBe('2h ago')
    })

    it('should format days ago correctly', () => {
      const now = new Date()
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
      expect(formatTimeAgo(threeDaysAgo.toISOString())).toBe('3d ago')
    })

    it('should format older dates as locale date string', () => {
      const now = new Date()
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
      const expected = twoWeeksAgo.toLocaleDateString()
      expect(formatTimeAgo(twoWeeksAgo.toISOString())).toBe(expected)
    })

    it('should handle edge cases', () => {
      const now = new Date()
      const justNow = new Date(now.getTime() - 30 * 1000) // 30 seconds ago
      expect(formatTimeAgo(justNow.toISOString())).toBe('0m ago')
    })
  })

  describe('getStageProgress', () => {
    it('should return correct progress for created stage', () => {
      expect(getStageProgress('created')).toBe(15)
    })

    it('should return correct progress for shared stage', () => {
      expect(getStageProgress('shared')).toBe(30)
    })

    it('should return correct progress for accessed stage', () => {
      expect(getStageProgress('accessed')).toBe(45)
    })

    it('should return correct progress for engaged stage', () => {
      expect(getStageProgress('engaged')).toBe(60)
    })

    it('should return correct progress for qualified stage', () => {
      expect(getStageProgress('qualified')).toBe(75)
    })

    it('should return correct progress for advanced stage', () => {
      expect(getStageProgress('advanced')).toBe(90)
    })

    it('should return correct progress for closed stage', () => {
      expect(getStageProgress('closed')).toBe(100)
    })

    it('should return 0 for unknown stage', () => {
      expect(getStageProgress('unknown')).toBe(0)
      expect(getStageProgress('')).toBe(0)
    })
  })

  describe('getGridCols', () => {
    it('should return correct grid classes for 1 column', () => {
      expect(getGridCols(1)).toBe('grid-cols-1')
    })

    it('should return correct grid classes for 2 columns', () => {
      expect(getGridCols(2)).toBe('grid-cols-1 md:grid-cols-2')
    })

    it('should return correct grid classes for 3 columns', () => {
      expect(getGridCols(3)).toBe('grid-cols-1 md:grid-cols-2 lg:grid-cols-3')
    })

    it('should return correct grid classes for 4 columns', () => {
      expect(getGridCols(4)).toBe('grid-cols-1 md:grid-cols-2 lg:grid-cols-4')
    })

    it('should fallback to 3 columns for unsupported column counts', () => {
      expect(getGridCols(5)).toBe('grid-cols-1 md:grid-cols-2 lg:grid-cols-3')
      expect(getGridCols(0)).toBe('grid-cols-1 md:grid-cols-2 lg:grid-cols-3')
    })
  })
})