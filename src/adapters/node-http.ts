import type { IncomingMessage, ServerResponse } from 'node:http'

import type { Correlation } from '../core/types.js'

type NodeHandler = (req: IncomingMessage, res: ServerResponse) => unknown

/**
 * Wrap a plain `node:http` handler.
 *
 *   http.createServer(withCorrelation(correlation, (req, res) => { ... }))
 */
export function withCorrelation(correlation: Correlation, handler: NodeHandler): NodeHandler {
    return (req, res) => {
        const correlationId = correlation.resolve(req.headers)

        if (correlation.echoResponseHeader) {
            res.setHeader(correlation.headerName, correlationId)
        }

        return correlation.run(correlationId, () => handler(req, res))
    }
}
