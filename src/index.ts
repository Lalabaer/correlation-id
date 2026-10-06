import { expressCorrelation } from './adapters/express.js'
import { fastifyCorrelation } from './adapters/fastify.js'
import { withCorrelation } from './adapters/node-http.js'
import { withWebCorrelation } from './adapters/web.js'
import { createCorrelation as createCorrelationCore } from './core/correlation.js'
import { assertHeaderName, isValidHeaderName } from './core/header-name.js'
import { isValidCorrelationId, MAX_ID_LENGTH, uuidv7 } from './core/id.js'
import type { Correlation, CorrelationConfig, HeaderBag } from './core/types.js'
import { createNodeRuntime } from './runtime/node.js'

const nodeRuntime = createNodeRuntime()

/** Create a correlation instance backed by Node.js AsyncLocalStorage. */
export function createCorrelation(config: CorrelationConfig = {}): Correlation {
    return createCorrelationCore(config, nodeRuntime)
}

export {
    assertHeaderName,
    type Correlation,
    type CorrelationConfig,
    expressCorrelation,
    fastifyCorrelation,
    type HeaderBag,
    isValidCorrelationId,
    isValidHeaderName,
    MAX_ID_LENGTH,
    uuidv7,
    withCorrelation,
    withWebCorrelation,
}
