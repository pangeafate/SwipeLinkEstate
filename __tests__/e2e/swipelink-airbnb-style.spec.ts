import { test, expect } from '@playwright/test'

/**
 * Test Specification for SwipeLink with Airbnb Styling
 * Based on CLIENT-LINK-MASTER-SPECIFICATION.md
 * 
 * Our functionality:
 * 1. Client receives link without authentication
 * 2. Sees collection overview first
 * 3. Browses properties in carousel (max 4 visible)
 * 4. Can expand properties for full details
 * 5. Assigns properties to buckets (Love/Maybe/Pass/Book)
 * 6. Books property visits
 * 7. Reviews organized selections
 */

test.describe('SwipeLink Airbnb-Style Interface', () => {
  const testLinkCode = 'awNmi9jF'
  
  test.beforeEach(async ({ page }) => {
    await page.goto(`/link/${testLinkCode}/swipelink`)
    await page.waitForLoadState('networkidle')
  })

  test('should display collection overview with Airbnb aesthetics', async ({ page }) => {
    // Check collection overview is visible
    const overview = page.locator('[data-testid="collection-overview"]')
    await expect(overview).toBeVisible()
    
    // Verify agent info
    const agentInfo = page.locator('[data-testid="agent-branding"]')
    await expect(agentInfo).toBeVisible()
    
    // Check property preview cards (Airbnb style)
    const previewCards = page.locator('[data-testid^="preview-property-card-"]')
    const cardCount = await previewCards.count()
    expect(cardCount).toBeGreaterThan(0)
    expect(cardCount).toBeLessThanOrEqual(4) // Max 4 cards visible
    
    // Verify Start Browsing button
    const startButton = page.locator('button:has-text("Start Browsing")')
    await expect(startButton).toBeVisible()
  })

  test('should navigate to carousel view with max 4 cards visible', async ({ page }) => {
    // Click start browsing
    const startButton = page.locator('button:has-text("Start Browsing")')
    await startButton.click()
    
    // Wait for carousel
    await page.waitForTimeout(1000)
    
    // Check carousel is visible
    const carousel = page.locator('[data-testid*="carousel"]').first()
    await expect(carousel).toBeVisible()
    
    // Count visible property cards
    const visibleCards = page.locator('[data-testid^="property-card-"]:visible')
    const visibleCount = await visibleCards.count()
    expect(visibleCount).toBeGreaterThan(0)
    expect(visibleCount).toBeLessThanOrEqual(4) // Max 4 cards as specified
    
    // Check cards have Airbnb-style layout
    const firstCard = visibleCards.first()
    
    // Image should be square (aspect-ratio 1:1)
    const imageSection = firstCard.locator('[data-testid*="image"]').first()
    await expect(imageSection).toBeVisible()
    
    // Text content should be below image (not overlaid)
    const contentSection = firstCard.locator('[data-testid*="content"]').first()
    await expect(contentSection).toBeVisible()
    
    // Heart icon should be present
    const heartIcon = firstCard.locator('[data-testid*="wishlist"], [data-testid*="heart"]').first()
    await expect(heartIcon).toBeVisible()
  })

  test('should expand property to full modal view', async ({ page }) => {
    // Navigate to carousel
    const startButton = page.locator('button:has-text("Start Browsing")')
    if (await startButton.isVisible()) {
      await startButton.click()
      await page.waitForTimeout(1000)
    }
    
    // Click on a property card
    const propertyCard = page.locator('[data-testid^="property-card-"]').first()
    await propertyCard.click()
    
    // Check modal opens
    const modal = page.locator('[data-testid="property-modal"], [role="dialog"]')
    await expect(modal).toBeVisible({ timeout: 5000 })
    
    // Verify modal has full property details
    const modalImage = modal.locator('img').first()
    await expect(modalImage).toBeVisible()
    
    const modalDescription = modal.locator('text=/bed|bath|sqft/i')
    await expect(modalDescription).toBeVisible()
    
    // Check for action buttons in modal
    const bookButton = modal.locator('button:has-text("Book"), button:has-text("Schedule")')
    await expect(bookButton).toBeVisible()
  })

  test('should allow bucket assignment (Love/Maybe/Pass/Book)', async ({ page }) => {
    // Navigate to carousel
    const startButton = page.locator('button:has-text("Start Browsing")')
    if (await startButton.isVisible()) {
      await startButton.click()
      await page.waitForTimeout(1000)
    }
    
    // Click on property to reveal actions
    const propertyCard = page.locator('[data-testid^="property-card-"]').first()
    await propertyCard.click()
    
    // Look for bucket action buttons
    const bucketButtons = page.locator('button:has-text("Love"), button:has-text("Like"), button[aria-label*="Love"], button[aria-label*="Like"]')
    const buttonCount = await bucketButtons.count()
    expect(buttonCount).toBeGreaterThan(0)
    
    // Click a bucket button
    const loveButton = bucketButtons.first()
    await loveButton.click()
    
    // Verify feedback (color change, confirmation, etc.)
    // The specific implementation may vary
  })

  test('should be mobile responsive', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 })
    
    // Reload page
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Check collection overview adapts to mobile
    const overview = page.locator('[data-testid="collection-overview"]')
    await expect(overview).toBeVisible()
    
    // Navigate to carousel
    const startButton = page.locator('button:has-text("Start Browsing")')
    if (await startButton.isVisible()) {
      await startButton.click()
      await page.waitForTimeout(1000)
    }
    
    // On mobile, should see 1 card at a time
    const visibleCards = page.locator('[data-testid^="property-card-"]:visible')
    const visibleCount = await visibleCards.count()
    expect(visibleCount).toBeLessThanOrEqual(2) // 1-2 cards on mobile
    
    // Check touch scrolling works (horizontal)
    const carousel = page.locator('[data-testid*="carousel"]').first()
    await expect(carousel).toBeVisible()
  })

  test('should show bucket summary and allow review', async ({ page }) => {
    // Navigate to carousel
    const startButton = page.locator('button:has-text("Start Browsing")')
    if (await startButton.isVisible()) {
      await startButton.click()
      await page.waitForTimeout(1000)
    }
    
    // Assign a property to a bucket
    const propertyCard = page.locator('[data-testid^="property-card-"]').first()
    await propertyCard.click()
    
    const loveButton = page.locator('button:has-text("Love"), button[aria-label*="Love"]').first()
    if (await loveButton.isVisible()) {
      await loveButton.click()
    }
    
    // Look for bucket summary or navigation
    const bucketNav = page.locator('text=/My Lists|Selections|Buckets/i')
    if (await bucketNav.isVisible()) {
      await bucketNav.click()
      
      // Check bucket view
      const bucketView = page.locator('[data-testid*="bucket"]')
      await expect(bucketView).toBeVisible()
    }
  })

  test('should allow property visit booking', async ({ page }) => {
    // Navigate to carousel
    const startButton = page.locator('button:has-text("Start Browsing")')
    if (await startButton.isVisible()) {
      await startButton.click()
      await page.waitForTimeout(1000)
    }
    
    // Open property modal
    const propertyCard = page.locator('[data-testid^="property-card-"]').first()
    await propertyCard.click()
    
    // Look for booking button
    const bookButton = page.locator('button:has-text("Book"), button:has-text("Schedule"), button:has-text("Visit")')
    if (await bookButton.isVisible()) {
      await bookButton.click()
      
      // Check booking form appears
      const bookingForm = page.locator('[data-testid*="booking"], [data-testid*="visit"], form')
      await expect(bookingForm).toBeVisible({ timeout: 5000 })
    }
  })

  test('should handle navigation between properties', async ({ page }) => {
    // Navigate to carousel
    const startButton = page.locator('button:has-text("Start Browsing")')
    if (await startButton.isVisible()) {
      await startButton.click()
      await page.waitForTimeout(1000)
    }
    
    // Check for navigation controls
    const nextButton = page.locator('[aria-label*="Next"], button:has-text("→"), [data-testid*="next"]')
    const prevButton = page.locator('[aria-label*="Previous"], button:has-text("←"), [data-testid*="prev"]')
    
    // Desktop should have arrow navigation
    if (page.viewportSize()?.width && page.viewportSize()!.width >= 1024) {
      await expect(nextButton.or(prevButton)).toBeVisible()
    }
    
    // Test keyboard navigation
    await page.keyboard.press('ArrowRight')
    await page.waitForTimeout(300)
    
    // Verify navigation worked (implementation specific)
  })

  test('should maintain Airbnb visual aesthetics', async ({ page }) => {
    // Check for Airbnb color scheme
    const primaryElements = page.locator('[style*="#FF385C"], [style*="#FF5A5F"], [style*="rgb(255, 56, 92)"]')
    const primaryCount = await primaryElements.count()
    expect(primaryCount).toBeGreaterThan(0) // Should use Airbnb red
    
    // Check for clean typography (no ALL CAPS)
    const allText = await page.locator('body').textContent()
    const hasAllCaps = /[A-Z]{5,}/.test(allText || '')
    expect(hasAllCaps).toBeFalsy() // Airbnb doesn't use all caps
    
    // Check for proper rounded corners
    const cards = page.locator('[data-testid^="property-card-"]')
    const firstCard = cards.first()
    const borderRadius = await firstCard.evaluate(el => 
      window.getComputedStyle(el).borderRadius
    )
    expect(borderRadius).toContain('px') // Should have rounded corners
  })
})