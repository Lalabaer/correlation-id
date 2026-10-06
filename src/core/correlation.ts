import { assertHeaderName } from './header-name.js'
import { readHeader } from './headers.js'
import { isValidCorrelationId, uuidv7 } from './id.js'
import type { Correlation, CorrelationConfig, CorrelationRuntime, HeaderBag } from './types.js'

const DEFAULT_HEADER_NAME = 'x-correlation-id'
const DEFAULT_FALLBACK_HEADERS: readonly string[] = ['x-request-id']

export function createCorrelation(config: CorrelationConfig = {}, runtime: CorrelationRuntime): Correlation {
    const headerName = assertHeaderName(config.headerName ?? DEFAULT_HEADER_NAME, 'headerName')
    const fallbackHeaders = (config.fallbackHeaders ?? DEFAULT_FALLBACK_HEADERS).map((name, index) =>
        assertHeaderName(name, `fallbackHeaders[${String(index)}]`),
    )
    const generate = config.idGenerator ?? runtime.defaultIdGenerator()
    const echoResponseHeader = config.echoResponseHeader ?? true

    return {
        headerName,
        fallbackHeaders,
        echoResponseHeader,

        resolve(headers?: HeaderBag): string {
            for (const name of [headerName, ...fallbackHeaders]) {
                const value = readHeader(headers, name)

                if (isValidCorrelationId(value)) {
                    return value
                }
            }

            return generate()
        },

        current(): string | undefined {
            return runtime.current()
        },

        run<T>(correlationId: string, fn: () => T): T {
            return runtime.run(correlationId, fn)
        },

        headers(id?: string): Record<string, string> {
            const correlationId = id ?? runtime.current() ?? generate()
            return { [headerName]: correlationId }
        },

        generate,
    }
}

export { DEFAULT_FALLBACK_HEADERS, DEFAULT_HEADER_NAME, uuidv7 }
