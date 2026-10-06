/**
 * Generate a UUID version 7 (RFC 9562) using `globalThis.crypto.getRandomValues`.
 *
 * Layout (128 bits):
 *   48 bits  Unix timestamp in milliseconds
 *    4 bits  version (0b0111)
 *   12 bits  random
 *    2 bits  variant (0b10)
 *   62 bits  random
 *
 * Portable across Node and browsers. Prefer `crypto.randomUUIDv7()` via the Node
 * runtime when available (Node >= 24.16 / 26.1).
 */
export declare function uuidv7(now?: number): string;
/** Longest inbound ID we accept. Long enough for any UUID/ULID/KSUID format. */
export declare const MAX_ID_LENGTH = 128;
/**
 * Is `value` safe to adopt as a correlation ID?
 *
 * Inbound IDs come from clients and end up in every log line, so they are
 * untrusted input: only a conservative character set and a bounded length are
 * accepted. That blocks log injection (newlines, quotes, ANSI escapes) and
 * memory abuse via huge headers. Anything else is replaced by a fresh ID.
 */
export declare function isValidCorrelationId(value: unknown): value is string;
//# sourceMappingURL=id.d.ts.map