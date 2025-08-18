import { test, expect } from '@playwright/test'

test.describe('Site Navigation', () => {
  test('should have consistent navigation across all pages', async ({ page }) => {
    const pages = ['/', '/properties', '/dashboard', '/links', '/analytics']
    
    for (const pagePath of pages) {
      await page.goto(pagePath)
      
      // Every page should have the main brand link
      await expect(page.getByRole('link', { name: 'SwipeLink Estate' })).toBeVisible()
      
      // Page should load without errors
      await expect(page).not.toHaveURL(/.*404.*/)
      
      // Should have a valid title
      await expect(page).toHaveTitle(/SwipeLink Estate/)
    }
  })

  test('should handle direct URL navigation correctly', async ({ page }) => {
    // Test direct navigation to each route
    const routes = [
      { path: '/', expectedText: 'Create Shareable Property Links' },
      { path: '/properties', expectedText: 'Discover Your Dream Property' },
      { path: '/dashboard', expectedText: 'Agent Dashboard' },
      { path: '/links', expectedText: 'Links Management' },
      { path: '/analytics', expectedText: 'Analytics Dashboard' }
    ]
    
    for (const route of routes) {
      await page.goto(route.path)
      await expect(page.getByText(route.expectedText)).toBeVisible()
      await expect(page).toHaveURL(route.path)
    }
  })

  test('should handle invalid routes with 404 page', async ({ page }) => {
    await page.goto('/invalid-route-that-does-not-exist')
    
    // Should show 404 page or redirect
    const is404 = page.url().includes('404') || 
                  await page.getByText('404').count() > 0 ||
                  await page.getByText('Page not found').count() > 0 ||
                  await page.getByText('Not Found').count() > 0
    
    expect(is404).toBe(true)
  })

  test('should maintain navigation state during user flow', async ({ page }) => {
    // Start from homepage
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /Create Shareable Property Links/i })).toBeVisible()
    
    // Navigate to properties
    await page.getByRole('link', { name: /Browse Properties/i }).click()
    await expect(page).toHaveURL('/properties')
    await expect(page.getByRole('heading', { name: /Discover Your Dream Property/i })).toBeVisible()
    
    // Navigate to agent portal
    await page.getByRole('link', { name: /Agent Portal/i }).click()
    await expect(page).toHaveURL('/dashboard')
    await expect(page.getByText('Agent Dashboard')).toBeVisible()
    
    // Navigate between agent sections
    await page.getByRole('link', { name: /Links/i }).click()
    await expect(page).toHaveURL('/links')
    
    await page.getByRole('link', { name: /Analytics/i }).click()
    await expect(page).toHaveURL('/analytics')
    
    // Return to homepage via brand link
    await page.getByRole('link', { name: 'SwipeLink Estate' }).click()
    await expect(page).toHaveURL('/')
    await expect(page.getByRole('heading', { name: /Create Shareable Property Links/i })).toBeVisible()
  })

  test('should work with browser back/forward buttons', async ({ page }) => {
    // Navigate through pages
    await page.goto('/')
    await page.getByRole('link', { name: /Browse Properties/i }).click()
    await expect(page).toHaveURL('/properties')
    
    await page.getByRole('link', { name: /Agent Portal/i }).click()
    await expect(page).toHaveURL('/dashboard')
    
    // Test back button
    await page.goBack()
    await expect(page).toHaveURL('/properties')
    await expect(page.getByRole('heading', { name: /Discover Your Dream Property/i })).toBeVisible()
    
    // Test forward button
    await page.goForward()
    await expect(page).toHaveURL('/dashboard')
    await expect(page.getByText('Agent Dashboard')).toBeVisible()
    
    // Test back to homepage
    await page.goBack()
    await page.goBack()
    await expect(page).toHaveURL('/')
  })

  test('should handle page refresh correctly', async ({ page }) => {
    const routes = ['/properties', '/dashboard', '/links', '/analytics']
    
    for (const route of routes) {
      await page.goto(route)
      
      // Refresh the page
      await page.reload()
      
      // Should still be on the same route
      await expect(page).toHaveURL(route)
      
      // Should load without errors
      await expect(page.getByRole('link', { name: 'SwipeLink Estate' })).toBeVisible()
    }
  })

  test('should have accessible navigation for keyboard users', async ({ page }) => {
    await page.goto('/')
    
    // Test tab navigation
    await page.keyboard.press('Tab')
    
    // Should be able to navigate through interactive elements
    let focusedElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(['A', 'BUTTON', 'INPUT'].includes(focusedElement || '')).toBe(true)
    
    // Test Enter key on focused link
    const firstLink = page.getByRole('link').first()
    await firstLink.focus()
    
    // Should be able to activate with Enter key
    await page.keyboard.press('Enter')
    
    // Should navigate (URL should change)
    await page.waitForTimeout(1000)
    expect(page.url()).not.toBe('http://localhost:3000/')
  })
})