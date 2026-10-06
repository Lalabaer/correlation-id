import type { Correlation } from '../core/types.js';
/**
 * Attach a request interceptor that injects the correlation ID.
 * An explicit header already present on the request is never overwritten.
 *
 *   attachCorrelation(correlation, axios.create())
 */
export declare function attachCorrelation<T>(correlation: Correlation, axiosInstance: T): T;
//# sourceMappingURL=axios.d.ts.map