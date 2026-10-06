import type { IncomingHttpHeaders } from 'node:http'

import type { Correlation } from '../core/types.js'

interface FastifyLikeRequest {
    headers: IncomingHttpHeaders
    correlationId?: string
}

interface FastifyLikeReply {
    header(name: string, value: string): unknown
}

interface FastifyLikeInstance {
    addHook(
        name: 'onRequest',
        hook: (request: FastifyLikeRequest, reply: FastifyLikeReply, done: () => void) => void,
    ): unknown
    decorateRequest(name: 'correlationId', value: string): unknown
}

/**
 * Fastify plugin factory.
 *
 *   await app.register(fastifyCorrelation(correlation))
 *   app.get("/", (request) => request.correlationId)
 *
 * The onRequest hook calls `done` inside `run`, so every later hook, the route
 * handler, and any async work they start inherit the AsyncLocalStorage context.
 */
export function fastifyCorrelation(correlation: Correlation) {
    function plugin(app: FastifyLikeInstance, _options: unknown, done: () => void): void {
        app.decorateRequest('correlationId', '')
        app.addHook('onRequest', (request, reply, next) => {
            const correlationId = correlation.resolve(request.headers)
            request.correlationId = correlationId

            if (correlation.echoResponseHeader) {
                reply.header(correlation.headerName, correlationId)
            }

            correlation.run(correlationId, next)
        })
        done()
    }

    Object.assign(plugin, {
        [Symbol.for('skip-override')]: true,
        [Symbol.for('fastify.display-name')]: 'correlation-id',
    })

    return plugin
}
