// Mock Next.js font first, before any imports
jest.mock('next/font/google', () => ({
  Inter: jest.fn(() => ({
    className: 'mocked-inter-font',
  })),
}))

// Mock the globals.css import
jest.mock('../globals.css', () => ({}))

import { render } from '@testing-library/react'
import RootLayout, { metadata } from '../layout'
import { Inter } from 'next/font/google'

describe('RootLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('metadata export', () => {
    it('should export correct metadata object', () => {
      expect(metadata).toEqual({
        title: 'SwipeLink Estate - Real Estate Platform',
        description: 'Discover properties through an intuitive swipe interface',
        keywords: 'real estate, properties, swipe, tinder, housing, buy, sell',
      })
    })

    it('should have SEO-friendly title', () => {
      expect(metadata.title).toContain('SwipeLink Estate')
      expect(metadata.title).toContain('Real Estate')
    })

    it('should have descriptive keywords', () => {
      const keywords = metadata.keywords as string
      expect(keywords).toContain('real estate')
      expect(keywords).toContain('properties')
      expect(keywords).toContain('swipe')
    })
  })

  describe('Font Loading', () => {
    it('should use Inter font mock correctly', () => {
      // Check that the Inter mock function exists and returns the expected object
      const interResult = Inter({ subsets: ['latin'] })
      expect(interResult).toEqual({
        className: 'mocked-inter-font',
      })
    })
  })

  describe('RootLayout Component', () => {
    it('should render children correctly', () => {
      const TestChild = () => <div data-testid="test-child">Test Content</div>
      
      const { getByTestId, container } = render(
        <RootLayout>
          <TestChild />
        </RootLayout>
      )

      // Check that layout renders html and body structure
      const htmlElement = container.querySelector('html')
      expect(htmlElement).toBeInTheDocument()
      expect(htmlElement).toHaveAttribute('lang', 'en')
      
      // Check body has font class
      const bodyElement = container.querySelector('body')
      expect(bodyElement).toBeInTheDocument()
      expect(bodyElement).toHaveClass('mocked-inter-font')
      
      // Check root div exists
      const rootDiv = container.querySelector('#root')
      expect(rootDiv).toBeInTheDocument()
      
      // Check children are rendered
      expect(getByTestId('test-child')).toBeInTheDocument()
      expect(getByTestId('test-child')).toHaveTextContent('Test Content')
    })

    it('should have correct HTML structure', () => {
      const { container } = render(
        <RootLayout>
          <div>Test</div>
        </RootLayout>
      )

      // Verify document structure
      const htmlElement = container.querySelector('html')
      const bodyElement = container.querySelector('body')
      const rootDiv = container.querySelector('#root')
      
      expect(htmlElement).toHaveAttribute('lang', 'en')
      expect(bodyElement).toHaveClass('mocked-inter-font')
      expect(rootDiv).toBeInTheDocument()
    })

    it('should handle multiple children', () => {
      const { getByTestId } = render(
        <RootLayout>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
          <div data-testid="child-3">Child 3</div>
        </RootLayout>
      )

      expect(getByTestId('child-1')).toBeInTheDocument()
      expect(getByTestId('child-2')).toBeInTheDocument()
      expect(getByTestId('child-3')).toBeInTheDocument()
    })

    it('should handle empty children', () => {
      const { container } = render(
        <RootLayout>
          {null}
        </RootLayout>
      )

      const rootDiv = container.querySelector('#root')
      expect(rootDiv).toBeInTheDocument()
      expect(rootDiv).toBeEmptyDOMElement()
    })

    it('should apply Inter font class to body', () => {
      const { container } = render(
        <RootLayout>
          <div>Test</div>
        </RootLayout>
      )

      const bodyElement = container.querySelector('body')
      expect(bodyElement).toHaveClass('mocked-inter-font')
    })

    it('should render with proper semantic HTML', () => {
      const { container } = render(
        <RootLayout>
          <main data-testid="main-content">Main Content</main>
        </RootLayout>
      )

      // Check that the layout preserves semantic HTML
      const mainContent = container.querySelector('[data-testid="main-content"]')
      expect(mainContent?.tagName).toBe('MAIN')
      expect(mainContent).toHaveTextContent('Main Content')
    })
  })

  describe('Error Handling', () => {
    it('should handle React.ReactNode types correctly', () => {
      const complexChildren = (
        <>
          <header>Header</header>
          <nav>Navigation</nav>
          <main>Content</main>
          <footer>Footer</footer>
        </>
      )

      const { container } = render(
        <RootLayout>
          {complexChildren}
        </RootLayout>
      )

      expect(container.querySelector('header')).toHaveTextContent('Header')
      expect(container.querySelector('nav')).toHaveTextContent('Navigation')
      expect(container.querySelector('main')).toHaveTextContent('Content')
      expect(container.querySelector('footer')).toHaveTextContent('Footer')
    })

    it('should handle undefined children gracefully', () => {
      expect(() => {
        render(
          <RootLayout>
            {undefined}
          </RootLayout>
        )
      }).not.toThrow()
    })
  })

  describe('Accessibility', () => {
    it('should set proper language attribute', () => {
      const { container } = render(
        <RootLayout>
          <div>Content</div>
        </RootLayout>
      )

      const htmlElement = container.querySelector('html')
      expect(htmlElement).toHaveAttribute('lang', 'en')
    })

    it('should provide landmark structure with root element', () => {
      const { container } = render(
        <RootLayout>
          <div>Content</div>
        </RootLayout>
      )

      const rootElement = container.querySelector('#root')
      expect(rootElement).toBeInTheDocument()
      expect(rootElement).toHaveAttribute('id', 'root')
    })
  })
})