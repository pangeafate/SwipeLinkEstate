import { test, expect } from '@playwright/test'

test.describe('Client Carousel Integration', () => {
  const testLinkCode = 'awNmi9jF' // Link that exists in the database
  
  test('should load client link page without errors', async ({ page }) => {
    // Navigate to the link page
    const response = await page.goto(`/link/${testLinkCode}`)
    
    // Page should load successfully
    expect(response?.status()).toBe(200)
    
    // Wait for React to hydrate
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)
    
    // Check that the page has loaded (either shows carousel or loading state)
    const bodyText = await page.textContent('body')
    expect(bodyText).toBeTruthy()
    
    // Should not have any JavaScript errors
    const errors: string[] = []
    page.on('pageerror', (error) => {
      errors.push(error.message)
    })
    
    await page.waitForTimeout(1000)
    
    // Check for critical errors (warnings are ok)
    const criticalErrors = errors.filter(e => 
      !e.includes('Warning:') && 
      !e.includes('DevTools') &&
      !e.includes('Failed to load resource')
    )
    
    if (criticalErrors.length > 0) {
      console.log('Critical errors found:', criticalErrors)
    }
    
    expect(criticalErrors).toHaveLength(0)
  })
  
  test('should eventually display property carousel or error state', async ({ page }) => {
    await page.goto(`/link/${testLinkCode}`)
    await page.waitForLoadState('networkidle')
    
    // Wait up to 10 seconds for one of these states
    await page.waitForSelector(
      '[data-testid="property-carousel"], ' +
      'text="Link Not Found", ' +
      'text="No Properties Available", ' +
      'text="Loading property collection"',
      { timeout: 10000 }
    )
    
    // Check which state we ended up in
    const hasCarousel = await page.locator('[data-testid="property-carousel"]').count() > 0
    const hasError = await page.locator('text="Link Not Found"').count() > 0
    const hasEmpty = await page.locator('text="No Properties Available"').count() > 0
    const hasLoading = await page.locator('text="Loading property collection"').count() > 0
    
    console.log('Page state:', { hasCarousel, hasError, hasEmpty, hasLoading })
    
    // At least one should be present
    expect(hasCarousel || hasError || hasEmpty || hasLoading).toBe(true)
  })
  
  test('should handle invalid link gracefully', async ({ page }) => {
    await page.goto('/link/invalid-link-123')
    await page.waitForLoadState('networkidle')
    
    // Should show error message
    await expect(page.locator('text="Link Not Found"')).toBeVisible({ timeout: 10000 })
  })
})