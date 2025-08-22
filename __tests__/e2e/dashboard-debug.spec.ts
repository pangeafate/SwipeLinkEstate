import { test, expect } from '@playwright/test'

test.describe('Dashboard Loading Debug', () => {
  test('should load dashboard and display proper content', async ({ page }) => {
    await test.step('Navigate to dashboard', async () => {
      await page.goto('/dashboard')
      
      // Check if page loads
      await expect(page).toHaveTitle(/SwipeLink Estate/)
      
      // Take screenshot for debugging
      await page.screenshot({ path: 'dashboard-debug.png', fullPage: true })
    })
    
    await test.step('Check dashboard elements', async () => {
      // Wait for page to be fully loaded
      await page.waitForLoadState('networkidle')
      
      // Check for header
      await expect(page.getByText('SwipeLink Estate')).toBeVisible()
      await expect(page.getByText('Agent Dashboard')).toBeVisible()
      
      // Check for navigation
      await expect(page.getByRole('link', { name: 'Properties' })).toBeVisible()
      await expect(page.getByRole('link', { name: 'Links' })).toBeVisible()
      await expect(page.getByRole('link', { name: 'Analytics' })).toBeVisible()
      
      // Check for stats cards
      await expect(page.getByText('Total Properties')).toBeVisible()
      await expect(page.getByText('Active Links')).toBeVisible()
      await expect(page.getByText('Total Views')).toBeVisible()
      await expect(page.getByText('Total Sessions')).toBeVisible()
      
      // Check for main heading - this might be missing
      const mainHeading = await page.getByRole('heading', { name: /Dashboard|Properties/i })
      
      if (await mainHeading.isVisible()) {
        console.log('Main heading found')
      } else {
        console.log('Main heading NOT found - this is the issue')
        
        // Let's check what headings exist
        const allHeadings = await page.$$('h1, h2, h3, h4, h5, h6')
        console.log(`Found ${allHeadings.length} headings on page`)
        
        for (let i = 0; i < allHeadings.length; i++) {
          const text = await allHeadings[i].textContent()
          const tagName = await allHeadings[i].evaluate(el => el.tagName)
          console.log(`Heading ${i + 1}: ${tagName} - "${text}"`)
        }
      }
      
      // Check for loading state
      const loadingElement = await page.getByText('Loading properties...')
      if (await loadingElement.isVisible()) {
        console.log('Dashboard is stuck in loading state')
      }
      
      // Check for any error messages
      const errorElements = await page.$$('text=/error|Error|failed|Failed/i')
      if (errorElements.length > 0) {
        console.log(`Found ${errorElements.length} error elements`)
        for (let error of errorElements) {
          const text = await error.textContent()
          console.log(`Error: ${text}`)
        }
      }
    })
    
    await test.step('Check browser console for errors', async () => {
      const logs: string[] = []
      
      page.on('console', msg => {
        if (msg.type() === 'error') {
          logs.push(`Console Error: ${msg.text()}`)
        }
      })
      
      // Reload to capture console errors
      await page.reload()
      await page.waitForLoadState('networkidle')
      
      if (logs.length > 0) {
        console.log('Console errors found:')
        logs.forEach(log => console.log(log))
      } else {
        console.log('No console errors found')
      }
    })
  })
  
  test('should have working Add Property button', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    
    const addPropertyBtn = await page.getByRole('button', { name: 'Add Property' })
    await expect(addPropertyBtn).toBeVisible()
    
    // Test clicking the button
    await addPropertyBtn.click()
    
    // Check what happens - should either open modal or navigate
    await page.waitForTimeout(1000) // Wait for any action
    
    console.log(`Current URL after clicking Add Property: ${page.url()}`)
  })
})