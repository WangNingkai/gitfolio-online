import { escapeHtml, kFormatter, clampValue, parseBoolean, sanitizeUrl, CONSTANTS } from '../src/lib/utils'

describe('utils', () => {
  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;')
    })

    it('should escape ampersand', () => {
      expect(escapeHtml('a & b')).toBe('a &amp; b')
    })

    it('should escape single quotes', () => {
      expect(escapeHtml("it's")).toBe('it&#39;s')
    })

    it('should handle empty string', () => {
      expect(escapeHtml('')).toBe('')
    })

    it('should handle null and undefined', () => {
      expect(escapeHtml(null as any)).toBe('null')
      expect(escapeHtml(undefined)).toBe('')
    })

    it('should handle numbers', () => {
      expect(escapeHtml(123 as any)).toBe('123')
    })
  })

  describe('kFormatter', () => {
    it('should format numbers over 1000 with k suffix', () => {
      expect(kFormatter(1500)).toBe('1.5k')
      expect(kFormatter(1000)).toBe('1k')
      expect(kFormatter(9999)).toBe('10k')
    })

    it('should return numbers under 1000 as is', () => {
      expect(kFormatter(999)).toBe(999)
      expect(kFormatter(0)).toBe(0)
      expect(kFormatter(100)).toBe(100)
    })

    it('should handle negative numbers', () => {
      expect(kFormatter(-1500)).toBe('-1.5k')
      expect(kFormatter(-100)).toBe(-100)
    })
  })

  describe('clampValue', () => {
    it('should return value within range', () => {
      expect(clampValue(5, 1, 10)).toBe(5)
    })

    it('should return min if value is below range', () => {
      expect(clampValue(0, 1, 10)).toBe(1)
      expect(clampValue(-5, 1, 10)).toBe(1)
    })

    it('should return max if value is above range', () => {
      expect(clampValue(15, 1, 10)).toBe(10)
      expect(clampValue(100, 1, 10)).toBe(10)
    })

    it('should handle edge cases', () => {
      expect(clampValue(1, 1, 10)).toBe(1)
      expect(clampValue(10, 1, 10)).toBe(10)
    })
  })

  describe('parseBoolean', () => {
    it('should parse "true" string to true', () => {
      expect(parseBoolean('true')).toBe(true)
    })

    it('should parse "false" string to false', () => {
      expect(parseBoolean('false')).toBe(false)
    })

    it('should return value as is for other inputs', () => {
      expect(parseBoolean('yes')).toBe('yes')
      expect(parseBoolean(1 as any)).toBe(1)
      expect(parseBoolean(null as any)).toBe(null)
      expect(parseBoolean(undefined)).toBe(undefined)
    })
  })

  describe('sanitizeUrl', () => {
    it('should allow http and https URLs', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com')
      expect(sanitizeUrl('http://example.com')).toBe('http://example.com')
    })

    it('should block non-http(s) URLs', () => {
      expect(sanitizeUrl('javascript:alert(1)')).toBe('')
      expect(sanitizeUrl('data:text/html,<script>')).toBe('')
      expect(sanitizeUrl('ftp://example.com')).toBe('')
    })

    it('should handle empty and null values', () => {
      expect(sanitizeUrl('')).toBe('')
      expect(sanitizeUrl(null)).toBe('')
      expect(sanitizeUrl(undefined)).toBe('')
    })
  })

  describe('CONSTANTS', () => {
    it('should have correct time constants', () => {
      expect(CONSTANTS.THIRTY_MINUTES).toBe(1800)
      expect(CONSTANTS.TWO_HOURS).toBe(7200)
      expect(CONSTANTS.ONE_DAY).toBe(86400)
    })
  })
})
