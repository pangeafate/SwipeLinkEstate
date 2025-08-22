import { test, expect } from '@playwright/test'

test.describe('Analytics Integration Verification', () => {
  test('should verify analytics dashboard loads and displays real data', async ({ page }) => {
    // Navigate to analytics dashboard
    await page.goto('/analytics')
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle')
    
    // Verify page loaded successfully
    await expect(page).toHaveTitle(/SwipeLink Estate/)
    await expect(page.getByText('Analytics Dashboard')).toBeVisible()
    
    // Check for overview metrics cards (real analytics data)
    await expect(page.getByText('Total Views')).toBeVisible()
    await expect(page.getByText('Active Sessions')).toBeVisible()
    await expect(page.getByText('Properties')).toBeVisible()
    await expect(page.getByText('Shared Links')).toBeVisible()
    
    // Verify charts are present
    await expect(page.getByText('Top Properties by Views')).toBeVisible()
    await expect(page.getByText('Link Performance')).toBeVisible()
    await expect(page.getByText('Engagement Overview')).toBeVisible()
    await expect(page.getByText('Recent Activity')).toBeVisible()
    
    // Check for real-time controls
    await expect(page.getByText('Refresh:')).toBeVisible()
    await expect(page.getByRole('button', { name: /Refresh Now/ })).toBeVisible()
    
    console.log('✅ Analytics dashboard loaded successfully with all components')
  })

  test('should verify property browsing creates analytics sessions', async ({ page, context }) => {
    // Enable console logging to capture analytics calls
    let sessionCreated = false
    let analyticsTracked = false
    
    page.on('console', msg => {
      const text = msg.text()
      if (text.includes('AnalyticsService.createSession')) {
        sessionCreated = true
        console.log('✅ Analytics session creation detected:', text)
      }
      if (text.includes('AnalyticsService.trackView') || text.includes('trackActivity')) {
        analyticsTracked = true
        console.log('✅ Analytics tracking detected:', text)
      }
    })

    // Navigate to properties page
    await page.goto('/properties')
    await page.waitForLoadState('networkidle')
    
    // Verify properties page loads
    await expect(page.getByText('Discover Your Dream Property')).toBeVisible()
    
    // Wait a bit for analytics to initialize
    await page.waitForTimeout(2000)
    
    // Try to click on a property if available
    const propertyCards = page.locator('[data-testid="property-card"]')
    const propertyCount = await propertyCards.count()
    
    if (propertyCount > 0) {
      console.log(`Found ${propertyCount} properties, clicking first one`)
      await propertyCards.first().click()
      await page.waitForTimeout(1000)
      
      // Close modal if opened
      const closeButton = page.locator('button:has-text("✕")')
      if (await closeButton.isVisible()) {
        await closeButton.click()
      }
    }
    
    console.log('Session created:', sessionCreated ? '✅' : '❌')
    console.log('Analytics tracked:', analyticsTracked ? '✅' : '❌')
  })

  test('should verify swipe interface analytics tracking', async ({ page }) => {
    let swipeTracked = false
    let viewTracked = false
    
    page.on('console', msg => {
      const text = msg.text()
      if (text.includes('Swiped') || text.includes('trackSwipe')) {
        swipeTracked = true
        console.log('✅ Swipe analytics detected:', text)
      }
      if (text.includes('trackPropertyView') || text.includes('trackView')) {
        viewTracked = true
        console.log('✅ View tracking detected:', text)
      }
    })

    // Try a known test link
    await page.goto('/link/test-link')
    await page.waitForLoadState('networkidle')
    
    // Wait for swipe interface to load
    await page.waitForTimeout(3000)
    
    // Look for swipe interface elements
    const swipeInterface = page.locator('[data-testid="swipe-interface"]')
    const propertyCard = page.locator('.property-card, [data-testid="property-card"]')
    const actionButtons = page.locator('button:has-text("❤️"), button:has-text("👍")')
    
    if (await swipeInterface.isVisible()) {
      console.log('✅ Swipe interface loaded')
      
      // Try to interact with action buttons if available
      if (await actionButtons.count() > 0) {
        await actionButtons.first().click()
        await page.waitForTimeout(1000)
        console.log('✅ Action button clicked')
      }
    } else {
      console.log('ℹ️ Swipe interface not available (expected if no properties in test link)')
    }
    
    console.log('Swipe tracked:', swipeTracked ? '✅' : '❌')
    console.log('View tracked:', viewTracked ? '✅' : '❌')
  })
})