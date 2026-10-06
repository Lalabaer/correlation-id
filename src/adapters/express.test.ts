import type { Server } from 'node:http'

import express from 'express'
import { describe, expect, it } from 'vitest'

import { createCorrelation } from '../index.js'
import { expressCorrelation } from './express.js'

async function listen(app: express.Express): Promise<{ server: Server; base: string }> {
    const server = app.listen(0, '127.0.0.1')
    await new Promise<void>((resolve) => {
        server.on('listening', () => {
            resolve()
        })
    })

    const address = server.address()

    if (address === null || typeof address === 'string') {
        throw new Error('expected TCP address')
    }

    return { server, base: `http://127.0.0.1:${String(address.port)}` }
}

describe('expressCorrelation', () => {
    it('propagates the ID through middleware and echoes it', async () => {
        const correlation = createCorrelation({ headerName: 'asdf-correlation-id' })
        const app = express()
        app.use(expressCorrelation(correlation))
        app.get('/ping', (_req, res) => {
            res.json({ id: correlation.current() })
        })

        const { server, base } = await listen(app)

        try {
            const response = await fetch(`${base}/ping`, {
                headers: { 'asdf-correlation-id': 'express-1' },
            })
            expect(response.headers.get('asdf-correlation-id')).toBe('express-1')
            expect(await response.json()).toEqual({ id: 'express-1' })
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
