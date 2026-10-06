import { describe, expect, it } from 'vitest'

import { assertHeaderName, isValidHeaderName } from './header-name.js'

describe('isValidHeaderName', () => {
    it('accepts RFC 9110 tokens', () => {
        expect(isValidHeaderName('x-correlation-id')).toBe(true)
        expect(isValidHeaderName('asdf-correlation-id')).toBe(true)
        expect(isValidHeaderName('qwer-correlation-id')).toBe(true)
        expect(isValidHeaderName('X-Request-ID')).toBe(true)
    })

    it('rejects invalid names', () => {
        expect(isValidHeaderName('')).toBe(false)
        expect(isValidHeaderName('x correlation id')).toBe(false)
        expect(isValidHeaderName('x:correlation-id')).toBe(false)
        expect(isValidHeaderName('x/correlation-id')).toBe(false)
        expect(isValidHeaderName(null)).toBe(false)
        expect(isValidHeaderName(42)).toBe(false)
    })
})

describe('assertHeaderName', () => {
    it('normalizes to lowercase', () => {
        expect(assertHeaderName('X-Correlation-ID')).toBe('x-correlation-id')
    })

    it('throws TypeError for invalid names', () => {
        expect(() => assertHeaderName('bad name')).toThrow(TypeError)
        expect(() => assertHeaderName('')).toThrow(/Invalid headerName/)
    })
})
