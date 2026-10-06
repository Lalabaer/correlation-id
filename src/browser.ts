import { createCorrelation as createCorrelationCore } from './core/correlation.js'
import { assertHeaderName, isValidHeaderName } from './core/header-name.js'
import { isValidCorrelationId, MAX_ID_LENGTH, uuidv7 } from './core/id.js'
import type { Correlation, CorrelationConfig, HeaderBag } from './core/types.js'
import { createBrowserRuntime } from './runtime/browser.js'

const browserRuntime = createBrowserRuntime()

/**
 * Create a correlation instance for browser environments (no AsyncLocalStorage).
 * Outgoing adapters generate a fresh ID per request when none is set explicitly.
 */
export function createCorrelation(config: CorrelationConfig = {}): Correlation {
    return createCorrelationCore(config, browserRuntime)
}

export {
    assertHeaderName,
    type Correlation,
    type CorrelationConfig,
    type HeaderBag,
    isValidCorrelationId,
    isValidHeaderName,
    MAX_ID_LENGTH,
    uuidv7,
}
