import type { IncomingMessage, ServerResponse } from 'node:http'

import type { Correlation } from '../core/types.js'

type NextFunction = (err?: unknown) => void

/**
 * Express / Connect middleware. Typed structurally so this package does not
 * depend on Express at runtime.
 *
 *   app.use(expressCorrelation(correlation))
 */
export function expressCorrelation(correlation: Correlation) {
    return (req: IncomingMessage, res: ServerResponse, next: NextFunction): void => {
        const correlationId = correlation.resolve(req.headers)

        if (correlation.echoResponseHeader) {
            res.setHeader(correlation.headerName, correlationId)
        }

        correlation.run(correlationId, () => {
            next()
        })
    }
}
