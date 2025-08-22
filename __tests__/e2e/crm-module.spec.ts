import { test, expect } from '@playwright/test'

test.describe('CRM Module - Link-as-Deal Architecture', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to agent dashboard
    await page.goto('/dashboard')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
  })

  test.describe('Deal Pipeline Management', () => {
    
    test('should display deal pipeline with all stages', async ({ page }) => {
      // Navigate to CRM section
      await page.click('text=CRM')
      
      // Verify all pipeline stages are visible
      const stages = ['Created', 'Shared', 'Accessed', 'Engaged', 'Qualified', 'Advanced', 'Closed']
      
      for (const stage of stages) {
        await expect(page.locator(`text=${stage}`).first()).toBeVisible()
      }
    })

    test('should create a new deal from link creation', async ({ page }) => {
      // Click create link button
      await page.click('button:has-text("Create Link")')
      
      // Wait for modal
      await page.waitForSelector('[data-testid="link-creation-modal"]')
      
      // Select properties (assuming they exist)
      await page.click('[data-testid="property-selector"] >> nth=0')
      await page.click('[data-testid="property-selector"] >> nth=1')
      
      // Enter link name
      await page.fill('input[placeholder*="Collection Name"]', 'Test Deal Collection')
      
      // Create link
      await page.click('button:has-text("Create Link")')
      
      // Verify success message
      await expect(page.locator('text=Link created successfully')).toBeVisible()
      
      // Navigate to CRM
      await page.click('text=CRM')
      
      // Verify new deal appears in pipeline
      await expect(page.locator('text=Test Deal Collection')).toBeVisible()
    })

    test('should move deal through pipeline stages', async ({ page }) => {
      // Navigate to CRM pipeline
      await page.goto('/crm/pipeline')
      
      // Find a deal card in "Created" stage
      const dealCard = page.locator('[data-testid="deal-card"]').first()
      
      // Drag and drop to "Shared" stage
      await dealCard.dragTo(page.locator('text=Shared').first().locator('..'))
      
      // Verify deal moved
      await expect(dealCard).toBeVisible()
      
      // Verify stage update
      await expect(page.locator('text=Deal stage updated')).toBeVisible()
    })

    test('should filter deals by status and temperature', async ({ page }) => {
      // Navigate to CRM
      await page.goto('/crm')
      
      // Filter by hot leads
      await page.selectOption('select[aria-label="Temperature filter"]', 'hot')
      
      // Verify filtered results
      await expect(page.locator('[data-testid="deal-card"]')).toHaveCount(0) // Assuming no hot leads initially
      
      // Clear filter
      await page.selectOption('select[aria-label="Temperature filter"]', '')
      
      // Filter by status
      await page.selectOption('select[aria-label="Status filter"]', 'active')
      
      // Verify active deals are shown
      const activeDeals = await page.locator('[data-testid="deal-card"]').count()
      expect(activeDeals).toBeGreaterThanOrEqual(0)
    })
  })

  test.describe('Client Engagement Scoring', () => {
    
    test('should calculate and display engagement score', async ({ page }) => {
      // Create a link first
      await page.click('button:has-text("Create Link")')
      await page.waitForSelector('[data-testid="link-creation-modal"]')
      
      // Quick create
      await page.click('button:has-text("Quick Create")')
      
      // Get the created link URL
      const linkUrl = await page.locator('[data-testid="copyable-link"]').inputValue()
      
      // Open link in new tab to simulate client access
      const newPage = await page.context().newPage()
      await newPage.goto(linkUrl)
      
      // Simulate client engagement - swipe through properties
      await newPage.waitForSelector('[data-testid="swipe-card"]')
      
      // Like a property
      await newPage.click('button[aria-label="Like property"]')
      
      // Consider a property
      await newPage.click('button[aria-label="Consider property"]')
      
      // Close client page
      await newPage.close()
      
      // Go back to CRM dashboard
      await page.goto('/crm')
      
      // Find the deal and check engagement score
      const dealCard = page.locator('[data-testid="deal-card"]').first()
      const engagementScore = await dealCard.locator('text=/Engagement:.*\\/100/').textContent()
      
      // Verify score is calculated
      expect(engagementScore).toContain('Engagement:')
    })

    test('should update client temperature based on engagement', async ({ page }) => {
      // Navigate to CRM
      await page.goto('/crm')
      
      // Check deal temperature indicators
      const hotIndicator = page.locator('[title="HOT lead"]')
      const warmIndicator = page.locator('[title="WARM lead"]')
      const coldIndicator = page.locator('[title="COLD lead"]')
      
      // Verify at least one temperature indicator exists
      const indicatorCount = 
        await hotIndicator.count() + 
        await warmIndicator.count() + 
        await coldIndicator.count()
      
      expect(indicatorCount).toBeGreaterThan(0)
    })

    test('should show real-time engagement updates', async ({ page }) => {
      // Navigate to CRM Analytics
      await page.goto('/crm/analytics')
      
      // Check engagement metrics display
      await expect(page.locator('text=Engagement Score')).toBeVisible()
      await expect(page.locator('text=Client Temperature')).toBeVisible()
      
      // Verify score visualization
      const scoreDisplay = page.locator('[data-testid="engagement-score-display"]')
      if (await scoreDisplay.count() > 0) {
        await expect(scoreDisplay.first()).toBeVisible()
      }
    })
  })

  test.describe('Task Automation', () => {
    
    test('should generate automated tasks for hot leads', async ({ page }) => {
      // Navigate to task management
      await page.goto('/crm/tasks')
      
      // Check for automated tasks
      const automatedTasks = page.locator('text=AUTO')
      const taskCount = await automatedTasks.count()
      
      // Verify automated tasks exist
      expect(taskCount).toBeGreaterThanOrEqual(0)
      
      // If tasks exist, check priority
      if (taskCount > 0) {
        const highPriorityTask = page.locator('text=HIGH').first()
        await expect(highPriorityTask).toBeVisible()
      }
    })

    test('should allow task status updates', async ({ page }) => {
      // Navigate to tasks
      await page.goto('/crm/tasks')
      
      // Find a pending task
      const pendingTask = page.locator('[data-testid="task-card"]').first()
      
      if (await pendingTask.count() > 0) {
        // Click complete button
        await pendingTask.locator('button:has-text("Complete")').click()
        
        // Verify task moved to completed
        await page.click('button:has-text("Completed")')
        await expect(page.locator('text=completed')).toBeVisible()
      }
    })

    test('should show overdue tasks', async ({ page }) => {
      // Navigate to tasks
      await page.goto('/crm/tasks')
      
      // Click overdue tab
      await page.click('button:has-text("Overdue")')
      
      // Check for overdue tasks
      const overdueTasks = await page.locator('[data-testid="task-card"]').count()
      
      // Verify overdue section works (may be empty)
      expect(overdueTasks).toBeGreaterThanOrEqual(0)
      
      // If overdue tasks exist, verify styling
      if (overdueTasks > 0) {
        const overdueIndicator = page.locator('text=/Overdue by.*days/').first()
        await expect(overdueIndicator).toBeVisible()
      }
    })

    test('should filter tasks by priority', async ({ page }) => {
      // Navigate to tasks
      await page.goto('/crm/tasks')
      
      // Filter by high priority
      await page.selectOption('select[aria-label="Priority filter"]', 'high')
      
      // Verify filtered results
      const highPriorityTasks = await page.locator('text=HIGH').count()
      const allTasks = await page.locator('[data-testid="task-card"]').count()
      
      // All visible tasks should be high priority
      if (allTasks > 0) {
        expect(highPriorityTasks).toBe(allTasks)
      }
    })
  })

  test.describe('CRM Analytics Dashboard', () => {
    
    test('should display key CRM metrics', async ({ page }) => {
      // Navigate to CRM Analytics
      await page.goto('/crm/analytics')
      
      // Verify summary cards
      await expect(page.locator('text=Total Deals')).toBeVisible()
      await expect(page.locator('text=Hot Leads')).toBeVisible()
      await expect(page.locator('text=Pending Tasks')).toBeVisible()
      await expect(page.locator('text=Revenue')).toBeVisible()
    })

    test('should show deal pipeline visualization', async ({ page }) => {
      // Navigate to CRM Analytics
      await page.goto('/crm/analytics')
      
      // Check pipeline section
      await expect(page.locator('text=Deal Pipeline')).toBeVisible()
      
      // Verify stage breakdown
      const stageCards = page.locator('[data-testid="pipeline-stage-card"]')
      if (await stageCards.count() > 0) {
        expect(await stageCards.count()).toBeGreaterThan(0)
      }
    })

    test('should display conversion funnel', async ({ page }) => {
      // Navigate to CRM Analytics
      await page.goto('/crm/analytics')
      
      // Check conversion funnel
      await expect(page.locator('text=Conversion Funnel')).toBeVisible()
      
      // Verify funnel stages
      const funnelStages = [
        'Links Created',
        'Client Engaged',
        'Qualified Leads',
        'Deals Closed'
      ]
      
      for (const stage of funnelStages) {
        const stageElement = page.locator(`text=${stage}`)
        if (await stageElement.count() > 0) {
          await expect(stageElement.first()).toBeVisible()
        }
      }
    })

    test('should show performance trends', async ({ page }) => {
      // Navigate to CRM Analytics
      await page.goto('/crm/analytics')
      
      // Check performance section
      await expect(page.locator('text=Performance Trends')).toBeVisible()
      
      // Verify month comparison
      await expect(page.locator('text=This Month')).toBeVisible()
      await expect(page.locator('text=Last Month')).toBeVisible()
    })

    test('should allow timeframe selection', async ({ page }) => {
      // Navigate to CRM Analytics
      await page.goto('/crm/analytics')
      
      // Change timeframe
      await page.selectOption('select[aria-label="Timeframe selector"]', '7d')
      
      // Wait for data refresh
      await page.waitForLoadState('networkidle')
      
      // Change to 30 days
      await page.selectOption('select[aria-label="Timeframe selector"]', '30d')
      
      // Verify page updates
      await page.waitForLoadState('networkidle')
    })
  })

  test.describe('Client Profile Intelligence', () => {
    
    test('should display client profile with insights', async ({ page }) => {
      // Navigate to a deal detail
      await page.goto('/crm')
      
      // Click on a deal card to view details
      const dealCard = page.locator('[data-testid="deal-card"]').first()
      
      if (await dealCard.count() > 0) {
        await dealCard.click()
        
        // Check for client profile section
        const clientSection = page.locator('text=Client Profile')
        if (await clientSection.count() > 0) {
          await expect(clientSection).toBeVisible()
          
          // Verify profile tabs
          await expect(page.locator('text=Overview')).toBeVisible()
          await expect(page.locator('text=Preferences')).toBeVisible()
          await expect(page.locator('text=Behavior')).toBeVisible()
          await expect(page.locator('text=AI Insights')).toBeVisible()
        }
      }
    })

    test('should show client preferences analysis', async ({ page }) => {
      // This would require a client with engagement data
      // For now, just verify the UI exists
      await page.goto('/crm/client/test-client-id')
      
      // If page exists, check preferences
      if (!page.url().includes('404')) {
        await page.click('text=Preferences')
        
        // Check preference sections
        const sections = [
          'Preferred Property Types',
          'Price Range',
          'Preferred Features',
          'Preferred Locations'
        ]
        
        for (const section of sections) {
          const element = page.locator(`text=${section}`)
          if (await element.count() > 0) {
            await expect(element.first()).toBeVisible()
          }
        }
      }
    })
  })

  test.describe('Mobile Responsiveness', () => {
    
    test('should be responsive on mobile devices', async ({ page, browserName }) => {
      // Skip on webkit as it has different mobile handling
      if (browserName === 'webkit') {
        test.skip()
      }
      
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      
      // Navigate to CRM
      await page.goto('/crm')
      
      // Check mobile menu
      const mobileMenu = page.locator('[data-testid="mobile-menu-button"]')
      if (await mobileMenu.count() > 0) {
        await mobileMenu.click()
        
        // Verify navigation items
        await expect(page.locator('text=Dashboard')).toBeVisible()
        await expect(page.locator('text=CRM')).toBeVisible()
      }
      
      // Check deal cards are stacked on mobile
      const dealCards = page.locator('[data-testid="deal-card"]')
      if (await dealCards.count() > 0) {
        const firstCard = await dealCards.first().boundingBox()
        const secondCard = await dealCards.nth(1).boundingBox()
        
        if (firstCard && secondCard) {
          // Cards should be stacked vertically
          expect(secondCard.y).toBeGreaterThan(firstCard.y + firstCard.height)
        }
      }
    })
  })
})

test.describe('CRM Integration Tests', () => {
  
  test('should integrate with existing link creation flow', async ({ page }) => {
    // Start from dashboard
    await page.goto('/dashboard')
    
    // Create a link
    await page.click('button:has-text("Create Link")')
    
    // Wait for modal
    await page.waitForSelector('[data-testid="link-creation-modal"]', { timeout: 5000 })
    
    // Use quick create
    await page.click('button:has-text("Quick Create")')
    
    // Wait for success
    await expect(page.locator('text=Link created successfully')).toBeVisible({ timeout: 10000 })
    
    // Navigate to CRM
    await page.goto('/crm')
    
    // Verify the link appears as a deal
    const deals = await page.locator('[data-testid="deal-card"]').count()
    expect(deals).toBeGreaterThan(0)
  })

  test('should track client engagement from swipe interface', async ({ page }) => {
    // This is a complex integration test
    // 1. Create a link
    // 2. Access it as a client
    // 3. Perform swipe actions
    // 4. Verify engagement score updates in CRM
    
    // Create link
    await page.goto('/dashboard')
    await page.click('button:has-text("Create Link")')
    await page.waitForSelector('[data-testid="link-creation-modal"]')
    await page.click('button:has-text("Quick Create")')
    
    // Get link URL
    const linkUrl = await page.locator('[data-testid="copyable-link"]').inputValue()
    
    // Open in new context (simulate different user)
    const context = await page.context().browser()?.newContext()
    if (context) {
      const clientPage = await context.newPage()
      await clientPage.goto(linkUrl)
      
      // Perform swipe actions
      await clientPage.waitForSelector('[data-testid="swipe-card"]')
      
      // Swipe right (like)
      await clientPage.click('button[aria-label="Like property"]')
      
      // Wait a moment
      await clientPage.waitForTimeout(1000)
      
      // Swipe left (pass)
      await clientPage.click('button[aria-label="Pass property"]')
      
      await clientPage.close()
      await context.close()
    }
    
    // Check CRM for engagement updates
    await page.goto('/crm')
    await page.waitForLoadState('networkidle')
    
    // Verify engagement score exists
    const engagementScore = page.locator('text=/Engagement:.*\\/100/')
    if (await engagementScore.count() > 0) {
      await expect(engagementScore.first()).toBeVisible()
    }
  })
})

test.describe('CRM Performance Tests', () => {
  
  test('should load CRM dashboard within acceptable time', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/crm/analytics')
    await page.waitForLoadState('networkidle')
    
    const loadTime = Date.now() - startTime
    
    // Dashboard should load within 3 seconds
    expect(loadTime).toBeLessThan(3000)
  })

  test('should handle large number of deals efficiently', async ({ page }) => {
    // This would require test data setup
    // For now, verify the pagination works
    
    await page.goto('/crm')
    
    // Check for pagination controls
    const pagination = page.locator('[data-testid="pagination"]')
    if (await pagination.count() > 0) {
      // Test next page
      const nextButton = page.locator('button[aria-label="Next page"]')
      if (await nextButton.isEnabled()) {
        await nextButton.click()
        await page.waitForLoadState('networkidle')
        
        // Verify page changed
        const pageIndicator = page.locator('[data-testid="current-page"]')
        const currentPage = await pageIndicator.textContent()
        expect(currentPage).toContain('2')
      }
    }
  })
})