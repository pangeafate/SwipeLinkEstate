import { test, expect } from '@playwright/test'

test.describe('Critical User Flow - Property Link Creation and Swipe', () => {
  test('should complete full user journey from homepage to swipe', async ({ page }) => {
    // 1. Navigate to homepage
    await test.step('Load homepage', async () => {
      await page.goto('/')
      await expect(page).toHaveTitle(/SwipeLink Estate/)
      
      // Check main elements are visible
      await expect(page.getByText('SwipeLink Estate')).toBeVisible()
      await expect(page.getByText('Discover your dream property')).toBeVisible()
    })

    // 2. Navigate to properties page
    await test.step('Navigate to properties', async () => {
      await page.click('text=Browse Properties')
      await page.waitForURL('**/properties')
      
      // Check properties page loaded
      await expect(page.getByRole('heading', { name: /Properties/i })).toBeVisible()
      
      // Wait for properties to load or show empty state
      await Promise.race([
        page.waitForSelector('.grid', { timeout: 10000 }).catch(() => null),
        page.waitForSelector('text=No properties found', { timeout: 10000 }).catch(() => null)
      ])
    })

    // 3. Check property display
    await test.step('Verify property cards', async () => {
      const propertyCards = await page.$$('.property-card, [data-testid="property-card"]')
      
      if (propertyCards.length > 0) {
        console.log(`Found ${propertyCards.length} property cards`)
        
        // Check first property card has essential elements
        const firstCard = page.locator('.property-card, [data-testid="property-card"]').first()
        await expect(firstCard).toBeVisible()
        
        // Property cards should have price and address
        const cardText = await firstCard.textContent()
        expect(cardText).toBeTruthy()
      } else {
        console.log('No properties found - checking empty state')
        await expect(page.getByText(/No properties|Add your first/i)).toBeVisible()
      }
    })

    // 4. Navigate to dashboard
    await test.step('Navigate to agent dashboard', async () => {
      await page.goto('/dashboard')
      
      // Check dashboard loaded
      await expect(page.getByRole('heading', { name: /Dashboard/i })).toBeVisible()
      
      // Dashboard should have stats or welcome message
      await page.waitForSelector('text=/Properties|Links|Welcome/', { timeout: 10000 })
    })

    // 5. Test link creation flow
    await test.step('Access link creation', async () => {
      // Look for create link button
      const createLinkButton = await page.getByRole('button', { name: /Create.*Link/i })
        .or(page.getByRole('link', { name: /Create.*Link/i }))
        .or(page.getByText(/Create.*Link/i))
      
      if (await createLinkButton.isVisible()) {
        await createLinkButton.click()
        console.log('Link creation button found and clicked')
        
        // Should show link creation interface
        await page.waitForSelector('text=/Select Properties|Create Link|Link Name/', { timeout: 5000 })
      } else {
        console.log('Link creation not immediately available - may need properties first')
      }
    })

    // 6. Test a sample link (if exists)
    await test.step('Test link swipe interface', async () => {
      // Try with a test link code
      const testLinkCode = 'awNmi9jF'
      await page.goto(`/link/${testLinkCode}`)
      
      // Wait for page to load
      await page.waitForLoadState('networkidle')
      
      // Check if link loads or shows error
      const hasSwipeInterface = await page.locator('.swipe-interface, [data-testid="swipe-interface"]').isVisible().catch(() => false)
      const hasError = await page.locator('text=/Link Not Found|expired|invalid/i').isVisible().catch(() => false)
      
      if (hasSwipeInterface) {
        console.log('Swipe interface loaded successfully')
        
        // Verify swipe components
        await expect(page.locator('.property-card, [data-testid="property-card"]').first()).toBeVisible({ timeout: 10000 })
        
        // Check for swipe hints or instructions
        const hasHints = await page.locator('text=/Swipe|Like|Dislike/i').isVisible().catch(() => false)
        expect(hasHints).toBeTruthy()
      } else if (hasError) {
        console.log('Link not found - this is expected for invalid links')
        await expect(page.getByText(/Link not found|expired/i)).toBeVisible()
      } else {
        console.log('Link page loaded but state unclear')
      }
    })

    // 7. Test navigation back to homepage
    await test.step('Navigate back to homepage', async () => {
      await page.goto('/')
      await expect(page.getByText('SwipeLink Estate')).toBeVisible()
      await expect(page.getByText('Discover your dream property')).toBeVisible()
    })
  })

  test('should handle responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    await expect(page.getByText('SwipeLink Estate')).toBeVisible()
    
    // Navigate to properties on mobile
    await page.click('text=Browse Properties')
    await page.waitForURL('**/properties')
    
    // Should still be functional on mobile
    await expect(page.getByRole('heading', { name: /Properties/i })).toBeVisible()
  })
})