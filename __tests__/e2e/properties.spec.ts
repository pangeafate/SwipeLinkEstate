import { test, expect } from '@playwright/test'

test.describe('Properties Page', () => {
  test('should load properties page successfully', async ({ page }) => {
    await page.goto('/properties')
    
    // Check page loads with correct content
    await expect(page).toHaveTitle(/SwipeLink Estate/)
    await expect(page.getByRole('heading', { name: /Discover Your Dream Property/i })).toBeVisible()
    
    // Check filter section is present
    await expect(page.getByText('All Types')).toBeVisible()
    await expect(page.getByText('Any Price')).toBeVisible()
    await expect(page.getByText('Any Beds')).toBeVisible()
    
    // Check Apply Filters button
    await expect(page.getByRole('button', { name: /Apply Filters/i })).toBeVisible()
  })

  test('should display properties grid or loading state', async ({ page }) => {
    await page.goto('/properties')
    
    // Wait for either loading state or properties to appear
    await page.waitForSelector('[data-testid="property-card"], .text-gray-500:has-text("Loading")', { timeout: 10000 })
    
    // Check if we have properties or appropriate message
    const loadingText = page.locator('.text-gray-500:has-text("Loading")')
    const noPropertiesText = page.locator('.text-gray-500:has-text("No properties")')
    const propertyCards = page.locator('[data-testid="property-card"]')
    
    // Should have one of these states
    const hasLoading = await loadingText.count() > 0
    const hasNoProperties = await noPropertiesText.count() > 0  
    const hasProperties = await propertyCards.count() > 0
    
    expect(hasLoading || hasNoProperties || hasProperties).toBe(true)
    
    if (hasProperties) {
      // If properties are loaded, check first property card structure
      const firstCard = propertyCards.first()
      await expect(firstCard).toBeVisible()
      
      // Properties should be clickable
      await expect(firstCard).toBeEnabled()
    }
  })

  test('should have working filter functionality', async ({ page }) => {
    await page.goto('/properties')
    
    // Test filter dropdowns are interactive
    const propertyTypeFilter = page.locator('select').first()
    const priceFilter = page.locator('select').nth(1)
    const bedsFilter = page.locator('select').nth(2)
    
    await expect(propertyTypeFilter).toBeVisible()
    await expect(priceFilter).toBeVisible() 
    await expect(bedsFilter).toBeVisible()
    
    // Test changing filter values
    await propertyTypeFilter.selectOption('Apartment')
    await priceFilter.selectOption('Under $500k')
    await bedsFilter.selectOption('2+ beds')
    
    // Apply filters button should be clickable
    const applyButton = page.getByRole('button', { name: /Apply Filters/i })
    await applyButton.click()
    
    // Should not crash after applying filters
    await expect(page.getByRole('heading', { name: /Discover Your Dream Property/i })).toBeVisible()
  })

  test('should handle property card interactions', async ({ page }) => {
    await page.goto('/properties')
    
    // Wait for properties to load
    await page.waitForTimeout(2000)
    
    const propertyCards = page.locator('[data-testid="property-card"]')
    const cardCount = await propertyCards.count()
    
    if (cardCount > 0) {
      // Click on first property card
      await propertyCards.first().click()
      
      // Should open modal or show property details
      await page.waitForTimeout(1000)
      
      // Check if modal opened (property detail view)
      const modal = page.locator('.fixed.inset-0')
      if (await modal.count() > 0) {
        await expect(modal).toBeVisible()
        
        // Check if close button exists and works
        const closeButton = page.locator('button:has-text("✕")')
        if (await closeButton.count() > 0) {
          await closeButton.click()
          await expect(modal).not.toBeVisible()
        }
      }
    }
  })

  test('should have working navigation back to homepage', async ({ page }) => {
    await page.goto('/properties')
    
    // Click home link
    await page.getByRole('link', { name: /Home/i }).click()
    await expect(page).toHaveURL('/')
    
    // Should be back on homepage
    await expect(page.getByRole('heading', { name: /Create Shareable Property Links/i })).toBeVisible()
  })
})