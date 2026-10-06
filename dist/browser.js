import { attachCorrelation } from './adapters/axios.js';
import { correlationFetch } from './adapters/fetch.js';
import { createCorrelation as createCorrelationCore } from './core/correlation.js';
import { assertHeaderName, isValidHeaderName } from './core/header-name.js';
import { isValidCorrelationId, MAX_ID_LENGTH, uuidv7 } from './core/id.js';
import { createBrowserRuntime } from './runtime/browser.js';
const browserRuntime = createBrowserRuntime();
/**
 * Create a correlation instance for browser environments (no AsyncLocalStorage).
 * Outgoing adapters generate a fresh ID per request when none is set explicitly.
 */
export function createCorrelation(config = {}) {
    return createCorrelationCore(config, browserRuntime);
}
export { assertHeaderName, attachCorrelation, correlationFetch, isValidCorrelationId, isValidHeaderName, MAX_ID_LENGTH, uuidv7, };
//# sourceMappingURL=browser.js.map