import { attachCorrelation } from './adapters/axios.js';
import { correlationFetch } from './adapters/fetch.js';
import { assertHeaderName, isValidHeaderName } from './core/header-name.js';
import { isValidCorrelationId, MAX_ID_LENGTH, uuidv7 } from './core/id.js';
import type { Correlation, CorrelationConfig, HeaderBag } from './core/types.js';
/**
 * Create a correlation instance for browser environments (no AsyncLocalStorage).
 * Outgoing adapters generate a fresh ID per request when none is set explicitly.
 */
export declare function createCorrelation(config?: CorrelationConfig): Correlation;
export { assertHeaderName, attachCorrelation, type Correlation, type CorrelationConfig, correlationFetch, type HeaderBag, isValidCorrelationId, isValidHeaderName, MAX_ID_LENGTH, uuidv7, };
//# sourceMappingURL=browser.d.ts.map