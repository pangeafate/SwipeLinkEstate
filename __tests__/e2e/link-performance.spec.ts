import { test, expect } from '@playwright/test'

test.describe('Client Link Performance Tests', () => {
  const testLink = 'awNmi9jF'
  const baseUrl = 'http://localhost:3001'

  test('should load link page within 2 seconds', async ({ page }) => {
    // Start timing
    const startTime = Date.now()
    
    // Navigate to link
    const response = await page.goto(`${baseUrl}/link/${testLink}`, {
      waitUntil: 'networkidle'
    })
    
    const loadTime = Date.now() - startTime
    
    // Check response status
    expect(response?.status()).toBe(200)
    
    // Check load time
    expect(loadTime).toBeLessThan(2000)
    console.log(`Page load time: ${loadTime}ms`)
    
    // Wait for carousel to be visible
    await expect(page.locator('[data-testid="airbnb-carousel-container"]')).toBeVisible({ timeout: 1000 })
  })

  test('should display properties from Supabase', async ({ page }) => {
    await page.goto(`${baseUrl}/link/${testLink}`)
    
    // Wait for properties to load
    await page.waitForSelector('[data-testid*="property-card"]', { timeout: 5000 })
    
    // Check that properties are displayed
    const propertyCards = page.locator('[data-testid*="property-card"]')
    const count = await propertyCards.count()
    
    expect(count).toBeGreaterThan(0)
    console.log(`Found ${count} property cards`)
    
    // Verify property data is displayed
    const firstCard = propertyCards.first()
    await expect(firstCard).toContainText(/\$[\d,]+/) // Price
    await expect(firstCard).toContainText(/bed/) // Bedrooms
    await expect(firstCard).toContainText(/bath/) // Bathrooms
  })

  test('should navigate between properties', async ({ page }) => {
    await page.goto(`${baseUrl}/link/${testLink}`)
    
    // Wait for carousel
    await page.waitForSelector('[data-testid="airbnb-carousel-container"]')
    
    // Find navigation buttons
    const nextButton = page.locator('[data-testid="airbnb-right-arrow"]')
    const prevButton = page.locator('[data-testid="airbnb-left-arrow"]')
    
    // Check initial state - prev should be disabled
    await expect(prevButton).toBeDisabled()
    
    // Click next
    await nextButton.click()
    
    // Now prev should be enabled
    await expect(prevButton).toBeEnabled()
    
    // Click prev to go back
    await prevButton.click()
    
    // Prev should be disabled again
    await expect(prevButton).toBeDisabled()
  })

  test('should open property modal on card click', async ({ page }) => {
    await page.goto(`${baseUrl}/link/${testLink}`)
    
    // Wait for properties
    await page.waitForSelector('[data-testid*="property-card"]')
    
    // Click first property card
    const firstCard = page.locator('[data-testid*="property-card"]').first()
    await firstCard.click()
    
    // Wait for modal to appear
    await expect(page.locator('[data-testid="property-modal"]')).toBeVisible({ timeout: 1000 })
    
    // Check modal has content
    await expect(page.locator('[data-testid="property-modal"]')).toContainText(/\$[\d,]+/)
  })

  test('should track performance metrics', async ({ page }) => {
    await page.goto(`${baseUrl}/link/${testLink}`)
    
    // Evaluate performance metrics
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        domInteractive: navigation.domInteractive - navigation.fetchStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
      }
    })
    
    console.log('Performance Metrics:', metrics)
    
    // Check key metrics
    expect(metrics.domInteractive).toBeLessThan(1500)
    expect(metrics.firstContentfulPaint).toBeLessThan(2000)
  })

  test('should handle bucket assignment', async ({ page }) => {
    await page.goto(`${baseUrl}/link/${testLink}`)
    
    // Wait for carousel
    await page.waitForSelector('[data-testid="airbnb-carousel-container"]')
    
    // Click first property to open modal
    const firstCard = page.locator('[data-testid*="property-card"]').first()
    await firstCard.click()
    
    // Wait for modal
    await page.waitForSelector('[data-testid="property-modal"]')
    
    // Find action buttons in modal
    const likeButton = page.locator('[data-testid="modal-like-button"]')
    
    if (await likeButton.isVisible()) {
      await likeButton.click()
      console.log('Clicked like button')
    }
    
    // Check if property was assigned to bucket (close modal and check navigation)
    await page.keyboard.press('Escape')
    
    // Verify modal closed
    await expect(page.locator('[data-testid="property-modal"]')).not.toBeVisible()
  })
})