import { test, expect } from '@playwright/test'

// Test configurations for different viewports
const viewports = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1920, height: 1080 }
]

// Test data
const TEST_URL = 'http://localhost:3001/demo/client'
const LINK_CODE = 'DEMO-CLIENT-2024'

test.describe('SwipeLink Client Visual Tests', () => {
  
  // Test initial carousel view across all viewports
  viewports.forEach(({ name, width, height }) => {
    test(`should display initial carousel with 4 properties - ${name} view`, async ({ page }) => {
      await page.setViewportSize({ width, height })
      await page.goto(TEST_URL)
      
      // Wait for the component to load
      await page.waitForSelector('.swipelink-client')
      
      // Wait for properties to load
      await page.waitForSelector('[data-testid^="property-card-"]', { timeout: 10000 })
      
      // Verify header content
      await expect(page.locator('h1')).toContainText('SwipeLink Client Demo')
      await expect(page.locator('text=12 properties loaded')).toBeVisible()
      
      // Verify initial bucket is "New Properties"
      await expect(page.locator('.swipelink-client h2')).toContainText('New Properties')
      
      // Check that we have property cards visible
      const propertyCards = page.locator('[data-testid^="property-card-"]')
      await expect(propertyCards.first()).toBeVisible()
      
      // Verify bucket navigation is present
      const bucketNav = page.locator('[data-testid^="bucket-"]')
      await expect(bucketNav.first()).toBeVisible()
      
      // Take screenshot
      await page.screenshot({ 
        path: `__tests__/screenshots/client-initial-carousel-${name}.png`,
        fullPage: true 
      })
    })
  })

  // Test property modal across viewports
  viewports.forEach(({ name, width, height }) => {
    test(`should open and display property modal - ${name} view`, async ({ page }) => {
      await page.setViewportSize({ width, height })
      await page.goto(TEST_URL)
      
      // Wait for the component to load
      await page.waitForSelector('.swipelink-client')
      await page.waitForSelector('[data-testid^="property-card-"]', { timeout: 10000 })
      
      // Click on the first property card to open modal
      const firstPropertyCard = page.locator('[data-testid^="property-card-"]').first()
      await firstPropertyCard.click()
      
      // Wait for modal to open
      const modal = page.locator('[data-testid="property-modal"]')
      await expect(modal).toBeVisible({ timeout: 5000 })
      
      // Verify modal content
      await expect(modal.locator('[data-testid="property-price"]')).toBeVisible()
      await expect(modal.locator('[data-testid="property-details"]')).toBeVisible()
      
      // Verify bucket assignment buttons are present
      await expect(modal.locator('[data-testid="bucket-btn-liked"]')).toBeVisible()
      await expect(modal.locator('[data-testid="bucket-btn-disliked"]')).toBeVisible()
      await expect(modal.locator('[data-testid="bucket-btn-considering"]')).toBeVisible()
      await expect(modal.locator('[data-testid="bucket-btn-schedule_visit"]')).toBeVisible()
      
      // Take screenshot
      await page.screenshot({ 
        path: `__tests__/screenshots/client-property-modal-${name}.png`,
        fullPage: true 
      })
      
      // Close modal
      await page.locator('[data-testid="modal-close-btn"]').click()
      await expect(modal).not.toBeVisible()
    })
  })

  // Test bucket navigation and property assignment
  viewports.forEach(({ name, width, height }) => {
    test(`should navigate buckets and assign properties - ${name} view`, async ({ page }) => {
      await page.setViewportSize({ width, height })
      await page.goto(TEST_URL)
      
      // Wait for the component to load
      await page.waitForSelector('.swipelink-client')
      await page.waitForSelector('[data-testid^="property-card-"]', { timeout: 10000 })
      
      // Open first property modal
      const firstPropertyCard = page.locator('[data-testid^="property-card-"]').first()
      await firstPropertyCard.click()
      
      // Wait for modal and assign to "Liked"
      const modal = page.locator('[data-testid="property-modal"]')
      await expect(modal).toBeVisible()
      await modal.locator('[data-testid="bucket-btn-liked"]').click()
      
      // Modal should close after assignment
      await expect(modal).not.toBeVisible()
      
      // Navigate to "Liked" bucket
      const likedBucketBtn = page.locator('[data-testid="bucket-liked"]')
      await likedBucketBtn.click()
      
      // Verify we're in the liked bucket
      await expect(page.locator('.swipelink-client h2')).toContainText('Liked Properties')
      await expect(page.locator('text=1 property')).toBeVisible()
      
      // Take screenshot of liked bucket
      await page.screenshot({ 
        path: `__tests__/screenshots/client-liked-bucket-${name}.png`,
        fullPage: true 
      })
      
      // Navigate back to new properties
      const newPropertiesBtn = page.locator('[data-testid="bucket-new_properties"]')
      await newPropertiesBtn.click()
      
      // Verify we're back in new properties and count decreased
      await expect(page.locator('.swipelink-client h2')).toContainText('New Properties')
      await expect(page.locator('text=11 properties')).toBeVisible()
    })
  })

  // Test carousel navigation
  test('should navigate through carousel properties - desktop view', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto(TEST_URL)
    
    // Wait for the component to load
    await page.waitForSelector('.swipelink-client')
    await page.waitForSelector('[data-testid^="property-card-"]', { timeout: 10000 })
    
    // Check if next button exists and click it
    const nextBtn = page.locator('[data-testid="carousel-next-btn"]')
    if (await nextBtn.isVisible()) {
      await nextBtn.click()
      
      // Wait for navigation animation
      await page.waitForTimeout(500)
      
      // Take screenshot after navigation
      await page.screenshot({ 
        path: '__tests__/screenshots/client-carousel-navigation-desktop.png',
        fullPage: true 
      })
    }
    
    // Check if previous button exists and click it
    const prevBtn = page.locator('[data-testid="carousel-prev-btn"]')
    if (await prevBtn.isVisible()) {
      await prevBtn.click()
      
      // Wait for navigation animation
      await page.waitForTimeout(500)
    }
  })

  // Test empty bucket state
  test('should display empty state for unused buckets - desktop view', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto(TEST_URL)
    
    // Wait for the component to load
    await page.waitForSelector('.swipelink-client')
    
    // Navigate to "Considering" bucket (should be empty initially)
    const consideringBtn = page.locator('[data-testid="bucket-considering"]')
    await consideringBtn.click()
    
    // Verify empty state
    await expect(page.locator('h3')).toContainText('No Properties Yet')
    await expect(page.locator('text=Browse Properties')).toBeVisible()
    
    // Take screenshot of empty state
    await page.screenshot({ 
      path: '__tests__/screenshots/client-empty-bucket-desktop.png',
      fullPage: true 
    })
  })

  // Test responsive design elements
  test('should show mobile-optimized layout on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto(TEST_URL)
    
    // Wait for the component to load
    await page.waitForSelector('.swipelink-client')
    await page.waitForSelector('[data-testid^="property-card-"]', { timeout: 10000 })
    
    // Verify mobile navigation is properly positioned
    const bucketNav = page.locator('[data-testid="bucket-navigation"]')
    await expect(bucketNav).toBeVisible()
    
    // Check that content doesn't overflow
    const body = page.locator('body')
    const bodyBox = await body.boundingBox()
    expect(bodyBox?.width).toBeLessThanOrEqual(375)
    
    // Take mobile screenshot
    await page.screenshot({ 
      path: '__tests__/screenshots/client-mobile-responsive.png',
      fullPage: true 
    })
  })

  // Test all bucket types
  const buckets = [
    { key: 'new_properties', label: 'New Properties' },
    { key: 'liked', label: 'Liked Properties' },
    { key: 'disliked', label: 'Disliked Properties' },
    { key: 'considering', label: 'Considering' },
    { key: 'schedule_visit', label: 'Schedule Visit' }
  ]

  buckets.forEach(({ key, label }) => {
    test(`should display ${label} bucket correctly - desktop view`, async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 })
      await page.goto(TEST_URL)
      
      // Wait for the component to load
      await page.waitForSelector('.swipelink-client')
      
      // Navigate to specific bucket
      const bucketBtn = page.locator(`[data-testid="bucket-${key}"]`)
      await bucketBtn.click()
      
      // Verify bucket header
      await expect(page.locator('.swipelink-client h2')).toContainText(label)
      
      // Take screenshot
      await page.screenshot({ 
        path: `__tests__/screenshots/client-bucket-${key}-desktop.png`,
        fullPage: true 
      })
    })
  })

  // Test property assignment workflow
  test('should complete full property assignment workflow - desktop view', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto(TEST_URL)
    
    // Wait for the component to load
    await page.waitForSelector('.swipelink-client')
    await page.waitForSelector('[data-testid^="property-card-"]', { timeout: 10000 })
    
    // Assign multiple properties to different buckets
    const properties = await page.locator('[data-testid^="property-card-"]').all()
    
    // Assign first property to liked
    await properties[0].click()
    let modal = page.locator('[data-testid="property-modal"]')
    await expect(modal).toBeVisible()
    await modal.locator('[data-testid="bucket-btn-liked"]').click()
    await expect(modal).not.toBeVisible()
    
    // Assign second property to considering (if available)
    if (properties.length > 1) {
      await properties[1].click()
      modal = page.locator('[data-testid="property-modal"]')
      await expect(modal).toBeVisible()
      await modal.locator('[data-testid="bucket-btn-considering"]').click()
      await expect(modal).not.toBeVisible()
    }
    
    // Check bucket counts updated
    const likedBtn = page.locator('[data-testid="bucket-liked"]')
    await expect(likedBtn).toContainText('1')
    
    const consideringBtn = page.locator('[data-testid="bucket-considering"]')
    await expect(consideringBtn).toContainText('1')
    
    // Take final screenshot
    await page.screenshot({ 
      path: '__tests__/screenshots/client-assignment-workflow-complete-desktop.png',
      fullPage: true 
    })
  })
})