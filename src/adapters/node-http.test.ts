import http from 'node:http'

import { describe, expect, it } from 'vitest'

import { createCorrelation } from '../index.js'
import { withCorrelation } from './node-http.js'

describe('withCorrelation (node:http)', () => {
    it('adopts inbound ID, echoes response header, and isolates concurrent requests', async () => {
        const correlation = createCorrelation({ headerName: 'asdf-correlation-id' })
        const seen: string[] = []

        const server = http.createServer(
            withCorrelation(correlation, (req, res) => {
                const id = correlation.current()
                seen.push(id ?? '')
                // Simulate async work so concurrent requests overlap.
                setTimeout(() => {
                    res.end(JSON.stringify({ id: correlation.current() }))
                }, 20)
            }),
        )
        await new Promise<void>((resolve) => {
            server.listen(0, '127.0.0.1', () => {
                resolve()
            })
        })

        const address = server.address()

        if (address === null || typeof address === 'string') {
            throw new Error('expected TCP address')
        }

        const base = `http://127.0.0.1:${String(address.port)}`

        try {
            const [a, b] = await Promise.all([
                fetch(base, { headers: { 'asdf-correlation-id': 'req-a' } }),
                fetch(base, { headers: { 'asdf-correlation-id': 'req-b' } }),
            ])
            expect(a.headers.get('asdf-correlation-id')).toBe('req-a')
            expect(b.headers.get('asdf-correlation-id')).toBe('req-b')
            expect(await a.json()).toEqual({ id: 'req-a' })
            expect(await b.json()).toEqual({ id: 'req-b' })
            expect(seen.sort()).toEqual(['req-a', 'req-b'])
        } finally {
            await new Promise<void>((resolve, reject) => {
                server.close((err) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve()
                    }
                })
            })
        }
    })

    it('generates a UUIDv7 when no inbound ID is present', async () => {
        const correlation = createCorrelation()
        const server = http.createServer(
            withCorrelation(correlation, (_req, res) => {
                res.end(correlation.current())
            }),
        )
        await new Promise<void>((resolve) => {
            server.listen(0, '127.0.0.1', () => {
                resolve()
            })
        })

        const address = server.address()

        if (address === null || typeof address === 'string') {
            throw new Error('expected TCP address')
        }

        try {
            const response = await fetch(`http://127.0.0.1:${String(address.port)}`)
            const body = await response.text()
            const echoed = response.headers.get('x-correlation-id')
            expect(echoed).toBe(body)
            expect(body).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
        } finally {
            await new Promise<void>((resolve, reject) => {
                server.close((err) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve()
                    }
                })
            })
        }
    })
})
