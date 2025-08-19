import { NextRequest } from 'next/server'
import { GET } from '../[...params]/route'

// Mock NextResponse
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: jest.fn().mockImplementation((body, options) => ({
    body,
    headers: options?.headers,
    status: options?.status || 200,
  })),
}))

describe('/api/placeholder/[...params] Route Handler', () => {
  let mockRequest: Partial<NextRequest>

  beforeEach(() => {
    jest.clearAllMocks()
    mockRequest = {
      url: 'http://localhost:3000/api/placeholder/400/300',
    }
  })

  describe('GET Handler', () => {
    it('should generate SVG with default dimensions when no params provided', async () => {
      const params = { params: [] }
      
      const response = await GET(mockRequest as NextRequest, { params })
      
      expect(response.body).toContain('<svg width="400" height="300"')
      expect(response.body).toContain('400 × 300')
      expect(response.headers).toEqual({
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      })
    })

    it('should generate SVG with custom width only', async () => {
      const params = { params: ['600'] }
      
      const response = await GET(mockRequest as NextRequest, { params })
      
      expect(response.body).toContain('<svg width="600" height="300"')
      expect(response.body).toContain('600 × 300')
      expect(response.body).toContain('xmlns="http://www.w3.org/2000/svg"')
    })

    it('should generate SVG with custom width and height', async () => {
      const params = { params: ['800', '600'] }
      
      const response = await GET(mockRequest as NextRequest, { params })
      
      expect(response.body).toContain('<svg width="800" height="600"')
      expect(response.body).toContain('800 × 600')
    })

    it('should generate SVG with very large dimensions', async () => {
      const params = { params: ['1920', '1080'] }
      
      const response = await GET(mockRequest as NextRequest, { params })
      
      expect(response.body).toContain('<svg width="1920" height="1080"')
      expect(response.body).toContain('1920 × 1080')
    })

    it('should generate SVG with small dimensions', async () => {
      const params = { params: ['50', '50'] }
      
      const response = await GET(mockRequest as NextRequest, { params })
      
      expect(response.body).toContain('<svg width="50" height="50"')
      expect(response.body).toContain('50 × 50')
    })

    it('should handle extra parameters gracefully', async () => {
      const params = { params: ['400', '300', 'extra', 'params'] }
      
      const response = await GET(mockRequest as NextRequest, { params })
      
      // Should only use first two parameters
      expect(response.body).toContain('<svg width="400" height="300"')
      expect(response.body).toContain('400 × 300')
    })

    it('should generate valid SVG structure', async () => {
      const params = { params: ['400', '300'] }
      
      const response = await GET(mockRequest as NextRequest, { params })
      const svgContent = response.body as string
      
      // Check SVG structure
      expect(svgContent).toContain('<svg')
      expect(svgContent).toContain('</svg>')
      expect(svgContent).toContain('<rect')
      expect(svgContent).toContain('<text')
      expect(svgContent).toContain('</text>')
    })

    it('should include proper SVG attributes', async () => {
      const params = { params: ['400', '300'] }
      
      const response = await GET(mockRequest as NextRequest, { params })
      const svgContent = response.body as string
      
      // Check SVG attributes
      expect(svgContent).toContain('width="400"')
      expect(svgContent).toContain('height="300"')
      expect(svgContent).toContain('xmlns="http://www.w3.org/2000/svg"')
      
      // Check rect attributes
      expect(svgContent).toContain('width="100%"')
      expect(svgContent).toContain('height="100%"')
      expect(svgContent).toContain('fill="#f3f4f6"')
      
      // Check text attributes
      expect(svgContent).toContain('x="50%"')
      expect(svgContent).toContain('y="50%"')
      expect(svgContent).toContain('dominant-baseline="middle"')
      expect(svgContent).toContain('text-anchor="middle"')
      expect(svgContent).toContain('fill="#9ca3af"')
      expect(svgContent).toContain('font-family="system-ui"')
      expect(svgContent).toContain('font-size="16"')
    })

    it('should set correct response headers', async () => {
      const params = { params: ['400', '300'] }
      
      const response = await GET(mockRequest as NextRequest, { params })
      
      expect(response.headers).toEqual({
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      })
    })

    it('should handle undefined params gracefully', async () => {
      const params = { params: undefined as unknown as string[] }
      
      const response = await GET(mockRequest as NextRequest, { params })
      
      // Should use defaults
      expect(response.body).toContain('<svg width="400" height="300"')
      expect(response.body).toContain('400 × 300')
    })

    it('should handle null params gracefully', async () => {
      const params = { params: null as unknown as string[] }
      
      const response = await GET(mockRequest as NextRequest, { params })
      
      // Should use defaults
      expect(response.body).toContain('<svg width="400" height="300"')
      expect(response.body).toContain('400 × 300')
    })

    it('should handle non-numeric parameters', async () => {
      const params = { params: ['abc', 'def'] }
      
      const response = await GET(mockRequest as NextRequest, { params })
      
      // Should pass through as-is (browser will handle invalid values)
      expect(response.body).toContain('<svg width="abc" height="def"')
      expect(response.body).toContain('abc × def')
    })

    it('should handle zero dimensions', async () => {
      const params = { params: ['0', '0'] }
      
      const response = await GET(mockRequest as NextRequest, { params })
      
      expect(response.body).toContain('<svg width="0" height="0"')
      expect(response.body).toContain('0 × 0')
    })

    it('should handle negative dimensions', async () => {
      const params = { params: ['-100', '-200'] }
      
      const response = await GET(mockRequest as NextRequest, { params })
      
      expect(response.body).toContain('<svg width="-100" height="-200"')
      expect(response.body).toContain('-100 × -200')
    })

    it('should generate consistent output for same parameters', async () => {
      const params = { params: ['500', '400'] }
      
      const response1 = await GET(mockRequest as NextRequest, { params })
      const response2 = await GET(mockRequest as NextRequest, { params })
      
      expect(response1.body).toBe(response2.body)
      expect(response1.headers).toEqual(response2.headers)
    })

    it('should include appropriate cache headers for performance', async () => {
      const params = { params: ['400', '300'] }
      
      const response = await GET(mockRequest as NextRequest, { params })
      
      const cacheControl = response.headers!['Cache-Control']
      expect(cacheControl).toContain('public')
      expect(cacheControl).toContain('max-age=31536000') // 1 year
      expect(cacheControl).toContain('immutable')
    })

    it('should be suitable for use as img src', async () => {
      const params = { params: ['200', '150'] }
      
      const response = await GET(mockRequest as NextRequest, { params })
      
      // Check content type is correct for browser consumption
      expect(response.headers!['Content-Type']).toBe('image/svg+xml')
      
      // Check SVG is well-formed
      const svgContent = response.body as string
      expect(svgContent.trim().startsWith('<svg')).toBe(true)
      expect(svgContent.trim().endsWith('</svg>')).toBe(true)
    })

    it('should handle decimal dimensions', async () => {
      const params = { params: ['100.5', '200.7'] }
      
      const response = await GET(mockRequest as NextRequest, { params })
      
      expect(response.body).toContain('<svg width="100.5" height="200.7"')
      expect(response.body).toContain('100.5 × 200.7')
    })

    it('should escape SVG content properly', async () => {
      const params = { params: ['400', '300'] }
      
      const response = await GET(mockRequest as NextRequest, { params })
      const svgContent = response.body as string
      
      // Check that text content doesn't contain unescaped characters
      expect(svgContent).not.toContain('&amp;')
      expect(svgContent).not.toContain('&lt;')
      expect(svgContent).not.toContain('&gt;')
      
      // Should contain proper dimension text
      expect(svgContent).toContain('400 × 300')
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle very long parameter strings', async () => {
      const longString = 'a'.repeat(1000)
      const params = { params: [longString, '300'] }
      
      const response = await GET(mockRequest as NextRequest, { params })
      
      expect(response.body).toContain(`<svg width="${longString}" height="300"`)
      expect(response.body).toContain(`${longString} × 300`)
    })

    it('should handle special characters in parameters', async () => {
      const params = { params: ['100%', '200px'] }
      
      const response = await GET(mockRequest as NextRequest, { params })
      
      expect(response.body).toContain('<svg width="100%" height="200px"')
      expect(response.body).toContain('100% × 200px')
    })

    it('should handle empty string parameters', async () => {
      const params = { params: ['', ''] }
      
      const response = await GET(mockRequest as NextRequest, { params })
      
      expect(response.body).toContain('<svg width="" height=""')
      expect(response.body).toContain(' × ')
    })
  })
})