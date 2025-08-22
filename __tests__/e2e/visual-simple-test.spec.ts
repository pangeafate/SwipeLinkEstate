import { test, expect } from '@playwright/test'

test.describe('Simple Visual Verification', () => {
  test('should display and interact with client view', async ({ page }) => {
    // Navigate to the test link
    await page.goto('/link/awNmi9jF')
    await page.waitForLoadState('networkidle')
    
    // Collection overview should be visible first
    const collectionOverview = page.locator('[data-testid="collection-overview"]')
    await expect(collectionOverview).toBeVisible()
    
    // Click the start browsing button
    const startButton = page.getByRole('button', { name: /start browsing|begin browsing|view properties/i })
    
    if (await startButton.isVisible()) {
      console.log('Clicking start browsing button...')
      await startButton.click()
      await page.waitForTimeout(2000) // Allow transition
      
      // Now check for carousel
      const carousel = page.locator('[data-testid*="carousel"]').first()
      const isCarouselVisible = await carousel.isVisible()
      
      if (isCarouselVisible) {
        console.log('✅ Carousel is visible after clicking start')
        
        // Check for property cards
        const propertyCard = page.locator('[data-testid^="property-card-"]').first()
        const isCardVisible = await propertyCard.isVisible()
        console.log(`Property card visible: ${isCardVisible}`)
        
        // Check visual elements
        const imageSection = page.locator('[data-testid^="card-image-section-"]').first()
        const contentSection = page.locator('[data-testid^="card-content-section-"]').first()
        
        if (await imageSection.isVisible()) {
          console.log('✅ Image section found')
          const imageClasses = await imageSection.getAttribute('class')
          console.log(`Image section classes: ${imageClasses}`)
        }
        
        if (await contentSection.isVisible()) {
          console.log('✅ Content section found')
          const contentClasses = await contentSection.getAttribute('class')
          console.log(`Content section classes: ${contentClasses}`)
        }
        
        // Check for Airbnb styling
        const priceBadge = page.locator('[data-testid^="price-badge-"]').first()
        if (await priceBadge.isVisible()) {
          console.log('✅ Price badge visible')
          const priceStyle = await priceBadge.getAttribute('style')
          console.log(`Price badge style: ${priceStyle}`)
        }
        
        // Check for dot indicators
        const dots = page.locator('[data-testid="airbnb-dot-indicators"]')
        if (await dots.isVisible()) {
          console.log('✅ Dot indicators visible')
        }
      } else {
        console.log('❌ Carousel not visible after clicking start')
        
        // Check what is visible instead
        const visibleElements = await page.locator('[data-testid]').all()
        console.log('Visible elements with data-testid:')
        for (const element of visibleElements.slice(0, 10)) {
          const testId = await element.getAttribute('data-testid')
          console.log(`  - ${testId}`)
        }
      }
    } else {
      console.log('Start browsing button not found, checking for direct carousel...')
      
      // Maybe carousel is already visible
      const carousel = page.locator('[data-testid*="carousel"]').first()
      if (await carousel.isVisible()) {
        console.log('✅ Carousel already visible')
      } else {
        // List what's visible
        const visibleElements = await page.locator('[data-testid]').all()
        console.log('Visible elements:')
        for (const element of visibleElements.slice(0, 10)) {
          const testId = await element.getAttribute('data-testid')
          console.log(`  - ${testId}`)
        }
      }
    }
    
    // Take a screenshot for visual inspection
    await page.screenshot({ path: 'test-screenshot.png', fullPage: true })
    console.log('Screenshot saved as test-screenshot.png')
  })
})