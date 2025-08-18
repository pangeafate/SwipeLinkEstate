import { test, expect } from '@playwright/test'

test.describe('Agent Dashboard', () => {
  test('should load agent dashboard successfully', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Check page loads with correct content
    await expect(page).toHaveTitle(/SwipeLink Estate/)
    await expect(page.getByText('Agent Dashboard')).toBeVisible()
    
    // Check main heading
    await expect(page.getByRole('heading', { name: /Properties/i })).toBeVisible()
    
    // Check navigation is present
    await expect(page.getByRole('link', { name: 'SwipeLink Estate' })).toBeVisible()
  })

  test('should display stats overview cards', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Check all stat cards are present
    await expect(page.getByText('Total Properties')).toBeVisible()
    await expect(page.getByText('Active Listings')).toBeVisible()
    await expect(page.getByText('Total Views')).toBeVisible()
    await expect(page.getByText('Active Links')).toBeVisible()
    
    // Check stat values are displayed (should be numbers)
    const statCards = page.locator('.text-2xl.font-bold.text-gray-900')
    expect(await statCards.count()).toBeGreaterThan(0)
  })

  test('should have working navigation between agent sections', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Check agent navigation links
    const propertiesLink = page.getByRole('link', { name: /Properties/i }).first()
    const linksLink = page.getByRole('link', { name: /Links/i })
    const analyticsLink = page.getByRole('link', { name: /Analytics/i })
    
    await expect(propertiesLink).toBeVisible()
    await expect(linksLink).toBeVisible()
    await expect(analyticsLink).toBeVisible()
    
    // Test navigation to links page
    await linksLink.click()
    await expect(page).toHaveURL('/links')
    await expect(page.getByText('Links Management')).toBeVisible()
    
    // Test navigation to analytics page
    await analyticsLink.click()
    await expect(page).toHaveURL('/analytics')
    await expect(page.getByText('Analytics Dashboard')).toBeVisible()
    
    // Navigate back to dashboard
    await propertiesLink.click()
    await expect(page).toHaveURL('/dashboard')
  })

  test('should display properties or appropriate empty state', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Wait for properties to load
    await page.waitForTimeout(3000)
    
    // Check for either properties grid or empty state
    const propertyCards = page.locator('[data-testid="property-card"]')
    const emptyState = page.getByText('No properties found')
    const loadingState = page.getByText('Loading properties')
    
    const hasProperties = await propertyCards.count() > 0
    const hasEmptyState = await emptyState.count() > 0
    const hasLoadingState = await loadingState.count() > 0
    
    // Should have one of these states
    expect(hasProperties || hasEmptyState || hasLoadingState).toBe(true)
    
    if (hasProperties) {
      // Check property card interactions
      const firstCard = propertyCards.first()
      await expect(firstCard).toBeVisible()
      
      // Cards should be selectable (for link creation)
      await firstCard.click()
      
      // Should show selection state or enable Create Link button
      await page.waitForTimeout(500)
      
      // Check if Create Link button becomes available
      const createLinkButton = page.getByRole('button', { name: /Create Link/i })
      if (await createLinkButton.count() > 0) {
        await expect(createLinkButton).toBeVisible()
      }
    }
  })

  test('should have Add Property button', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Check Add Property button exists
    const addPropertyButton = page.getByRole('button', { name: /Add Property/i })
    await expect(addPropertyButton).toBeVisible()
    await expect(addPropertyButton).toBeEnabled()
    
    // Button should be clickable (even if functionality isn't implemented yet)
    await addPropertyButton.click()
    
    // Should not crash when clicked
    await expect(page.getByText('Agent Dashboard')).toBeVisible()
  })

  test('should handle property selection for link creation', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Wait for any properties to load
    await page.waitForTimeout(2000)
    
    const propertyCards = page.locator('[data-testid="property-card"]')
    const cardCount = await propertyCards.count()
    
    if (cardCount > 0) {
      // Select first property
      await propertyCards.first().click()
      
      // Should show selection count
      await page.waitForTimeout(500)
      const selectionText = page.getByText(/selected/)
      
      if (await selectionText.count() > 0) {
        await expect(selectionText).toBeVisible()
        
        // Create Link button should appear
        const createLinkButton = page.getByRole('button', { name: /Create Link/i })
        await expect(createLinkButton).toBeVisible()
        
        // Should be able to select multiple properties
        if (cardCount > 1) {
          await propertyCards.nth(1).click()
          await page.waitForTimeout(500)
          
          // Selection count should update
          const multiSelectionText = page.getByText(/2 selected|selected/)
          if (await multiSelectionText.count() > 0) {
            await expect(multiSelectionText).toBeVisible()
          }
        }
      }
    }
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/dashboard')
    
    // Check mobile layout
    await expect(page.getByText('Agent Dashboard')).toBeVisible()
    
    // Navigation should be accessible
    await expect(page.getByRole('link', { name: 'SwipeLink Estate' })).toBeVisible()
    
    // Stats cards should stack properly on mobile
    await expect(page.getByText('Total Properties')).toBeVisible()
    await expect(page.getByText('Active Listings')).toBeVisible()
    
    // Properties grid should be responsive
    const propertyCards = page.locator('[data-testid="property-card"]')
    if (await propertyCards.count() > 0) {
      await expect(propertyCards.first()).toBeVisible()
    }
  })
})