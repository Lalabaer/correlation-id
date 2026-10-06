import { uuidv7 } from './id.js';
import type { Correlation, CorrelationConfig, CorrelationRuntime } from './types.js';
declare const DEFAULT_HEADER_NAME = "x-correlation-id";
declare const DEFAULT_FALLBACK_HEADERS: readonly string[];
export declare function createCorrelation(config: CorrelationConfig | undefined, runtime: CorrelationRuntime): Correlation;
export { DEFAULT_FALLBACK_HEADERS, DEFAULT_HEADER_NAME, uuidv7 };
//# sourceMappingURL=correlation.d.ts.map