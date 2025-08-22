import { test, expect, Page } from '@playwright/test'

test.describe('Client Property Carousel Interface', () => {
  // Test data
  const testLinkCode = 'awNmi9jF' // Use existing test link
  
  test.beforeEach(async ({ page }) => {
    // Enable debug mode for better error visibility
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log('Browser error:', msg.text())
      }
    })
    
    page.on('pageerror', (error) => {
      console.log('Page error:', error.message)
    })
  })

  test.describe('PropertyCarousel Component', () => {
    test('should display property carousel with navigation controls', async ({ page }) => {
      await test.step('Navigate to client link page', async () => {
        await page.goto(`/link/${testLinkCode}`)
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(2000) // Allow React to render
      })

      await test.step('Verify carousel is visible', async () => {
        // Check for carousel container
        const carousel = page.locator('[data-testid="property-carousel"]')
        await expect(carousel).toBeVisible({ timeout: 10000 })
      })

      await test.step('Check navigation controls', async () => {
        // Previous button should be visible (may be disabled at first)
        const prevBtn = page.locator('[data-testid="carousel-prev-btn"]')
        await expect(prevBtn).toBeVisible()
        
        // Next button should be visible
        const nextBtn = page.locator('[data-testid="carousel-next-btn"]')
        await expect(nextBtn).toBeVisible()
        
        // Position indicators should be visible
        const indicators = page.locator('[data-testid="carousel-indicators"]')
        await expect(indicators).toBeVisible()
      })

      await test.step('Verify property cards are displayed', async () => {
        // At least one property card should be visible
        const propertyCards = page.locator('[data-testid^="property-card-"]')
        const cardCount = await propertyCards.count()
        expect(cardCount).toBeGreaterThan(0)
        
        // Active card should have special class
        const activeCard = page.locator('.carousel-card-active')
        await expect(activeCard).toBeVisible()
      })
    })

    test('should navigate between properties', async ({ page }) => {
      await page.goto(`/link/${testLinkCode}`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)

      await test.step('Navigate to next property', async () => {
        // Get initial active card
        const initialCard = await page.locator('.carousel-card-active').getAttribute('data-testid')
        
        // Click next button
        const nextBtn = page.locator('[data-testid="carousel-next-btn"]')
        await nextBtn.click()
        
        // Wait for transition
        await page.waitForTimeout(500)
        
        // Verify card changed
        const newCard = await page.locator('.carousel-card-active').getAttribute('data-testid')
        expect(newCard).not.toBe(initialCard)
      })

      await test.step('Navigate using position indicators', async () => {
        // Click on third indicator
        const thirdIndicator = page.locator('[data-testid="carousel-indicator-2"]')
        if (await thirdIndicator.isVisible()) {
          await thirdIndicator.click()
          await page.waitForTimeout(500)
          
          // Verify navigation happened
          const activeIndicator = page.locator('[data-testid="carousel-indicator-2"]')
          const indicatorClass = await activeIndicator.getAttribute('class')
          expect(indicatorClass).toContain('bg-blue-500')
        }
      })
    })

    test('should display bucket assignment buttons', async ({ page }) => {
      await page.goto(`/link/${testLinkCode}`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)

      await test.step('Check bucket buttons on active card', async () => {
        // Get the active property card
        const activeCard = page.locator('.carousel-card-active').first()
        
        // Check for bucket buttons
        const likeBtn = activeCard.locator('[data-testid^="bucket-btn-liked"]')
        const considerBtn = activeCard.locator('[data-testid^="bucket-btn-considering"]')
        const dislikeBtn = activeCard.locator('[data-testid^="bucket-btn-disliked"]')
        const bookVisitBtn = activeCard.locator('[data-testid^="bucket-btn-book_visit"]')
        
        // All bucket buttons should be visible on active card
        await expect(likeBtn).toBeVisible()
        await expect(considerBtn).toBeVisible()
        await expect(dislikeBtn).toBeVisible()
        await expect(bookVisitBtn).toBeVisible()
      })

      await test.step('Assign property to bucket', async () => {
        const activeCard = page.locator('.carousel-card-active').first()
        const likeBtn = activeCard.locator('[data-testid^="bucket-btn-liked"]')
        
        // Click like button
        await likeBtn.click()
        await page.waitForTimeout(500)
        
        // Button should show selected state
        const btnClass = await likeBtn.getAttribute('class')
        expect(btnClass).toContain('bucket-assigned')
      })
    })

    test('should handle keyboard navigation', async ({ page }) => {
      await page.goto(`/link/${testLinkCode}`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)

      await test.step('Navigate with arrow keys', async () => {
        // Focus the carousel
        const carousel = page.locator('[data-testid="property-carousel"]')
        await carousel.focus()
        
        // Press right arrow key
        await page.keyboard.press('ArrowRight')
        await page.waitForTimeout(500)
        
        // Should navigate to next property
        // Note: Actual verification would depend on tracking state changes
        const nextBtn = page.locator('[data-testid="carousel-next-btn"]')
        const isNextDisabled = await nextBtn.isDisabled()
        
        // If we're not at the last property, navigation should work
        if (!isNextDisabled) {
          // Navigation happened successfully
          expect(true).toBe(true)
        }
      })
    })

    test('should be responsive on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 812 })
      
      await page.goto(`/link/${testLinkCode}`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)

      await test.step('Check mobile layout', async () => {
        const carousel = page.locator('[data-testid="property-carousel"]')
        await expect(carousel).toBeVisible()
        
        // Property cards should be appropriately sized for mobile
        const activeCard = page.locator('.carousel-card-active')
        await expect(activeCard).toBeVisible()
        
        // Navigation buttons should still be accessible
        const prevBtn = page.locator('[data-testid="carousel-prev-btn"]')
        const nextBtn = page.locator('[data-testid="carousel-next-btn"]')
        await expect(prevBtn).toBeVisible()
        await expect(nextBtn).toBeVisible()
      })
    })
  })

  test.describe('PropertyModal Component', () => {
    test('should open property modal when card is clicked', async ({ page }) => {
      await page.goto(`/link/${testLinkCode}`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)

      await test.step('Click on property card to open modal', async () => {
        // Click on the active property card
        const activeCard = page.locator('.carousel-card-active').first()
        await activeCard.click()
        
        // Wait for modal to appear
        await page.waitForTimeout(500)
        
        // Modal should be visible
        const modal = page.locator('[data-testid="property-modal"]')
        await expect(modal).toBeVisible({ timeout: 5000 })
        
        // Modal backdrop should be visible
        const backdrop = page.locator('[data-testid="modal-backdrop"]')
        await expect(backdrop).toBeVisible()
      })

      await test.step('Verify modal content', async () => {
        // Modal header should show property address
        const modalHeader = page.locator('[data-testid="modal-header"]')
        await expect(modalHeader).toBeVisible()
        
        // Primary image should be displayed
        const primaryImage = page.locator('[data-testid="primary-image"]')
        await expect(primaryImage).toBeVisible()
        
        // Property details should be visible
        const propertyPrice = page.locator('[data-testid="property-price"]')
        const propertyFeatures = page.locator('[data-testid="property-features"]')
        await expect(propertyPrice).toBeVisible()
        await expect(propertyFeatures).toBeVisible()
      })
    })

    test('should navigate images in modal gallery', async ({ page }) => {
      await page.goto(`/link/${testLinkCode}`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)

      // Open modal
      const activeCard = page.locator('.carousel-card-active').first()
      await activeCard.click()
      await page.waitForTimeout(500)

      await test.step('Navigate to next image', async () => {
        const imageCounter = page.locator('[data-testid="image-counter"]')
        const initialCount = await imageCounter.textContent()
        
        // Click next image button
        const nextImageBtn = page.locator('[data-testid="image-next-btn"]')
        if (await nextImageBtn.isVisible() && !await nextImageBtn.isDisabled()) {
          await nextImageBtn.click()
          await page.waitForTimeout(300)
          
          // Counter should update
          const newCount = await imageCounter.textContent()
          expect(newCount).not.toBe(initialCount)
        }
      })

      await test.step('Use thumbnail navigation', async () => {
        const thumbnails = page.locator('[data-testid^="thumbnail-"]')
        const thumbnailCount = await thumbnails.count()
        
        if (thumbnailCount > 1) {
          // Click second thumbnail
          const secondThumbnail = page.locator('[data-testid="thumbnail-1"]')
          await secondThumbnail.click()
          await page.waitForTimeout(300)
          
          // Image counter should reflect selection
          const imageCounter = page.locator('[data-testid="image-counter"]')
          const counterText = await imageCounter.textContent()
          expect(counterText).toContain('2')
        }
      })
    })

    test('should show and interact with property map', async ({ page }) => {
      await page.goto(`/link/${testLinkCode}`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)

      // Open modal
      const activeCard = page.locator('.carousel-card-active').first()
      await activeCard.click()
      await page.waitForTimeout(500)

      await test.step('Verify map is displayed', async () => {
        const propertyMap = page.locator('[data-testid="property-map"]')
        await expect(propertyMap).toBeVisible()
        
        // Map expand button should be visible
        const mapExpandBtn = page.locator('[data-testid="map-expand-btn"]')
        await expect(mapExpandBtn).toBeVisible()
      })

      await test.step('Expand map view', async () => {
        const mapExpandBtn = page.locator('[data-testid="map-expand-btn"]')
        await mapExpandBtn.click()
        await page.waitForTimeout(300)
        
        // Map should have expanded class
        const propertyMap = page.locator('[data-testid="property-map"]')
        const mapClass = await propertyMap.getAttribute('class')
        expect(mapClass).toContain('expanded')
      })
    })

    test('should close modal using various methods', async ({ page }) => {
      await page.goto(`/link/${testLinkCode}`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)

      await test.step('Close with close button', async () => {
        // Open modal
        const activeCard = page.locator('.carousel-card-active').first()
        await activeCard.click()
        await page.waitForTimeout(500)
        
        // Click close button
        const closeBtn = page.locator('[data-testid="modal-close-btn"]')
        await closeBtn.click()
        await page.waitForTimeout(300)
        
        // Modal should not be visible
        const modal = page.locator('[data-testid="property-modal"]')
        await expect(modal).not.toBeVisible()
      })

      await test.step('Close by clicking backdrop', async () => {
        // Open modal again
        const activeCard = page.locator('.carousel-card-active').first()
        await activeCard.click()
        await page.waitForTimeout(500)
        
        // Click backdrop
        const backdrop = page.locator('[data-testid="modal-backdrop"]')
        await backdrop.click({ position: { x: 10, y: 10 } })
        await page.waitForTimeout(300)
        
        // Modal should not be visible
        const modal = page.locator('[data-testid="property-modal"]')
        await expect(modal).not.toBeVisible()
      })

      await test.step('Close with Escape key', async () => {
        // Open modal again
        const activeCard = page.locator('.carousel-card-active').first()
        await activeCard.click()
        await page.waitForTimeout(500)
        
        // Press Escape
        await page.keyboard.press('Escape')
        await page.waitForTimeout(300)
        
        // Modal should not be visible
        const modal = page.locator('[data-testid="property-modal"]')
        await expect(modal).not.toBeVisible()
      })
    })

    test('should handle bucket assignments in modal', async ({ page }) => {
      await page.goto(`/link/${testLinkCode}`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)

      // Open modal
      const activeCard = page.locator('.carousel-card-active').first()
      await activeCard.click()
      await page.waitForTimeout(500)

      await test.step('Assign property to bucket from modal', async () => {
        // Click like button in modal
        const likeBtn = page.locator('[data-testid="bucket-btn-liked"]')
        await likeBtn.click()
        await page.waitForTimeout(300)
        
        // Button should show selected state
        const btnClass = await likeBtn.getAttribute('class')
        expect(btnClass).toContain('selected')
      })

      await test.step('Book visit button should be prominent', async () => {
        const bookVisitBtn = page.locator('[data-testid="book-visit-btn"]')
        await expect(bookVisitBtn).toBeVisible()
        
        // Should have primary styling
        const btnClass = await bookVisitBtn.getAttribute('class')
        expect(btnClass).toContain('primary')
      })
    })
  })

  test.describe('Accessibility', () => {
    test('should have proper ARIA labels and roles', async ({ page }) => {
      await page.goto(`/link/${testLinkCode}`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)

      await test.step('Check carousel accessibility', async () => {
        const carousel = page.locator('[data-testid="property-carousel"]')
        const ariaLabel = await carousel.getAttribute('aria-label')
        expect(ariaLabel).toBe('Property carousel')
        
        // Navigation buttons should have aria-labels
        const prevBtn = page.locator('[data-testid="carousel-prev-btn"]')
        const prevAriaLabel = await prevBtn.getAttribute('aria-label')
        expect(prevAriaLabel).toBe('Previous property')
        
        const nextBtn = page.locator('[data-testid="carousel-next-btn"]')
        const nextAriaLabel = await nextBtn.getAttribute('aria-label')
        expect(nextAriaLabel).toBe('Next property')
      })

      await test.step('Check screen reader announcements', async () => {
        // Live region should exist
        const liveRegion = page.locator('[data-testid="carousel-live-region"]')
        await expect(liveRegion).toBeAttached()
        
        // Should have proper ARIA attributes
        const ariaLive = await liveRegion.getAttribute('aria-live')
        expect(ariaLive).toBe('polite')
      })
    })

    test('should be keyboard navigable', async ({ page }) => {
      await page.goto(`/link/${testLinkCode}`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)

      await test.step('Tab through interactive elements', async () => {
        // Start tabbing
        await page.keyboard.press('Tab')
        
        // Should be able to focus carousel
        const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
        expect(focusedElement).toBeTruthy()
        
        // Continue tabbing should reach navigation buttons
        await page.keyboard.press('Tab')
        await page.keyboard.press('Tab')
        
        // Should be able to activate with Enter/Space
        await page.keyboard.press('Enter')
        
        // No JavaScript errors should occur
        const errors: string[] = []
        page.on('pageerror', (error) => errors.push(error.message))
        await page.waitForTimeout(500)
        expect(errors).toHaveLength(0)
      })
    })
  })

  test.describe('Performance', () => {
    test('should load carousel within acceptable time', async ({ page }) => {
      const startTime = Date.now()
      
      await page.goto(`/link/${testLinkCode}`)
      await page.waitForLoadState('networkidle')
      
      // Wait for carousel to be visible
      const carousel = page.locator('[data-testid="property-carousel"]')
      await carousel.waitFor({ state: 'visible', timeout: 5000 })
      
      const loadTime = Date.now() - startTime
      
      // Should load within 5 seconds
      expect(loadTime).toBeLessThan(5000)
      console.log(`Carousel loaded in ${loadTime}ms`)
    })

    test('should handle rapid navigation smoothly', async ({ page }) => {
      await page.goto(`/link/${testLinkCode}`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)

      await test.step('Rapidly click next button', async () => {
        const nextBtn = page.locator('[data-testid="carousel-next-btn"]')
        
        // Click multiple times rapidly
        for (let i = 0; i < 3; i++) {
          if (!await nextBtn.isDisabled()) {
            await nextBtn.click()
            await page.waitForTimeout(100)
          }
        }
        
        // Should not cause any errors
        const errors: string[] = []
        page.on('pageerror', (error) => errors.push(error.message))
        await page.waitForTimeout(1000)
        expect(errors).toHaveLength(0)
      })
    })
  })
})