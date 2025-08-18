/**
 * Format price as currency
 */
export function formatPrice(price: number | null): string {
  if (!price) return 'Price on request'
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

/**
 * Format area in square feet
 */
export function formatArea(sqft: number | null): string {
  if (!sqft) return ''
  
  return new Intl.NumberFormat('en-US').format(sqft) + ' sq ft'
}

/**
 * Format bedrooms and bathrooms
 */
export function formatBedsBaths(bedrooms: number | null, bathrooms: number | null): string {
  const beds = bedrooms ? `${bedrooms} bed` + (bedrooms > 1 ? 's' : '') : ''
  const baths = bathrooms ? `${bathrooms} bath` + (bathrooms > 1 ? 's' : '') : ''
  
  if (beds && baths) {
    return `${beds}, ${baths}`
  }
  
  return beds || baths || ''
}

/**
 * Format property features as display text
 */
export function formatFeatures(features: string[] | null): string[] {
  if (!features || !Array.isArray(features)) return []
  
  return features.map(feature => {
    // Split by spaces and capitalize each word
    return feature
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  })
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  
  return formatDate(dateString)
}

/**
 * Generate a short address for display
 */
export function formatShortAddress(fullAddress: string): string {
  const parts = fullAddress.split(',')
  if (parts.length >= 2) {
    return parts.slice(0, 2).join(',').trim()
  }
  return fullAddress
}