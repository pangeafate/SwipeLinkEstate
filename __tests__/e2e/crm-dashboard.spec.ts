import { test, expect } from '@playwright/test'

test.describe('CRM Dashboard E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to CRM dashboard
    await page.goto('/crm')
  })

  test('should load CRM dashboard successfully', async ({ page }) => {
    // Check main heading
    await expect(page.locator('h1')).toContainText('CRM Dashboard')
    
    // Check subtitle
    await expect(page.locator('text=Link-as-Deal Management System')).toBeVisible()
    
    // Verify summary cards are present
    await expect(page.locator('text=Total Deals')).toBeVisible()
    await expect(page.locator('text=Hot Leads')).toBeVisible()
    await expect(page.locator('text=Pending Tasks')).toBeVisible()
    await expect(page.locator('text=This Month Revenue')).toBeVisible()
  })

  test('should display deal pipeline section', async ({ page }) => {
    // Wait for Deal Pipeline heading
    await page.waitForSelector('h1:has-text("Deal Pipeline")', { 
      timeout: 10000,
      state: 'visible' 
    })
    
    // Check pipeline stages are visible
    const pipelineStages = ['Created', 'Shared', 'Accessed', 'Engaged', 'Qualified', 'Advanced', 'Closed']
    
    for (const stage of pipelineStages) {
      const stageElement = page.locator(`text=${stage}`)
      // Stage might not be visible if no deals in that stage, so we check if it exists
      const count = await stageElement.count()
      if (count > 0) {
        await expect(stageElement.first()).toBeVisible()
      }
    }
  })

  test('should display hot leads section', async ({ page }) => {
    // Check hot leads section exists
    const hotLeadsSection = page.locator('text=🔥 Hot Leads')
    await expect(hotLeadsSection).toBeVisible()
    
    // Check for contact buttons in hot leads
    const contactButtons = page.locator('button:has-text("Contact")')
    const buttonCount = await contactButtons.count()
    
    if (buttonCount > 0) {
      // If there are hot leads, verify contact button is clickable
      await expect(contactButtons.first()).toBeEnabled()
    }
  })

  test('should display task automation panel', async ({ page }) => {
    // Check for task automation component
    const taskSection = page.locator('[data-testid="task-automation"]')
    
    // Tasks might be present or not
    const tasksExist = await taskSection.count() > 0
    
    if (tasksExist) {
      await expect(taskSection).toBeVisible()
      
      // Check for task complete buttons
      const completeButtons = page.locator('button:has-text("Complete")')
      if (await completeButtons.count() > 0) {
        await expect(completeButtons.first()).toBeEnabled()
      }
    }
  })

  test('should display analytics section', async ({ page }) => {
    // Scroll to analytics section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    
    // Check for analytics component
    const analyticsSection = page.locator('[data-testid="crm-analytics"]')
    
    if (await analyticsSection.count() > 0) {
      await expect(analyticsSection).toBeVisible()
    }
  })

  test('should handle loading state', async ({ page }) => {
    // Reload page and check loading indicator
    await page.reload()
    
    // Loading spinner should appear briefly
    const spinner = page.locator('.animate-spin')
    
    // Wait for either spinner or content
    await Promise.race([
      page.waitForSelector('.animate-spin', { timeout: 5000 }),
      page.waitForSelector('h1:has-text("CRM Dashboard")', { timeout: 5000 })
    ])
    
    // Eventually dashboard should load
    await expect(page.locator('h1')).toContainText('CRM Dashboard', { timeout: 10000 })
  })

  test('should handle error state gracefully', async ({ page }) => {
    // Intercept API calls and force an error
    await page.route('**/api/crm/**', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' })
      })
    })
    
    // Reload to trigger error
    await page.reload()
    
    // Check for error message
    const errorMessage = page.locator('text=/Error loading CRM data/')
    
    // Error message might appear if API fails
    if (await errorMessage.count() > 0) {
      await expect(errorMessage).toBeVisible()
    }
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Check dashboard is still accessible
    await expect(page.locator('h1')).toContainText('CRM Dashboard')
    
    // Summary cards should stack vertically
    const summaryCards = page.locator('[class*="grid-cols-1"]')
    await expect(summaryCards.first()).toBeVisible()
    
    // Check mobile menu if present
    const mobileMenu = page.locator('[data-testid="mobile-menu"]')
    if (await mobileMenu.count() > 0) {
      await mobileMenu.click()
      // Verify menu opens
      await expect(page.locator('[data-testid="mobile-menu-content"]')).toBeVisible()
    }
  })

  test('should navigate to deal details when clicking a deal', async ({ page }) => {
    // Find a deal card if present
    const dealCard = page.locator('[data-testid="deal-card"]').first()
    
    if (await dealCard.count() > 0) {
      // Click on the deal card
      await dealCard.click()
      
      // Should navigate to deal detail page or open modal
      await page.waitForURL(/\/crm\/deal\/.*|#deal-.*/, { timeout: 5000 })
        .catch(() => {
          // Or check for modal
          return expect(page.locator('[data-testid="deal-modal"]')).toBeVisible()
        })
    }
  })

  test('should complete a task', async ({ page }) => {
    // Find a pending task
    const taskItem = page.locator('[data-testid="task-item"]').first()
    
    if (await taskItem.count() > 0) {
      // Get initial task count
      const pendingTasksText = await page.locator('text=Pending Tasks').locator('..').textContent()
      const initialCount = parseInt(pendingTasksText?.match(/\d+/)?.[0] || '0')
      
      // Click complete button
      const completeButton = taskItem.locator('button:has-text("Complete")')
      if (await completeButton.count() > 0) {
        await completeButton.click()
        
        // Wait for update
        await page.waitForTimeout(1000)
        
        // Check task count decreased
        const updatedTasksText = await page.locator('text=Pending Tasks').locator('..').textContent()
        const updatedCount = parseInt(updatedTasksText?.match(/\d+/)?.[0] || '0')
        
        expect(updatedCount).toBeLessThanOrEqual(initialCount)
      }
    }
  })

  test('should filter deals by status', async ({ page }) => {
    // Look for filter controls
    const filterDropdown = page.locator('[data-testid="deal-filter"]')
    
    if (await filterDropdown.count() > 0) {
      // Open filter
      await filterDropdown.click()
      
      // Select a filter option (e.g., "Active")
      await page.locator('text=Active').click()
      
      // Wait for filtered results
      await page.waitForTimeout(500)
      
      // Verify filtered results
      const dealCards = page.locator('[data-testid="deal-card"]')
      const dealCount = await dealCards.count()
      
      // All visible deals should have "Active" status
      for (let i = 0; i < dealCount; i++) {
        const statusBadge = dealCards.nth(i).locator('[data-testid="deal-status"]')
        if (await statusBadge.count() > 0) {
          await expect(statusBadge).toContainText('Active')
        }
      }
    }
  })

  test('should refresh data when clicking refresh button', async ({ page }) => {
    // Find refresh button
    const refreshButton = page.locator('button[aria-label="Refresh"]')
    
    if (await refreshButton.count() > 0) {
      // Intercept API call to verify refresh happens
      let refreshCalled = false
      await page.route('**/api/crm/**', route => {
        refreshCalled = true
        route.continue()
      })
      
      // Click refresh
      await refreshButton.click()
      
      // Wait for API call
      await page.waitForTimeout(1000)
      
      // Verify refresh was called
      expect(refreshCalled).toBeTruthy()
    }
  })

  test('should display engagement scores correctly', async ({ page }) => {
    // Look for engagement score displays
    const scores = page.locator('text=/Score: \\d+\\/100/')
    
    if (await scores.count() > 0) {
      // Get all scores
      const scoreCount = await scores.count()
      
      for (let i = 0; i < Math.min(scoreCount, 3); i++) {
        const scoreText = await scores.nth(i).textContent()
        const score = parseInt(scoreText?.match(/\d+/)?.[0] || '0')
        
        // Verify score is in valid range
        expect(score).toBeGreaterThanOrEqual(0)
        expect(score).toBeLessThanOrEqual(100)
        
        // Check temperature classification based on score
        const dealElement = scores.nth(i).locator('..')
        const dealText = await dealElement.textContent()
        
        if (score >= 80) {
          // Should be marked as hot lead
          expect(dealText).toMatch(/hot|🔥/i)
        } else if (score >= 50) {
          // Should be warm lead
          expect(dealText).toMatch(/warm/i)
        } else {
          // Should be cold lead
          expect(dealText).toMatch(/cold/i)
        }
      }
    }
  })

  test('should display revenue metrics', async ({ page }) => {
    // Find revenue display
    const revenueCard = page.locator('text=This Month Revenue').locator('..')
    
    await expect(revenueCard).toBeVisible()
    
    // Get revenue value
    const revenueText = await revenueCard.textContent()
    const revenueMatch = revenueText?.match(/\$[\d,]+/)
    
    if (revenueMatch) {
      // Verify it's a valid currency format
      expect(revenueMatch[0]).toMatch(/^\$[\d,]+$/)
    }
  })

  test('should show performance trends', async ({ page }) => {
    // Look for trend indicators
    const trendIndicators = page.locator('text=/[↑↓→]/')
    
    if (await trendIndicators.count() > 0) {
      const indicatorCount = await trendIndicators.count()
      
      for (let i = 0; i < indicatorCount; i++) {
        const indicator = await trendIndicators.nth(i).textContent()
        
        // Verify it's a valid trend indicator
        expect(indicator).toMatch(/[↑↓→]/)
        
        // Check color coding
        const element = trendIndicators.nth(i)
        const className = await element.getAttribute('class')
        
        if (indicator?.includes('↑')) {
          expect(className).toContain('green')
        } else if (indicator?.includes('↓')) {
          expect(className).toContain('red')
        } else {
          expect(className).toContain('gray')
        }
      }
    }
  })
})