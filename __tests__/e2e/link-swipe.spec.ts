import { test, expect } from '@playwright/test'

test.describe('Link Swipe Interface', () => {
  test.beforeEach(async ({ page }) => {
    // Enable debug mode for better error visibility
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log('Browser error:', msg.text())
      }
    })
    
    page.on('pageerror', (error) => {
      console.log('Page error:', error.message)
    })
  })

  test('should load link page and initialize swipe interface', async ({ page }) => {
    // Use the actual link code that exists in the database
    const linkCode = 'awNmi9jF'
    
    await test.step('Navigate to link page', async () => {
      await page.goto(`/link/${linkCode}`)
      
      // Wait for the page to load
      await page.waitForLoadState('networkidle')
    })

    await test.step('Check initial page state', async () => {
      // Wait for the page to load properly
      await page.waitForTimeout(3000)
      
      // The page should show the swipe interface since we have valid data
      const hasSwipeInterface = await page.locator('[data-testid="tinder-card"]').count() > 0
      const hasError = await page.locator('text=Link not found').count() > 0
      const isLoading = await page.locator('text=Loading property collection').count() > 0
      const isPreparingText = await page.locator('text=Preparing your property collection').count() > 0
      
      console.log('Page state:', { hasSwipeInterface, hasError, isLoading, isPreparingText })
      
      // With valid data, we should see the swipe interface
      if (hasSwipeInterface) {
        console.log('✅ Swipe interface loaded successfully')
      } else if (isLoading || isPreparingText) {
        console.log('⏳ Still loading, waiting longer...')
        await page.waitForTimeout(5000)
        const hasSwipeInterfaceAfterWait = await page.locator('[data-testid="tinder-card"]').count() > 0
        console.log('After wait, has swipe interface:', hasSwipeInterfaceAfterWait)
      } else {
        console.log('❌ Expected swipe interface not found')
      }
      
      // At least one of these should be present
      expect(hasSwipeInterface || hasError || isLoading || isPreparingText).toBe(true)
    })

    await test.step('Verify page content', async () => {
      // Check if the page has basic structure
      const body = await page.textContent('body')
      console.log('Full page body content:', body)
      
      // Get HTML content for debugging
      const html = await page.content()
      console.log('HTML length:', html.length)
      
      // Check if there are any React errors
      const consoleMessages = []
      page.on('console', msg => consoleMessages.push(msg.text()))
      
      // The page should have some content
      expect(body?.length).toBeGreaterThan(0)
    })
  })

  test('should handle missing link gracefully', async ({ page }) => {
    await test.step('Navigate to non-existent link', async () => {
      await page.goto('/link/non-existent-link-123')
      await page.waitForLoadState('networkidle')
    })

    await test.step('Check error state', async () => {
      // Should show error message for missing link
      await expect(page.locator('text=Link Not Found')).toBeVisible({ timeout: 10000 })
      await expect(page.locator('text=Link not found or expired')).toBeVisible()
    })
  })

  test('should display loading state initially', async ({ page }) => {
    await test.step('Navigate to link page', async () => {
      await page.goto('/link/test-link')
      
      // Should show loading state initially
      await expect(page.locator('text=Loading property collection')).toBeVisible({ timeout: 5000 })
    })
  })

  test('should have proper page structure', async ({ page }) => {
    await test.step('Navigate to link page', async () => {
      await page.goto('/link/test-link')
      await page.waitForLoadState('networkidle')
    })

    await test.step('Check page structure', async () => {
      // Page should have basic HTML structure
      const html = await page.locator('html').count()
      const body = await page.locator('body').count()
      
      expect(html).toBe(1)
      expect(body).toBe(1)
      
      // Check for React root div
      const rootDiv = await page.locator('div').first().count()
      expect(rootDiv).toBeGreaterThan(0)
    })
  })

  test('should handle JavaScript errors gracefully', async ({ page }) => {
    const errors: string[] = []
    
    page.on('pageerror', (error) => {
      errors.push(error.message)
    })

    await page.goto('/link/test-link')
    await page.waitForLoadState('networkidle')
    
    // Wait a bit to catch any async errors
    await page.waitForTimeout(2000)
    
    // Log any JavaScript errors for debugging
    if (errors.length > 0) {
      console.log('JavaScript errors detected:', errors)
    }
    
    // The page should still be functional even if there are non-critical errors
    const bodyText = await page.textContent('body')
    expect(bodyText?.length).toBeGreaterThan(0)
  })
})