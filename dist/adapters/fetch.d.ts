import type { Correlation } from '../core/types.js';
type Fetch = typeof globalThis.fetch;
/**
 * Wrap `fetch` so every outgoing request carries a correlation ID.
 * Priority: explicit header on the request > current context > newly generated ID.
 * An explicit header set by the caller is never overwritten.
 *
 *   const fetch = correlationFetch(correlation)
 *   await fetch("http://payments/charges", { method: "POST", body })
 */
export declare function correlationFetch(correlation: Correlation, fetchImpl?: Fetch): Fetch;
export {};
//# sourceMappingURL=fetch.d.ts.map