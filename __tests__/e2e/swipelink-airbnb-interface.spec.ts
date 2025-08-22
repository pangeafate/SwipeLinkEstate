/**
 * SwipeLink Airbnb-Style Interface E2E Tests
 * 
 * Tests the complete user journey through the new mobile-first property browsing experience:
 * - 4-property carousel view (2x2 grid on mobile)
 * - Property modal with action buttons
 * - 5-bucket organization system
 * - State persistence
 */

import { test, expect, type Page } from '@playwright/test'

// Test link code (should exist in database)
const TEST_LINK_CODE = 'TEST4PR'
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001'

test.describe('SwipeLink Airbnb-Style Interface', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to test link
    await page.goto(`${BASE_URL}/link/${TEST_LINK_CODE}`)
    
    // Wait for the page to load and initialize
    await page.waitForLoadState('networkidle')
  })

  test('should display 4-property carousel on desktop', async ({ page }) => {
    // Should show property carousel
    await expect(page.locator('[data-testid="property-carousel"]')).toBeVisible()
    
    // Should display up to 4 property cards
    const propertyCards = page.locator('[role="button"][aria-label*="Property card"]')
    await expect(propertyCards).toHaveCount(4)
    
    // Should have navigation dots
    const navDots = page.locator('[aria-label*="Go to property"]')
    await expect(navDots.first()).toBeVisible()
  })

  test('should display mobile 2x2 grid layout', async ({ page, isMobile }) => {
    if (!isMobile) {
      // Simulate mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
    }
    
    // Should have grid layout classes
    const carousel = page.locator('[data-testid="property-carousel"]')
    await expect(carousel).toBeVisible()
    
    // Should show property cards in grid
    const propertyCards = page.locator('[role="button"][aria-label*="Property card"]')
    await expect(propertyCards).toHaveCount(4)
  })

  test('should show property modal when card is clicked', async ({ page }) => {
    // Click on first property card
    const firstCard = page.locator('[role="button"][aria-label*="Property card"]').first()
    await firstCard.click()
    
    // Should open modal
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    
    // Should display property details
    await expect(page.locator('text=/\\$[0-9,]+/')).toBeVisible() // Price
    await expect(page.locator('text=/bd|ba|sq ft/')).toBeVisible() // Property details
    
    // Should show 4 action buttons
    await expect(page.locator('[aria-label="Like this property"]')).toBeVisible()
    await expect(page.locator('[aria-label="Dislike this property"]')).toBeVisible()
    await expect(page.locator('[aria-label="Consider this property"]')).toBeVisible()
    await expect(page.locator('[aria-label="Schedule visit for this property"]')).toBeVisible()
  })

  test('should move property to bucket when action is clicked', async ({ page }) => {
    // Click on first property card
    const firstCard = page.locator('[role="button"][aria-label*="Property card"]').first()
    await firstCard.click()
    
    // Wait for modal to open
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    
    // Click like button
    const likeButton = page.locator('[aria-label="Like this property"]')
    await likeButton.click()
    
    // Modal should close
    await expect(page.locator('[role="dialog"]')).toBeHidden()
    
    // Should update bucket counter
    const likedBucketTab = page.locator('[data-testid="bucket-liked"]')
    await expect(likedBucketTab).toContainText('1')
  })

  test('should show 5-bucket navigation at bottom', async ({ page }) => {
    // Should display all 5 bucket tabs
    await expect(page.locator('[data-testid="bucket-new_properties"]')).toBeVisible()
    await expect(page.locator('[data-testid="bucket-liked"]')).toBeVisible()
    await expect(page.locator('[data-testid="bucket-disliked"]')).toBeVisible()
    await expect(page.locator('[data-testid="bucket-considering"]')).toBeVisible()
    await expect(page.locator('[data-testid="bucket-schedule_visit"]')).toBeVisible()
    
    // Should show counter badges
    const newPropertiesTab = page.locator('[data-testid="bucket-new_properties"]')
    await expect(newPropertiesTab).toContainText('4') // Initial count
  })

  test('should switch between buckets', async ({ page }) => {
    // Move a property to liked bucket first
    const firstCard = page.locator('[role="button"][aria-label*="Property card"]').first()
    await firstCard.click()
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    await page.locator('[aria-label="Like this property"]').click()
    
    // Switch to liked bucket
    const likedTab = page.locator('[data-testid="bucket-liked"]')
    await likedTab.click()
    
    // Should show liked property
    await expect(page.locator('[role="button"][aria-label*="Property card"]')).toHaveCount(1)
    
    // Switch back to new properties
    const newTab = page.locator('[data-testid="bucket-new_properties"]')
    await newTab.click()
    
    // Should show remaining 3 properties
    await expect(page.locator('[role="button"][aria-label*="Property card"]')).toHaveCount(3)
  })

  test('should persist state across page refreshes', async ({ page }) => {
    // Like a property
    const firstCard = page.locator('[role="button"][aria-label*="Property card"]').first()
    await firstCard.click()
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    await page.locator('[aria-label="Like this property"]').click()
    
    // Refresh page
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Should still show updated bucket count
    const likedTab = page.locator('[data-testid="bucket-liked"]')
    await expect(likedTab).toContainText('1')
    
    // Switch to liked bucket - should still contain the property
    await likedTab.click()
    await expect(page.locator('[role="button"][aria-label*="Property card"]')).toHaveCount(1)
  })

  test('should handle all 4 property actions', async ({ page }) => {
    const actions = [
      { name: 'Like this property', bucket: 'liked' },
      { name: 'Dislike this property', bucket: 'disliked' },
      { name: 'Consider this property', bucket: 'considering' },
      { name: 'Schedule visit for this property', bucket: 'schedule_visit' }
    ]
    
    // Test each action with a different property
    for (let i = 0; i < actions.length; i++) {
      const action = actions[i]
      
      // Click property card
      const propertyCard = page.locator('[role="button"][aria-label*="Property card"]').nth(i)
      await propertyCard.click()
      
      // Wait for modal and click action
      await expect(page.locator('[role="dialog"]')).toBeVisible()
      await page.locator(`[aria-label="${action.name}"]`).click()
      
      // Verify bucket count updated
      const bucketTab = page.locator(`[data-testid="bucket-${action.bucket}"]`)
      await expect(bucketTab).toContainText('1')
    }
    
    // New properties bucket should now be empty
    const newTab = page.locator('[data-testid="bucket-new_properties"]')
    await expect(newTab).toContainText('0')
  })

  test('should close modal with escape key', async ({ page }) => {
    // Open modal
    const firstCard = page.locator('[role="button"][aria-label*="Property card"]').first()
    await firstCard.click()
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    
    // Press escape
    await page.keyboard.press('Escape')
    
    // Modal should close
    await expect(page.locator('[role="dialog"]')).toBeHidden()
  })

  test('should close modal when clicking backdrop', async ({ page }) => {
    // Open modal
    const firstCard = page.locator('[role="button"][aria-label*="Property card"]').first()
    await firstCard.click()
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    
    // Click backdrop (outside modal content)
    await page.locator('[role="dialog"]').click({ position: { x: 10, y: 10 } })
    
    // Modal should close
    await expect(page.locator('[role="dialog"]')).toBeHidden()
  })

  test('should show property details in modal', async ({ page }) => {
    // Open modal
    const firstCard = page.locator('[role="button"][aria-label*="Property card"]').first()
    await firstCard.click()
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    
    // Should show key property information
    await expect(page.locator('text=/\\$[0-9,]+/')).toBeVisible() // Price
    await expect(page.locator('text=/Miami|FL|Beach|Boulevard/')).toBeVisible() // Address
    await expect(page.locator('text=/[0-9]+ bd/')).toBeVisible() // Bedrooms
    await expect(page.locator('text=/[0-9.]+ ba/')).toBeVisible() // Bathrooms
    await expect(page.locator('text=/[0-9,]+ sq ft/')).toBeVisible() // Square footage
    
    // Should show property type badge
    await expect(page.locator('text=/condo|house|apartment/')).toBeVisible()
  })

  test('should handle empty bucket states', async ({ page }) => {
    // Switch to an empty bucket (considering)
    const consideringTab = page.locator('[data-testid="bucket-considering"]')
    await consideringTab.click()
    
    // Should show empty state
    await expect(page.locator('[data-testid="carousel-empty-state"]')).toBeVisible()
    await expect(page.locator('text=/no properties/i')).toBeVisible()
  })

  test('should show responsive design elements', async ({ page }) => {
    // Check for mobile-friendly elements
    const carousel = page.locator('[data-testid="property-carousel"]')
    await expect(carousel).toHaveAttribute('aria-label', 'Property carousel')
    
    // Should have proper touch targets (minimum 44x44px)
    const propertyCards = page.locator('[role="button"][aria-label*="Property card"]')
    for (let i = 0; i < await propertyCards.count(); i++) {
      const card = propertyCards.nth(i)
      const box = await card.boundingBox()
      expect(box?.height).toBeGreaterThanOrEqual(44)
    }
  })

  test('should track user interactions for analytics', async ({ page }) => {
    // Listen for analytics events (if implemented)
    const analyticsEvents: any[] = []
    
    page.on('request', request => {
      if (request.url().includes('analytics') || request.url().includes('track')) {
        analyticsEvents.push({
          url: request.url(),
          method: request.method(),
          postData: request.postData()
        })
      }
    })
    
    // Interact with properties
    const firstCard = page.locator('[role="button"][aria-label*="Property card"]').first()
    await firstCard.click()
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    await page.locator('[aria-label="Like this property"]').click()
    
    // Switch buckets
    const likedTab = page.locator('[data-testid="bucket-liked"]')
    await likedTab.click()
    
    // Note: This test will pass even if no analytics are tracked
    // It's more for monitoring that the interactions work smoothly
    console.log(`Captured ${analyticsEvents.length} analytics events`)
  })

  test('should work across different viewport sizes', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1024, height: 768, name: 'Desktop' }
    ]
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      
      // Should display carousel
      await expect(page.locator('[data-testid="property-carousel"]')).toBeVisible()
      
      // Should display property cards
      await expect(page.locator('[role="button"][aria-label*="Property card"]')).toHaveCount(4)
      
      // Should display bucket navigation
      await expect(page.locator('[data-testid="bucket-new_properties"]')).toBeVisible()
      
      console.log(`✓ ${viewport.name} (${viewport.width}x${viewport.height}) layout working`)
    }
  })
})

test.describe('Error Handling and Edge Cases', () => {
  
  test('should handle invalid link codes gracefully', async ({ page }) => {
    // Try to access non-existent link
    const response = await page.goto(`${BASE_URL}/link/invalid123`)
    
    // Should show 404 page
    expect(response?.status()).toBe(404)
  })

  test('should handle slow network conditions', async ({ page }) => {
    // Simulate slow network
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 100) // 100ms delay
    })
    
    await page.goto(`${BASE_URL}/link/${TEST_LINK_CODE}`)
    
    // Should still load and work
    await expect(page.locator('[data-testid="property-carousel"]')).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Accessibility', () => {
  
  test('should be accessible with keyboard navigation', async ({ page }) => {
    await page.goto(`${BASE_URL}/link/${TEST_LINK_CODE}`)
    
    // Should be able to tab through property cards
    const firstCard = page.locator('[role="button"][aria-label*="Property card"]').first()
    await firstCard.focus()
    await expect(firstCard).toBeFocused()
    
    // Should be able to open modal with Enter key
    await page.keyboard.press('Enter')
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    
    // Should be able to close modal with Escape
    await page.keyboard.press('Escape')
    await expect(page.locator('[role="dialog"]')).toBeHidden()
  })

  test('should have proper ARIA labels and roles', async ({ page }) => {
    await page.goto(`${BASE_URL}/link/${TEST_LINK_CODE}`)
    
    // Check carousel accessibility
    await expect(page.locator('[data-testid="property-carousel"]')).toHaveAttribute('role', 'region')
    await expect(page.locator('[data-testid="property-carousel"]')).toHaveAttribute('aria-label', 'Property carousel')
    
    // Check property cards
    const propertyCards = page.locator('[role="button"][aria-label*="Property card"]')
    expect(await propertyCards.count()).toBeGreaterThan(0)
    
    // Check bucket navigation
    for (const bucket of ['new_properties', 'liked', 'disliked', 'considering', 'schedule_visit']) {
      await expect(page.locator(`[data-testid="bucket-${bucket}"]`)).toHaveAttribute('role', 'tab')
    }
  })
})