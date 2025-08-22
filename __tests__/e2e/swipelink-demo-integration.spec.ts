/**
 * SwipeLink Demo Integration E2E Test
 * 
 * Tests the complete integration of the SwipeLink demo page
 * with 4-property carousel view and 5-bucket organization system
 */

import { test, expect } from '@playwright/test'

test.describe('SwipeLink Demo Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo/swipelink')
    await page.waitForLoadState('networkidle')
  })

  test('should display demo page with all components', async ({ page }) => {
    // Check header
    await expect(page.locator('h1')).toContainText('SwipeLink Demo')
    
    // Check property carousel is visible
    const carousel = page.locator('[data-testid="property-carousel"], .property-carousel, [class*="carousel"]').first()
    await expect(carousel).toBeVisible()
    
    // Check bucket navigation is visible
    const bucketNav = page.locator('[data-testid="bucket-navigation"], [class*="bucket"]').first()
    await expect(bucketNav).toBeVisible()
    
    // Check that we have 5 bucket buttons
    const bucketButtons = page.locator('button').filter({ hasText: /New|Liked|Disliked|Consider|Visit/i })
    await expect(bucketButtons).toHaveCount(5)
  })

  test('should show 4 properties in carousel on mobile view', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Check for property cards
    const propertyCards = page.locator('[class*="property-card"], [role="button"][aria-label*="Property card"]')
    
    // Should have at least 4 property cards visible
    const count = await propertyCards.count()
    expect(count).toBeGreaterThanOrEqual(4)
  })

  test('should open modal when property card is clicked', async ({ page }) => {
    // Click on first property card
    const firstCard = page.locator('[class*="property-card"], [role="button"][aria-label*="Property card"]').first()
    await firstCard.click()
    
    // Check modal is open
    const modal = page.locator('[role="dialog"], [class*="modal"]').first()
    await expect(modal).toBeVisible()
    
    // Check modal has action buttons
    const actionButtons = modal.locator('button').filter({ hasText: /Like|Dislike|Consider|Visit/i })
    await expect(actionButtons).toHaveCount(4)
  })

  test('should move property to bucket when action button is clicked', async ({ page }) => {
    // Get initial count of "New Properties" bucket
    const newBucketButton = page.locator('button').filter({ hasText: /New/i }).first()
    const initialText = await newBucketButton.textContent()
    
    // Click on first property card
    const firstCard = page.locator('[class*="property-card"], [role="button"][aria-label*="Property card"]').first()
    await firstCard.click()
    
    // Wait for modal
    const modal = page.locator('[role="dialog"], [class*="modal"]').first()
    await expect(modal).toBeVisible()
    
    // Click "Like" button in modal
    const likeButton = modal.locator('button').filter({ hasText: /Like/i }).first()
    await likeButton.click()
    
    // Modal should close
    await expect(modal).not.toBeVisible()
    
    // Check that "Liked" bucket count increased
    const likedBucketButton = page.locator('button').filter({ hasText: /Liked/i }).first()
    const likedText = await likedBucketButton.textContent()
    expect(likedText).toContain('1')
  })

  test('should filter properties by bucket when bucket is selected', async ({ page }) => {
    // First, like a property
    const firstCard = page.locator('[class*="property-card"], [role="button"][aria-label*="Property card"]').first()
    await firstCard.click()
    
    const modal = page.locator('[role="dialog"], [class*="modal"]').first()
    await expect(modal).toBeVisible()
    
    const likeButton = modal.locator('button').filter({ hasText: /Like/i }).first()
    await likeButton.click()
    
    // Click on "Liked" bucket
    const likedBucketButton = page.locator('button').filter({ hasText: /Liked/i }).first()
    await likedBucketButton.click()
    
    // Should show only liked properties (1 in this case)
    const propertyCards = page.locator('[class*="property-card"], [role="button"][aria-label*="Property card"]')
    const count = await propertyCards.count()
    expect(count).toBe(1)
  })

  test('should persist bucket assignments in session storage', async ({ page }) => {
    // Like a property
    const firstCard = page.locator('[class*="property-card"], [role="button"][aria-label*="Property card"]').first()
    await firstCard.click()
    
    const modal = page.locator('[role="dialog"], [class*="modal"]').first()
    await expect(modal).toBeVisible()
    
    const likeButton = modal.locator('button').filter({ hasText: /Like/i }).first()
    await likeButton.click()
    
    // Check session storage
    const sessionData = await page.evaluate(() => {
      return sessionStorage.getItem('swipelink-buckets')
    })
    
    expect(sessionData).toBeTruthy()
    const parsed = JSON.parse(sessionData!)
    expect(parsed.state.buckets.liked).toHaveLength(1)
  })

  test('should handle all 4 action buttons correctly', async ({ page }) => {
    // Test each action button
    const actions = ['Like', 'Dislike', 'Consider', 'Visit']
    const buckets = ['Liked', 'Disliked', 'Consider', 'Visit']
    
    for (let i = 0; i < actions.length; i++) {
      // Click on a property card
      const card = page.locator('[class*="property-card"], [role="button"][aria-label*="Property card"]').first()
      await card.click()
      
      // Wait for modal
      const modal = page.locator('[role="dialog"], [class*="modal"]').first()
      await expect(modal).toBeVisible()
      
      // Click action button
      const actionButton = modal.locator('button').filter({ hasText: actions[i] }).first()
      await actionButton.click()
      
      // Modal should close
      await expect(modal).not.toBeVisible()
      
      // Check bucket count updated
      const bucketButton = page.locator('button').filter({ hasText: buckets[i] }).first()
      const bucketText = await bucketButton.textContent()
      expect(bucketText).toContain('1')
      
      // Reset for next iteration - go back to new properties
      const newBucketButton = page.locator('button').filter({ hasText: /New/i }).first()
      await newBucketButton.click()
    }
  })
})