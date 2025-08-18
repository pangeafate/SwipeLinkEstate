import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/')
    
    // Check page loads and title is correct
    await expect(page).toHaveTitle(/SwipeLink Estate/)
    
    // Check main heading is visible
    await expect(page.getByRole('heading', { name: /SwipeLink Estate/i })).toBeVisible()
    
    // Check navigation is present
    await expect(page.getByRole('link', { name: 'SwipeLink Estate' })).toBeVisible()
  })

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/')
    
    // Check all main navigation buttons are present and clickable
    const browseButton = page.getByRole('link', { name: /Browse Properties/i })
    const agentDashboardButton = page.getByRole('link', { name: /Agent Dashboard/i })
    
    await expect(browseButton).toBeVisible()
    await expect(agentDashboardButton).toBeVisible()
    
    // Test navigation to properties page
    await browseButton.click()
    await expect(page).toHaveURL('/properties')
    await expect(page.getByRole('heading', { name: /Discover Your Dream Property/i })).toBeVisible()
  })

  test('should navigate to agent dashboard', async ({ page }) => {
    await page.goto('/')
    
    // Click Agent Dashboard button
    await page.getByRole('link', { name: /Agent Dashboard/i }).click()
    
    // Should navigate to dashboard
    await expect(page).toHaveURL('/dashboard')
    await expect(page.getByText('Agent Dashboard')).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Check mobile layout loads properly
    await expect(page.getByRole('heading', { name: /SwipeLink Estate/i })).toBeVisible()
    
    // Check buttons are still accessible on mobile
    await expect(page.getByRole('link', { name: /Browse Properties/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Agent Dashboard/i })).toBeVisible()
  })
})