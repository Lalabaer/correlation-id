import type { HeaderBag } from './types.js';
/**
 * Read a single header value case-insensitively from Node headers,
 * WHATWG `Headers`, plain objects, or Kafka-style Buffer values.
 */
export declare function readHeader(headers: HeaderBag | undefined, name: string): string | undefined;
//# sourceMappingURL=headers.d.ts.map