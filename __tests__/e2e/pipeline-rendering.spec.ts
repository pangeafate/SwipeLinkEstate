import { test, expect } from '@playwright/test'

test.describe('Pipeline Stage Rendering', () => {
  test('should render pipeline stages without visual artifacts', async ({ page }) => {
    // Navigate to CRM page
    await page.goto('http://localhost:3002/crm')
    
    // Wait for pipeline to load
    await page.waitForSelector('.flex-shrink-0', { timeout: 10000 })
    
    // Get all pipeline stages
    const stages = await page.locator('.flex-shrink-0').all()
    console.log(`Found ${stages.length} pipeline stages`)
    
    // Check each stage for consistent rendering
    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i]
      
      // Check background color consistency
      const bgColor = await stage.evaluate(el => 
        window.getComputedStyle(el).backgroundColor
      )
      console.log(`Stage ${i} background: ${bgColor}`)
      
      // Check z-index
      const zIndex = await stage.evaluate(el => 
        window.getComputedStyle(el).zIndex
      )
      console.log(`Stage ${i} z-index: ${zIndex}`)
      
      // Verify z-index is properly set
      expect(zIndex).not.toBe('auto')
      expect(parseInt(zIndex)).toBeGreaterThanOrEqual(2)
    }
    
    // Check specifically for the Engaged stage
    const engagedStage = await page.locator('text="Engaged"').first()
    if (await engagedStage.isVisible()) {
      const engagedContainer = await engagedStage.locator('xpath=ancestor::div[contains(@class, "flex-shrink-0")]').first()
      
      // Check that the orange border is uninterrupted
      const borderStyle = await engagedContainer.locator('[data-testid="pipeline-stage-header"]').evaluate(el => {
        const styles = window.getComputedStyle(el)
        return {
          borderBottomWidth: styles.borderBottomWidth,
          borderBottomColor: styles.borderBottomColor,
          borderBottomStyle: styles.borderBottomStyle
        }
      })
      
      console.log('Engaged stage border:', borderStyle)
      
      // The border should be solid and visible
      expect(borderStyle.borderBottomStyle).toBe('solid')
      expect(borderStyle.borderBottomWidth).toBe('2px')
    }
    
    // Take screenshot for visual verification
    await page.screenshot({ 
      path: 'pipeline-rendering-test.png',
      fullPage: true 
    })
    
    console.log('Screenshot saved as pipeline-rendering-test.png')
  })
  
  test('should not have overlapping elements in Engaged stage', async ({ page }) => {
    await page.goto('http://localhost:3002/crm')
    await page.waitForSelector('.flex-shrink-0', { timeout: 10000 })
    
    // Find the Engaged stage
    const engagedHeader = await page.locator('h3:has-text("Engaged")').first()
    
    if (await engagedHeader.isVisible()) {
      const boundingBox = await engagedHeader.boundingBox()
      
      if (boundingBox) {
        // Check if any other elements overlap with the Engaged stage header
        const overlappingElements = await page.evaluate(({ x, y, width, height }) => {
          const elements = document.elementsFromPoint(x + width / 2, y + height / 2)
          return elements.map(el => ({
            tagName: el.tagName,
            className: el.className,
            id: el.id
          }))
        }, boundingBox)
        
        console.log('Elements at Engaged stage position:', overlappingElements)
        
        // There should not be duplicate stage headers at the same position
        const stageHeaders = overlappingElements.filter(el => 
          el.className && el.className.includes('stage-header')
        )
        
        expect(stageHeaders.length).toBeLessThanOrEqual(1)
      }
    }
  })
})