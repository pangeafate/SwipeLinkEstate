import { test, expect } from '@playwright/test'

test.describe('Airbnb Visual Design Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the test link with properties
    await page.goto('/link/awNmi9jF')
    await page.waitForLoadState('networkidle')
  })

  test('should display Airbnb-style property cards with 70-30 ratio', async ({ page }) => {
    // Wait for carousel to be visible
    const carousel = page.locator('[data-testid="airbnb-carousel-container"]')
    await expect(carousel).toBeVisible({ timeout: 10000 })

    // Check property card dimensions
    const propertyCard = page.locator('[data-testid^="property-card-"]').first()
    await expect(propertyCard).toBeVisible()
    
    // Verify card has correct classes
    const cardClasses = await propertyCard.getAttribute('class')
    expect(cardClasses).toContain('property-card-airbnb')
    
    // Check image section (should be 70% height)
    const imageSection = page.locator('[data-testid^="card-image-section-"]').first()
    await expect(imageSection).toBeVisible()
    const imageSectionClasses = await imageSection.getAttribute('class')
    expect(imageSectionClasses).toContain('h-[70%]')
    
    // Check content section (should be 30% height)
    const contentSection = page.locator('[data-testid^="card-content-section-"]').first()
    await expect(contentSection).toBeVisible()
    const contentSectionClasses = await contentSection.getAttribute('class')
    expect(contentSectionClasses).toContain('h-[30%]')
  })

  test('should use Airbnb coral color palette', async ({ page }) => {
    // Check for coral-colored elements
    const wishlistHeart = page.locator('[data-testid^="wishlist-heart-"]').first()
    await expect(wishlistHeart).toBeVisible()
    
    // Check dot indicators exist
    const dotIndicators = page.locator('[data-testid="airbnb-dot-indicators"]')
    await expect(dotIndicators).toBeVisible()
    
    // Verify dot indicator styling
    const activeDot = page.locator('[data-testid^="dot-indicator-"].active').first()
    const dotClasses = await activeDot.getAttribute('class')
    expect(dotClasses).toContain('active')
  })

  test('should have proper typography hierarchy', async ({ page }) => {
    // Check price badge
    const priceBadge = page.locator('[data-testid^="price-badge-"]').first()
    await expect(priceBadge).toBeVisible()
    const priceText = await priceBadge.textContent()
    expect(priceText).toMatch(/\$[\d,]+/)
    
    // Check property title
    const propertyTitle = page.locator('[data-testid^="property-title-"]').first()
    await expect(propertyTitle).toBeVisible()
    
    // Check property details
    const propertyDetails = page.locator('[data-testid^="property-details-"]').first()
    await expect(propertyDetails).toBeVisible()
    const detailsText = await propertyDetails.textContent()
    expect(detailsText).toMatch(/\d+ bed/)
  })

  test('should have horizontal carousel navigation (not Tinder stack)', async ({ page }) => {
    // Check horizontal scroll container
    const scrollContainer = page.locator('[data-testid="horizontal-scroll-container"]')
    await expect(scrollContainer).toBeVisible()
    const containerClasses = await scrollContainer.getAttribute('class')
    expect(containerClasses).toContain('carousel-inner')
    expect(containerClasses).toContain('flex')
    
    // Verify NO Tinder-style elements
    const tinderStack = page.locator('.card-stack')
    await expect(tinderStack).not.toBeVisible()
    
    // Check for dot indicators (Airbnb style)
    const dots = page.locator('[data-testid^="dot-indicator-"]')
    const dotCount = await dots.count()
    expect(dotCount).toBeGreaterThan(0)
  })

  test('should have tap-to-reveal action overlay (not always visible buttons)', async ({ page }) => {
    // Initially, action overlay should not be visible
    const actionOverlay = page.locator('[data-testid^="action-overlay-"]')
    await expect(actionOverlay).not.toBeVisible()
    
    // Click on a property card
    const propertyCard = page.locator('[data-testid^="property-card-"]').first()
    await propertyCard.click()
    
    // Action overlay should appear
    await expect(actionOverlay).toBeVisible({ timeout: 5000 })
    
    // Check for bucket buttons in overlay
    const bucketButtons = page.locator('[data-testid^="bucket-btn-"]')
    const buttonCount = await bucketButtons.count()
    expect(buttonCount).toBeGreaterThan(0)
  })

  test('should display desktop arrow navigation on larger viewports', async ({ page, viewport }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Check for arrow navigation
    const leftArrow = page.locator('[data-testid="airbnb-left-arrow"]')
    const rightArrow = page.locator('[data-testid="airbnb-right-arrow"]')
    
    // On desktop, arrows should be visible
    if (viewport?.width && viewport.width >= 1024) {
      await expect(leftArrow).toBeVisible()
      await expect(rightArrow).toBeVisible()
    }
  })

  test('should have proper mobile responsiveness', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 })
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Check that carousel is still visible
    const carousel = page.locator('[data-testid="airbnb-carousel-container"]')
    await expect(carousel).toBeVisible()
    
    // Check that only one card is visible at a time on mobile
    const visibleCards = page.locator('[data-visible="property-card-visible"]')
    const visibleCount = await visibleCards.count()
    expect(visibleCount).toBeLessThanOrEqual(1)
    
    // Desktop arrows should not be visible on mobile
    const leftArrow = page.locator('[data-testid="airbnb-left-arrow"]')
    await expect(leftArrow).not.toBeVisible()
  })
})