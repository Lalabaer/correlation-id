import { describe, expect, it } from 'vitest'

import { createCorrelation } from '../index.js'
import { kafkaHeaders, withKafkaMessage } from './kafka.js'

describe('kafkaHeaders', () => {
    it('uses the configured header name', () => {
        const correlation = createCorrelation({ headerName: 'asdf-correlation-id' })
        expect(kafkaHeaders(correlation, 'msg-1')).toEqual({ 'asdf-correlation-id': 'msg-1' })
    })

    it('falls back to context then generation', () => {
        const correlation = createCorrelation({ headerName: 'asdf-correlation-id', idGenerator: () => 'generated' })
        expect(kafkaHeaders(correlation)).toEqual({ 'asdf-correlation-id': 'generated' })

        correlation.run('ctx', () => {
            expect(kafkaHeaders(correlation)).toEqual({ 'asdf-correlation-id': 'ctx' })
        })
    })
})

describe('withKafkaMessage', () => {
    it('sets context from string and Buffer headers', async () => {
        const correlation = createCorrelation({ headerName: 'asdf-correlation-id' })
        const seen: string[] = []

        const handler = withKafkaMessage(correlation, () => {
            seen.push(correlation.current() ?? '')

            return Promise.resolve()
        })
        await handler({
            topic: 'orders',
            partition: 0,
            message: { headers: { 'asdf-correlation-id': 'string-id' } },
        })

        await handler({
            topic: 'orders',
            partition: 0,
            message: {
                headers: { 'asdf-correlation-id': Buffer.from('buffer-id', 'utf8') },
            },
        })

        expect(seen).toEqual(['string-id', 'buffer-id'])
    })
})
