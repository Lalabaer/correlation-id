import axios from 'axios'
import { describe, expect, it, vi } from 'vitest'

import { createCorrelation } from '../index.js'
import { attachCorrelation } from './axios.js'

describe('attachCorrelation', () => {
    it('injects the context ID and never overwrites an explicit header', async () => {
        const correlation = createCorrelation({ headerName: 'asdf-correlation-id' })
        const client = axios.create()
        attachCorrelation(correlation, client)

        const adapter = vi.fn((config: { headers: { get?: (name: string) => string } }) => {
            const headers = config.headers
            const value =
                typeof headers.get === 'function'
                    ? headers.get('asdf-correlation-id')
                    : (headers as Record<string, string>)['asdf-correlation-id']

            return Promise.resolve({
                data: { value },
                status: 200,
                statusText: 'OK',
                headers: {},
                config,
            })
        })
        client.defaults.adapter = adapter as never

        await correlation.run('axios-ctx', async () => {
            const first = await client.get<{ value: string }>('http://example.test/a')
            expect(first.data).toEqual({ value: 'axios-ctx' })

            const second = await client.get<{ value: string }>('http://example.test/b', {
                headers: { 'asdf-correlation-id': 'explicit' },
            })
            expect(second.data).toEqual({ value: 'explicit' })
        })
    })

    it('generates a new ID outside of any context', async () => {
        const correlation = createCorrelation()
        const client = axios.create()
        attachCorrelation(correlation, client)

        client.defaults.adapter = vi.fn((config: { headers: { get?: (name: string) => string } }) => {
            const headers = config.headers
            const value =
                typeof headers.get === 'function'
                    ? headers.get('x-correlation-id')
                    : (headers as Record<string, string>)['x-correlation-id']

            return Promise.resolve({
                data: { value },
                status: 200,
                statusText: 'OK',
                headers: {},
                config,
            })
        }) as never

        const response = await client.get<{ value: string }>('http://example.test')
        expect(response.data.value).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
    })
})
