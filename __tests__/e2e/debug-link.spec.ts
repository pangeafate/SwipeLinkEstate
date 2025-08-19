import { test, expect } from '@playwright/test'

test.describe('Debug Link Page', () => {
  test('debug swipe interface loading', async ({ page }) => {
    // Enable verbose console logging
    page.on('console', (msg) => {
      console.log(`[Browser ${msg.type()}]:`, msg.text())
    })
    
    page.on('pageerror', (error) => {
      console.log('[Page Error]:', error.message)
    })

    page.on('requestfailed', (request) => {
      console.log('[Request Failed]:', request.url(), request.failure()?.errorText)
    })

    const linkCode = 'awNmi9jF'
    
    console.log(`\n🔍 Debugging link: http://localhost:3000/link/${linkCode}`)
    console.log('================================================')
    
    await test.step('Navigate and wait', async () => {
      await page.goto(`/link/${linkCode}`)
      await page.waitForLoadState('networkidle')
      console.log('✅ Page loaded and network idle')
    })

    await test.step('Check page HTML structure', async () => {
      const html = await page.content()
      console.log('\n📄 HTML Content (first 500 chars):')
      console.log(html.substring(0, 500) + '...')
      
      const title = await page.title()
      console.log(`\n📑 Page title: "${title}"`)
    })

    await test.step('Check React rendering', async () => {
      // Check if React is rendering anything
      const reactRoot = await page.locator('#__next').count()
      console.log(`\n⚛️  React root elements: ${reactRoot}`)
      
      // Check for any divs (React usually renders divs)
      const divCount = await page.locator('div').count()
      console.log(`📦 Total div elements: ${divCount}`)
      
      // Check body content
      const bodyText = await page.textContent('body')
      console.log(`\n📝 Body text content (length: ${bodyText?.length}):`);
      console.log(bodyText)
    })

    await test.step('Check for specific elements', async () => {
      // Look for any signs of our components
      const swipeElements = await page.locator('[data-testid="tinder-card"]').count()
      const tinderCardClass = await page.locator('.tinder-card').count()
      const swipeInterfaceClass = await page.locator('.swipe-interface').count()
      const propertyCards = await page.locator('[data-testid="property-card"]').count()
      const undoButton = await page.locator('text=↶ Undo').count()
      const bucketCounters = await page.locator('text=❤️').count()
      const progressIndicator = await page.locator('text=1 of 4').count()
      
      console.log('\n🔍 Element counts:')
      console.log(`   - [data-testid="tinder-card"]: ${swipeElements}`)
      console.log(`   - .tinder-card class: ${tinderCardClass}`)
      console.log(`   - .swipe-interface class: ${swipeInterfaceClass}`)
      console.log(`   - Property cards: ${propertyCards}`)
      console.log(`   - Undo button: ${undoButton}`)
      console.log(`   - Bucket counters (❤️): ${bucketCounters}`)
      console.log(`   - Progress (1 of 4): ${progressIndicator}`)
      
      // Check if the swipe interface UI is present
      const hasSwipeUI = undoButton > 0 && bucketCounters > 0 && progressIndicator > 0
      console.log(`\n✅ SwipeInterface UI detected: ${hasSwipeUI}`)
    })

    await test.step('Check JavaScript execution', async () => {
      // Check if JavaScript is executing
      const result = await page.evaluate(() => {
        return {
          location: window.location.href,
          userAgent: navigator.userAgent,
          reactVersion: (window as any).React?.version || 'not found',
          hasLocalStorage: typeof localStorage !== 'undefined',
          consoleErrors: (window as any).__errors || []
        }
      })
      
      console.log('\n🔧 JavaScript environment:')
      console.log(JSON.stringify(result, null, 2))
    })

    await test.step('Wait and recheck', async () => {
      console.log('\n⏱️  Waiting 5 seconds for any delayed loading...')
      await page.waitForTimeout(5000)
      
      const finalSwipeCount = await page.locator('[data-testid="tinder-card"]').count()
      const finalBodyText = await page.textContent('body')
      
      console.log(`\n📊 Final state:`)
      console.log(`   - Swipe cards: ${finalSwipeCount}`)
      console.log(`   - Body text length: ${finalBodyText?.length}`)
      console.log(`   - Page appears functional: ${finalBodyText && finalBodyText.length > 100}`)
    })
  })
})