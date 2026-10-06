import { describe, expect, it } from 'vitest'

import { createCorrelation } from '../index.js'
import { withWebCorrelation } from './web.js'

describe('withWebCorrelation', () => {
    it('resolves inbound IDs and echoes them on the response', async () => {
        const correlation = createCorrelation({ headerName: 'asdf-correlation-id' })
        const handler = withWebCorrelation(correlation, () => {
            return Response.json({ id: correlation.current() })
        })

        const response = await handler(
            new Request('http://localhost/api', {
                headers: { 'asdf-correlation-id': 'web-1' },
            }),
        )
        expect(response.headers.get('asdf-correlation-id')).toBe('web-1')
        expect(await response.json()).toEqual({ id: 'web-1' })
    })

    it('rebuilds responses when header mutation fails', async () => {
        const correlation = createCorrelation({ idGenerator: () => 'generated-web-id' })
        const handler = withWebCorrelation(correlation, () => {
            const headers = new Headers({ 'content-type': 'text/plain' })
            headers.set = () => {
                throw new TypeError('immutable')
            }

            return new Response('ok', { headers })
        })

        const response = await handler(new Request('http://localhost/'))
        expect(response.headers.get('x-correlation-id')).toBe('generated-web-id')
        expect(await response.text()).toBe('ok')
    })
})
