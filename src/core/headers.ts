import type { HeaderBag } from './types.js'

const textDecoder = new TextDecoder()

function decodeHeaderValue(value: unknown): string | undefined {
    if (typeof value === 'string') {
        return value
    }

    if (Array.isArray(value)) {
        const first: unknown = value[0]
        return decodeHeaderValue(first)
    }

    if (value instanceof Uint8Array) {
        return textDecoder.decode(value)
    }

    return undefined
}

/**
 * Read a single header value case-insensitively from Node headers,
 * WHATWG `Headers`, plain objects, or Kafka-style Buffer values.
 */
export function readHeader(headers: HeaderBag | undefined, name: string): string | undefined {
    if (!headers) {
        return undefined
    }

    if (typeof (headers as { get?: unknown }).get === 'function') {
        return (headers as { get(name: string): string | null }).get(name) ?? undefined
    }

    const bag = headers as Record<string, unknown>
    const key = Object.keys(bag).find((candidate) => candidate.toLowerCase() === name.toLowerCase())

    if (key === undefined) {
        return undefined
    }

    return decodeHeaderValue(bag[key])
}
