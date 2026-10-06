import Fastify from 'fastify'
import { describe, expect, it } from 'vitest'

import { createCorrelation } from '../index.js'
import { fastifyCorrelation } from './fastify.js'

declare module 'fastify' {
    interface FastifyRequest {
        correlationId: string
    }
}

describe('fastifyCorrelation', () => {
    it('sets request.correlationId and echoes the configured header', async () => {
        const correlation = createCorrelation({ headerName: 'qwer-correlation-id' })
        const app = Fastify()
        await app.register(fastifyCorrelation(correlation))
        app.get('/orders', (request) => ({
            fromRequest: request.correlationId,
            fromContext: correlation.current(),
        }))

        const response = await app.inject({
            method: 'GET',
            url: '/orders',
            headers: { 'qwer-correlation-id': 'fastify-1' },
        })
        expect(response.headers['qwer-correlation-id']).toBe('fastify-1')
        expect(response.json()).toEqual({ fromRequest: 'fastify-1', fromContext: 'fastify-1' })
        await app.close()
    })
})
