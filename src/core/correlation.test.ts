import { describe, expect, it } from 'vitest'

import { createCorrelation } from './correlation.js'
import { uuidv7 } from './id.js'
import type { CorrelationRuntime } from './types.js'

function memoryRuntime(seed = 'generated-id'): CorrelationRuntime {
    const store: { current: string | undefined } = { current: undefined }

    return {
        run<T>(correlationId: string, fn: () => T): T {
            const previous = store.current
            store.current = correlationId

            try {
                return fn()
            } finally {
                store.current = previous
            }
        },
        current: () => store.current,
        defaultIdGenerator: () => () => seed,
    }
}

describe('createCorrelation', () => {
    it('uses default header name and generates when missing', () => {
        const correlation = createCorrelation({}, memoryRuntime('new-id'))
        expect(correlation.headerName).toBe('x-correlation-id')
        expect(correlation.resolve({})).toBe('new-id')
    })

    it('adopts a valid inbound ID from the primary header', () => {
        const correlation = createCorrelation({ headerName: 'asdf-correlation-id' }, memoryRuntime())
        expect(correlation.resolve({ 'asdf-correlation-id': 'demo-123' })).toBe('demo-123')
    })

    it('replaces invalid inbound IDs', () => {
        const correlation = createCorrelation({}, memoryRuntime('replacement'))
        expect(correlation.resolve({ 'x-correlation-id': 'bad\nid' })).toBe('replacement')
    })

    it('falls back to secondary headers in order', () => {
        const correlation = createCorrelation(
            { headerName: 'asdf-correlation-id', fallbackHeaders: ['x-request-id', 'x-trace-id'] },
            memoryRuntime('generated'),
        )
        expect(correlation.resolve({ 'x-request-id': 'from-proxy' })).toBe('from-proxy')
        expect(correlation.resolve({ 'x-trace-id': 'from-trace' })).toBe('from-trace')
    })

    it('reads Buffer / Uint8Array header values', () => {
        const correlation = createCorrelation({ headerName: 'asdf-correlation-id' }, memoryRuntime())
        const encoded = new TextEncoder().encode('kafka-id-1')
        expect(correlation.resolve({ 'asdf-correlation-id': encoded })).toBe('kafka-id-1')
    })

    it('reads WHATWG Headers', () => {
        const correlation = createCorrelation({}, memoryRuntime())
        const headers = new Headers({ 'x-correlation-id': 'web-id' })
        expect(correlation.resolve(headers)).toBe('web-id')
    })

    it('throws on invalid configured header names', () => {
        expect(() => createCorrelation({ headerName: 'bad name' }, memoryRuntime())).toThrow(TypeError)
        expect(() => createCorrelation({ fallbackHeaders: ['ok', 'bad:name'] }, memoryRuntime())).toThrow(TypeError)
    })

    it('exposes current ID inside run and builds outgoing headers', () => {
        const correlation = createCorrelation({ headerName: 'qwer-correlation-id' }, memoryRuntime())
        correlation.run('ctx-1', () => {
            expect(correlation.current()).toBe('ctx-1')
            expect(correlation.headers()).toEqual({ 'qwer-correlation-id': 'ctx-1' })
        })
        expect(correlation.current()).toBeUndefined()
        expect(correlation.headers('explicit')).toEqual({ 'qwer-correlation-id': 'explicit' })
    })

    it('allows a custom id generator', () => {
        const correlation = createCorrelation({ idGenerator: () => 'custom' }, memoryRuntime('unused'))
        expect(correlation.generate()).toBe('custom')
        expect(correlation.resolve({})).toBe('custom')
        expect(isValidCorrelationIdShape(uuidv7())).toBe(true)
    })
})

function isValidCorrelationIdShape(value: string): boolean {
    return /^[0-9a-f-]{36}$/.test(value)
}
