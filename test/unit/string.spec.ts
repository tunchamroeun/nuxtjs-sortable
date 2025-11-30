import { describe, it, expect } from 'vitest'
import { camelize } from '../../src/runtime/util/string'

describe('string utilities', () => {
  describe('camelize', () => {
    it('should convert kebab-case to camelCase', () => {
      expect(camelize('foo-bar')).toBe('fooBar')
      expect(camelize('foo-bar-baz')).toBe('fooBarBaz')
    })

    it('should handle single word', () => {
      expect(camelize('foo')).toBe('foo')
    })

    it('should handle multiple hyphens', () => {
      expect(camelize('a-b-c-d')).toBe('aBCD')
    })

    it('should cache results', () => {
      const result1 = camelize('test-string')
      const result2 = camelize('test-string')
      expect(result1).toBe(result2)
      expect(result1).toBe('testString')
    })

    it('should handle empty string', () => {
      expect(camelize('')).toBe('')
    })

    it('should handle string starting with hyphen', () => {
      expect(camelize('-foo')).toBe('Foo')
    })
  })
})
