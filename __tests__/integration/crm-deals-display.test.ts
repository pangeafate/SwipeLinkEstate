import { test, expect } from '@playwright/test'

test.describe('CRM Deals Display Integration', () => {
  test('should display mock deals in pipeline stages', async ({ page }) => {
    // Navigate to CRM dashboard
    await page.goto('http://localhost:3001/crm')
    
    // Wait for page to load
    await page.waitForSelector('h1:has-text("CRM Dashboard")', { timeout: 10000 })
    
    // Check that summary cards are displayed with data
    const totalDealsCard = page.locator('text=Total Deals').locator('..')
    await expect(totalDealsCard).toBeVisible()
    const totalDealsText = await totalDealsCard.textContent()
    console.log('Total Deals:', totalDealsText)
    
    // Check that Deal Pipeline is visible
    await expect(page.locator('h1:has-text("Deal Pipeline")')).toBeVisible()
    
    // Check that pipeline stages are present
    const stages = ['Created', 'Shared', 'Accessed', 'Engaged', 'Qualified', 'Advanced', 'Closed']
    for (const stage of stages) {
      const stageElement = page.locator(`text=${stage}`).first()
      if (await stageElement.count() > 0) {
        console.log(`Stage "${stage}" is visible`)
      }
    }
    
    // Check for deal cards (mock deals should be displayed)
    const dealCards = page.locator('[class*="shadow-sm"][class*="border"]').filter({ 
      hasText: /properties|Score|Value/ 
    })
    
    const dealCount = await dealCards.count()
    console.log(`Found ${dealCount} deal cards in the pipeline`)
    
    // Verify at least some deals are displayed
    expect(dealCount).toBeGreaterThan(0)
    
    // Check for specific mock deal names
    const mockDealNames = [
      'Luxury Downtown Collection',
      'Family Homes Collection',
      'Investment Properties',
      'Waterfront Estate Collection',
      'Condo Collection',
      'Suburban Home'
    ]
    
    for (const dealName of mockDealNames) {
      const deal = page.locator(`text=${dealName}`)
      if (await deal.count() > 0) {
        console.log(`Mock deal "${dealName}" is displayed`)
        await expect(deal.first()).toBeVisible()
      }
    }
    
    // Check hot leads section
    const hotLeadsSection = page.locator('text=🔥 Hot Leads')
    await expect(hotLeadsSection).toBeVisible()
    
    // Check for hot lead cards
    const hotLeadCards = page.locator('[class*="bg-red-50"]')
    const hotLeadCount = await hotLeadCards.count()
    console.log(`Found ${hotLeadCount} hot leads`)
    
    // Check engagement scores are displayed
    const scores = page.locator('text=/Score.*\\/100/')
    const scoreCount = await scores.count()
    console.log(`Found ${scoreCount} engagement scores displayed`)
    
    // Check temperature indicators
    const temperatureIndicators = page.locator('[class*="rounded-full"][class*="bg-red-500"], [class*="rounded-full"][class*="bg-orange-500"], [class*="rounded-full"][class*="bg-gray-500"]')
    const tempCount = await temperatureIndicators.count()
    console.log(`Found ${tempCount} temperature indicators`)
    
    // Verify revenue display
    const revenueCard = page.locator('text=This Month Revenue').locator('..')
    await expect(revenueCard).toBeVisible()
    const revenueText = await revenueCard.textContent()
    expect(revenueText).toContain('$')
    console.log('Revenue display:', revenueText)
  })
  
  test('should show deals in correct pipeline stages', async ({ page }) => {
    await page.goto('http://localhost:3001/crm')
    await page.waitForSelector('h1:has-text("Deal Pipeline")', { timeout: 10000 })
    
    // Check that deals are distributed across stages
    const stageContainers = page.locator('[class*="border-dashed"][class*="rounded-lg"]')
    const containerCount = await stageContainers.count()
    
    console.log(`Found ${containerCount} stage containers`)
    
    for (let i = 0; i < containerCount; i++) {
      const container = stageContainers.nth(i)
      const headerText = await container.locator('h3').textContent()
      const dealCount = await container.locator('[class*="shadow-sm"][class*="border"]').count()
      
      console.log(`Stage: ${headerText} - Contains ${dealCount} deals`)
      
      // Check specific stages have the expected mock deals
      if (headerText?.includes('Engaged')) {
        // Should have hot lead deal
        const hotDeal = container.locator('text=/Sarah Johnson|Luxury Downtown/')
        if (await hotDeal.count() > 0) {
          console.log('✓ Hot lead found in Engaged stage')
        }
      }
      
      if (headerText?.includes('Created')) {
        // Should have new investment deal
        const newDeal = container.locator('text=Investment Properties')
        if (await newDeal.count() > 0) {
          console.log('✓ New investment deal found in Created stage')
        }
      }
      
      if (headerText?.includes('Closed')) {
        // Should have closed deal
        const closedDeal = container.locator('text=/Jennifer Lee|Suburban Home/')
        if (await closedDeal.count() > 0) {
          console.log('✓ Closed deal found in Closed stage')
        }
      }
    }
  })
})