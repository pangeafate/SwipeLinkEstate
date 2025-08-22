import { Page, Locator, expect } from '@playwright/test'

export interface PropertyData {
  id: string
  address: string
  price: string
  bedrooms: number
  bathrooms: number
}

export interface BucketCounts {
  liked: number
  considering: number
  disliked: number
  bookVisit: number
}

export class ClientLinkPage {
  readonly page: Page
  
  // Main page elements
  readonly carousel: Locator
  readonly loadingView: Locator
  readonly errorView: Locator
  readonly emptyView: Locator
  readonly completionView: Locator
  
  // Carousel navigation
  readonly prevButton: Locator
  readonly nextButton: Locator
  readonly indicators: Locator
  readonly liveRegion: Locator
  
  // Property cards
  readonly activeCard: Locator
  readonly previousCard: Locator
  readonly nextCard: Locator
  
  // Bucket buttons
  readonly likedButton: Locator
  readonly consideringButton: Locator
  readonly dislikedButton: Locator
  readonly bookVisitButton: Locator
  
  // Modal elements
  readonly modalBackdrop: Locator
  readonly propertyModal: Locator
  readonly modalCloseButton: Locator
  readonly primaryImage: Locator
  readonly imageGallery: Locator
  readonly propertyMap: Locator
  
  // Advanced features that should NOT exist
  readonly collectionOverview: Locator
  readonly bucketManager: Locator
  readonly visitBookingModal: Locator
  readonly bucketTabs: Locator
  readonly bucketGrid: Locator

  constructor(page: Page) {
    this.page = page
    
    // Main page elements
    this.carousel = page.locator('[data-testid="property-carousel"]')
    this.loadingView = page.locator('[data-testid="loading-view"]')
    this.errorView = page.locator('[data-testid="error-view"]')
    this.emptyView = page.locator('[data-testid="empty-view"]')
    this.completionView = page.locator('[data-testid="completion-view"]')
    
    // Carousel navigation
    this.prevButton = page.locator('[data-testid="carousel-prev-btn"]')
    this.nextButton = page.locator('[data-testid="carousel-next-btn"]')
    this.indicators = page.locator('[data-testid="carousel-indicators"]')
    this.liveRegion = page.locator('[data-testid="carousel-live-region"]')
    
    // Property cards
    this.activeCard = page.locator('.carousel-card-active')
    this.previousCard = page.locator('.carousel-card-previous')
    this.nextCard = page.locator('.carousel-card-next')
    
    // Bucket buttons (on active card)
    this.likedButton = this.activeCard.locator('[data-testid^="bucket-btn-liked"]')
    this.consideringButton = this.activeCard.locator('[data-testid^="bucket-btn-considering"]')
    this.dislikedButton = this.activeCard.locator('[data-testid^="bucket-btn-disliked"]')
    this.bookVisitButton = this.activeCard.locator('[data-testid^="bucket-btn-book_visit"]')
    
    // Modal elements
    this.modalBackdrop = page.locator('[data-testid="modal-backdrop"]')
    this.propertyModal = page.locator('[data-testid="property-modal"]')
    this.modalCloseButton = page.locator('[data-testid="modal-close-btn"]')
    this.primaryImage = page.locator('[data-testid="primary-image"]')
    this.imageGallery = page.locator('[data-testid="image-gallery"]')
    this.propertyMap = page.locator('[data-testid="property-map"]')
    
    // Advanced features that should NOT exist
    this.collectionOverview = page.locator('[data-testid="collection-overview"]')
    this.bucketManager = page.locator('[data-testid="bucket-manager"]')
    this.visitBookingModal = page.locator('[data-testid="visit-booking-modal"]')
    this.bucketTabs = page.locator('[data-testid^="bucket-tab-"]')
    this.bucketGrid = page.locator('[data-testid="bucket-property-grid"]')
  }

  async navigateToLink(linkCode: string) {
    await this.page.goto(`/link/${linkCode}`)
    await this.page.waitForLoadState('networkidle')
    // Wait for React to render
    await this.page.waitForTimeout(1000)
  }

  async waitForCarouselLoad() {
    await this.carousel.waitFor({ state: 'visible', timeout: 10000 })
  }

  async navigateNext() {
    await this.nextButton.click()
    // Wait for navigation animation
    await this.page.waitForTimeout(350)
  }

  async navigatePrevious() {
    await this.prevButton.click()
    // Wait for navigation animation
    await this.page.waitForTimeout(350)
  }

  async navigateToIndex(index: number) {
    const indicator = this.page.locator(`[data-testid="carousel-indicator-${index}"]`)
    await indicator.click()
    await this.page.waitForTimeout(350)
  }

  async assignToBucket(bucketType: 'liked' | 'considering' | 'disliked' | 'book_visit') {
    let button: Locator
    
    switch (bucketType) {
      case 'liked':
        button = this.likedButton
        break
      case 'considering':
        button = this.consideringButton
        break
      case 'disliked':
        button = this.dislikedButton
        break
      case 'book_visit':
        button = this.bookVisitButton
        break
    }
    
    await button.click()
    // Wait for auto-advance
    await this.page.waitForTimeout(350)
  }

  async openPropertyModal() {
    await this.activeCard.click()
    await this.page.waitForTimeout(500)
    await this.propertyModal.waitFor({ state: 'visible', timeout: 5000 })
  }

  async closeModal() {
    await this.modalCloseButton.click()
    await this.page.waitForTimeout(300)
  }

  async closeModalWithBackdrop() {
    await this.modalBackdrop.click({ position: { x: 10, y: 10 } })
    await this.page.waitForTimeout(300)
  }

  async closeModalWithEscape() {
    await this.page.keyboard.press('Escape')
    await this.page.waitForTimeout(300)
  }

  async getCurrentPropertyData(): Promise<PropertyData> {
    const address = await this.activeCard.locator('h3').textContent()
    const priceText = await this.activeCard.locator('.text-2xl').textContent()
    const featuresText = await this.activeCard.locator('.text-gray-600').textContent()
    
    // Extract bedrooms and bathrooms from features text
    const bedroomMatch = featuresText?.match(/(\d+)\s+bed/)
    const bathroomMatch = featuresText?.match(/(\d+)\s+bath/)
    
    return {
      id: await this.activeCard.getAttribute('data-testid') || '',
      address: address || '',
      price: priceText || '',
      bedrooms: bedroomMatch ? parseInt(bedroomMatch[1]) : 0,
      bathrooms: bathroomMatch ? parseInt(bathroomMatch[1]) : 0
    }
  }

  async getBucketAssignments(): Promise<Record<string, string>> {
    const buckets: Record<string, string> = {}
    
    // Look for cards with bucket classes
    const propertyCards = this.page.locator('[data-testid^="property-card-"]')
    const count = await propertyCards.count()
    
    for (let i = 0; i < count; i++) {
      const card = propertyCards.nth(i)
      const cardId = await card.getAttribute('data-testid')
      const cardClass = await card.getAttribute('class')
      
      if (cardId && cardClass) {
        if (cardClass.includes('bucket-liked')) buckets[cardId] = 'liked'
        else if (cardClass.includes('bucket-considering')) buckets[cardId] = 'considering'
        else if (cardClass.includes('bucket-disliked')) buckets[cardId] = 'disliked'
        else if (cardClass.includes('bucket-book_visit')) buckets[cardId] = 'book_visit'
      }
    }
    
    return buckets
  }

  async getPropertyCount(): Promise<number> {
    const indicators = this.page.locator('[data-testid^="carousel-indicator-"]')
    return await indicators.count()
  }

  async getCurrentIndex(): Promise<number> {
    const indicators = this.page.locator('[data-testid^="carousel-indicator-"]')
    const count = await indicators.count()
    
    for (let i = 0; i < count; i++) {
      const indicator = indicators.nth(i)
      const className = await indicator.getAttribute('class')
      if (className?.includes('bg-blue-500')) {
        return i
      }
    }
    return 0
  }

  async isNavigationDisabled(direction: 'prev' | 'next'): Promise<boolean> {
    const button = direction === 'prev' ? this.prevButton : this.nextButton
    return await button.isDisabled()
  }

  async hasCompleted(): Promise<boolean> {
    return await this.completionView.isVisible()
  }

  async getCompletionSummary(): Promise<BucketCounts> {
    const likedCount = await this.completionView.locator('[data-testid="liked-count"]').textContent()
    const consideringCount = await this.completionView.locator('[data-testid="considering-count"]').textContent()
    const dislikedCount = await this.completionView.locator('[data-testid="disliked-count"]').textContent()
    const bookVisitCount = await this.completionView.locator('[data-testid="book-visit-count"]').textContent()
    
    return {
      liked: parseInt(likedCount || '0'),
      considering: parseInt(consideringCount || '0'),
      disliked: parseInt(dislikedCount || '0'),
      bookVisit: parseInt(bookVisitCount || '0')
    }
  }

  // Performance helpers
  async measureCarouselLoadTime(): Promise<number> {
    const startTime = Date.now()
    await this.waitForCarouselLoad()
    return Date.now() - startTime
  }

  async keyboardNavigate(direction: 'left' | 'right') {
    await this.carousel.focus()
    await this.page.keyboard.press(direction === 'left' ? 'ArrowLeft' : 'ArrowRight')
    await this.page.waitForTimeout(350)
  }

  // Assertions for missing features
  async assertAdvancedFeaturesNotPresent() {
    await expect(this.collectionOverview).not.toBeVisible()
    await expect(this.bucketManager).not.toBeVisible()
    await expect(this.bucketTabs).not.toBeVisible()
    await expect(this.bucketGrid).not.toBeVisible()
  }

  async assertVisitBookingNotAvailable() {
    await expect(this.visitBookingModal).not.toBeVisible()
    
    // Check that no visit booking buttons exist
    const visitBookingButtons = this.page.locator('[data-testid*="visit-booking"]')
    await expect(visitBookingButtons).toHaveCount(0)
  }

  // Accessibility checks
  async checkAccessibility() {
    // Check ARIA labels
    await expect(this.carousel).toHaveAttribute('aria-label', 'Property carousel')
    await expect(this.prevButton).toHaveAttribute('aria-label', 'Previous property')
    await expect(this.nextButton).toHaveAttribute('aria-label', 'Next property')
    
    // Check live region
    await expect(this.liveRegion).toHaveAttribute('aria-live', 'polite')
    await expect(this.liveRegion).toHaveAttribute('aria-atomic', 'true')
  }

  // Error state helpers
  async hasError(): Promise<boolean> {
    return await this.errorView.isVisible()
  }

  async getErrorMessage(): Promise<string> {
    if (await this.hasError()) {
      return await this.errorView.locator('[data-testid="error-message"]').textContent() || ''
    }
    return ''
  }

  async isEmpty(): Promise<boolean> {
    return await this.emptyView.isVisible()
  }

  async isLoading(): Promise<boolean> {
    return await this.loadingView.isVisible()
  }
}