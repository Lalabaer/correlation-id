import { describe, expect, it, vi } from 'vitest'

import { attachCorrelation, correlationFetch, createCorrelation } from './browser.js'

describe('browser entry', () => {
    it('has no ambient context and generates per request', async () => {
        const correlation = createCorrelation({ headerName: 'asdf-correlation-id' })
        expect(correlation.current()).toBeUndefined()

        correlation.run('ignored', () => {
            expect(correlation.current()).toBeUndefined()
        })

        const fetchImpl = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
            return Promise.resolve(
                new Response(null, { status: 204, ...(init?.headers ? { headers: init.headers } : {}) }),
            )
        })
        const fetch = correlationFetch(correlation, fetchImpl)
        await fetch('http://example.test/a')
        await fetch('http://example.test/b')

        const first = new Headers(fetchImpl.mock.calls[0]?.[1]?.headers).get('asdf-correlation-id')
        const second = new Headers(fetchImpl.mock.calls[1]?.[1]?.headers).get('asdf-correlation-id')
        expect(first).toMatch(/^[0-9a-f-]{36}$/)
        expect(second).toMatch(/^[0-9a-f-]{36}$/)
        expect(first).not.toBe(second)

        // attachCorrelation is exported for React apps using Axios.
        expect(typeof attachCorrelation).toBe('function')
    })
})
