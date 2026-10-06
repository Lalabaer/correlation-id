import { describe, expect, it } from 'vitest'

import { isValidCorrelationId, MAX_ID_LENGTH, uuidv7 } from './id.js'

describe('uuidv7', () => {
    it('returns a UUID-shaped string with version 7 and variant 10xx', () => {
        const id = uuidv7()
        expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
    })

    it('embeds the provided timestamp and sorts by creation time', () => {
        const earlier = uuidv7(1_700_000_000_000)
        const later = uuidv7(1_800_000_000_000)
        expect(earlier < later).toBe(true)
        expect(earlier.slice(0, 8)).not.toBe(later.slice(0, 8))
    })

    it('generates unique values', () => {
        const ids = new Set(Array.from({ length: 50 }, () => uuidv7()))
        expect(ids.size).toBe(50)
    })
})

describe('isValidCorrelationId', () => {
    it('accepts safe IDs', () => {
        expect(isValidCorrelationId('demo-123')).toBe(true)
        expect(isValidCorrelationId(uuidv7())).toBe(true)
        expect(isValidCorrelationId('a'.repeat(MAX_ID_LENGTH))).toBe(true)
    })

    it('rejects unsafe or oversized values', () => {
        expect(isValidCorrelationId('')).toBe(false)
        expect(isValidCorrelationId('bad\nid')).toBe(false)
        expect(isValidCorrelationId('has space')).toBe(false)
        expect(isValidCorrelationId('quote"here')).toBe(false)
        expect(isValidCorrelationId('a'.repeat(MAX_ID_LENGTH + 1))).toBe(false)
        expect(isValidCorrelationId(undefined)).toBe(false)
    })
})
