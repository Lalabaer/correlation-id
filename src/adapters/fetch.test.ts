import { describe, expect, it, vi } from 'vitest'

import { createCorrelation } from '../index.js'
import { correlationFetch } from './fetch.js'

describe('correlationFetch', () => {
    it('injects the current context ID', async () => {
        const correlation = createCorrelation({ headerName: 'asdf-correlation-id' })
        const fetchImpl = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
            return Promise.resolve(
                new Response(null, { status: 204, ...(init?.headers ? { headers: init.headers } : {}) }),
            )
        })
        const fetch = correlationFetch(correlation, fetchImpl)
        await correlation.run('ctx-id', async () => {
            await fetch('http://example.test/charges', { method: 'POST' })
        })

        const init = fetchImpl.mock.calls[0]?.[1]
        const headers = new Headers(init?.headers)
        expect(headers.get('asdf-correlation-id')).toBe('ctx-id')
    })

    it('does not overwrite an explicit header', async () => {
        const correlation = createCorrelation()
        const fetchImpl = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
            return Promise.resolve(
                new Response(null, { status: 204, ...(init?.headers ? { headers: init.headers } : {}) }),
            )
        })
        const fetch = correlationFetch(correlation, fetchImpl)
        await correlation.run('ctx-id', async () => {
            await fetch('http://example.test', {
                headers: { 'x-correlation-id': 'explicit' },
            })
        })

        const headers = new Headers(fetchImpl.mock.calls[0]?.[1]?.headers)
        expect(headers.get('x-correlation-id')).toBe('explicit')
    })

    it('generates a new ID when no context exists', async () => {
        const correlation = createCorrelation({ headerName: 'asdf-correlation-id' })
        const fetchImpl = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
            return Promise.resolve(
                new Response(null, { status: 204, ...(init?.headers ? { headers: init.headers } : {}) }),
            )
        })
        const fetch = correlationFetch(correlation, fetchImpl)
        await fetch('http://example.test')

        const headers = new Headers(fetchImpl.mock.calls[0]?.[1]?.headers)
        expect(headers.get('asdf-correlation-id')).toMatch(
            /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
        )
    })
})
