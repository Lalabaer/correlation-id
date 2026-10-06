const textDecoder = new TextDecoder();
function decodeHeaderValue(value) {
    if (typeof value === 'string') {
        return value;
    }
    if (Array.isArray(value)) {
        const first = value[0];
        return decodeHeaderValue(first);
    }
    if (value instanceof Uint8Array) {
        return textDecoder.decode(value);
    }
    return undefined;
}
/**
 * Read a single header value case-insensitively from Node headers,
 * WHATWG `Headers`, plain objects, or Kafka-style Buffer values.
 */
export function readHeader(headers, name) {
    if (!headers) {
        return undefined;
    }
    if (typeof headers.get === 'function') {
        return headers.get(name) ?? undefined;
    }
    const bag = headers;
    const key = Object.keys(bag).find((candidate) => candidate.toLowerCase() === name.toLowerCase());
    if (key === undefined) {
        return undefined;
    }
    return decodeHeaderValue(bag[key]);
}
//# sourceMappingURL=headers.js.map