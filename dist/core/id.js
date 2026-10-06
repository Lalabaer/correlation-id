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
export function uuidv7(now = Date.now()) {
    const bytes = new Uint8Array(16);
    globalThis.crypto.getRandomValues(bytes);
    // 48-bit big-endian timestamp. Split because bitwise operators work on 32-bit ints.
    const high = Math.floor(now / 2 ** 32);
    const low = now >>> 0;
    bytes[0] = (high >>> 8) & 0xff;
    bytes[1] = high & 0xff;
    bytes[2] = (low >>> 24) & 0xff;
    bytes[3] = (low >>> 16) & 0xff;
    bytes[4] = (low >>> 8) & 0xff;
    bytes[5] = low & 0xff;
    bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x70; // version 7
    bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80; // variant 10xx
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
/** Longest inbound ID we accept. Long enough for any UUID/ULID/KSUID format. */
export const MAX_ID_LENGTH = 128;
const SAFE_ID = /^[A-Za-z0-9._:-]+$/;
/**
 * Is `value` safe to adopt as a correlation ID?
 *
 * Inbound IDs come from clients and end up in every log line, so they are
 * untrusted input: only a conservative character set and a bounded length are
 * accepted. That blocks log injection (newlines, quotes, ANSI escapes) and
 * memory abuse via huge headers. Anything else is replaced by a fresh ID.
 */
export function isValidCorrelationId(value) {
    return typeof value === 'string' && value.length > 0 && value.length <= MAX_ID_LENGTH && SAFE_ID.test(value);
}
//# sourceMappingURL=id.js.map