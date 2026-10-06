/** Platform-neutral bag of inbound headers (HTTP, WHATWG Headers, Kafka, etc.). */
export type HeaderBag =
    | Record<string, string | string[] | Uint8Array | (string | Uint8Array)[] | undefined>
    | { get(name: string): string | null }

export interface CorrelationConfig {
    /** Primary header name (RFC 9110 token). Normalized to lowercase. Default: `x-correlation-id`. */
    headerName?: string
    /** Additional inbound header names checked after `headerName`, in priority order. */
    fallbackHeaders?: readonly string[]
    /** Custom ID generator. Default: UUIDv7 (native when available, otherwise portable fallback). */
    idGenerator?: () => string
    /** Echo the ID in the HTTP response header. Default: `true`. */
    echoResponseHeader?: boolean
}

export interface CorrelationRuntime {
    run<T>(correlationId: string, fn: () => T): T
    current(): string | undefined
    defaultIdGenerator(): () => string
}

export interface Correlation {
    readonly headerName: string
    readonly fallbackHeaders: readonly string[]
    readonly echoResponseHeader: boolean
    resolve(headers?: HeaderBag): string
    current(): string | undefined
    run<T>(correlationId: string, fn: () => T): T
    headers(id?: string): Record<string, string>
    generate(): string
}
