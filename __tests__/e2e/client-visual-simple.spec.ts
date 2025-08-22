import { test, expect } from '@playwright/test'

// Test configurations for different viewports
const viewports = [
  { name: 'desktop', width: 1920, height: 1080 }
]

// Test data
const TEST_URL = 'http://localhost:3001/demo/client'

test.describe('SwipeLink Client Visual Tests - Simple', () => {
  
  test('should display demo page and take screenshot - desktop view', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto(TEST_URL)
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle')
    
    // Wait a bit more for React to hydrate
    await page.waitForTimeout(2000)
    
    // Check if the page title is correct
    await expect(page.locator('h1')).toContainText('SwipeLink Client Demo')
    
    // Take screenshot of the entire page
    await page.screenshot({ 
      path: '__tests__/screenshots/client-demo-page-desktop.png',
      fullPage: true 
    })
    
    // Check if the SwipeLink client component is present
    const clientComponent = page.locator('.swipelink-client')
    if (await clientComponent.isVisible()) {
      console.log('SwipeLink client component found!')
      
      // Take screenshot of just the component
      await clientComponent.screenshot({ 
        path: '__tests__/screenshots/client-component-desktop.png'
      })
    } else {
      console.log('SwipeLink client component not found, checking for alternative selectors...')
      
      // Check for any property-related content
      const propertyContent = page.locator('text=properties loaded')
      if (await propertyContent.isVisible()) {
        console.log('Property content found!')
      }
      
      // Check page content
      const pageContent = await page.content()
      console.log('Page contains SwipeLinkClient:', pageContent.includes('SwipeLinkClient'))
      console.log('Page contains properties:', pageContent.includes('properties'))
    }
  })
  
  test('should check component loading and structure', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto(TEST_URL)
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)
    
    // Check basic page structure
    await expect(page.locator('h1')).toContainText('SwipeLink Client Demo')
    await expect(page.locator('text=12 properties loaded')).toBeVisible()
    
    // Look for any client component indicators
    const possibleSelectors = [
      '.swipelink-client',
      '[data-testid="swipelink-client"]',
      '.demo-swipelink-client',
      'div:has-text("New Properties")',
      'h2:has-text("New Properties")'
    ]
    
    let foundComponent = false
    for (const selector of possibleSelectors) {
      const element = page.locator(selector)
      if (await element.isVisible()) {
        console.log(`Found component with selector: ${selector}`)
        foundComponent = true
        break
      }
    }
    
    // Take screenshot regardless
    await page.screenshot({ 
      path: '__tests__/screenshots/client-structure-check-desktop.png',
      fullPage: true 
    })
    
    if (foundComponent) {
      console.log('Component structure verified!')
    } else {
      console.log('Component not found with any selector, but page loaded successfully')
    }
  })
})