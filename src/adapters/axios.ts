import type { Correlation } from '../core/types.js'

interface AxiosHeadersLike {
    has?(name: string): boolean
    set?(name: string, value: string): unknown
}

interface AxiosRequestConfigLike {
    headers?: AxiosHeadersLike | Record<string, unknown>
}

interface AxiosInstanceLike {
    interceptors: {
        request: {
            use(onFulfilled: (config: AxiosRequestConfigLike) => AxiosRequestConfigLike): number
        }
    }
}

function hasHeaderMethod(
    headers: AxiosHeadersLike | Record<string, unknown>,
): headers is AxiosHeadersLike & { has: (name: string) => boolean } {
    return typeof (headers as AxiosHeadersLike).has === 'function'
}

function hasSetMethod(
    headers: AxiosHeadersLike | Record<string, unknown>,
): headers is AxiosHeadersLike & { set: (name: string, value: string) => unknown } {
    return typeof (headers as AxiosHeadersLike).set === 'function'
}

function headerAlreadySet(headers: AxiosHeadersLike | Record<string, unknown> | undefined, name: string): boolean {
    if (!headers) {
        return false
    }

    if (hasHeaderMethod(headers)) {
        return headers.has(name)
    }

    const bag = headers as Record<string, unknown>
    return Object.keys(bag).some((key) => key.toLowerCase() === name.toLowerCase() && bag[key] != null)
}

function setHeader(headers: AxiosHeadersLike | Record<string, unknown>, name: string, value: string): void {
    if (hasSetMethod(headers)) {
        headers.set(name, value)

        return
    }

    ;(headers as Record<string, unknown>)[name] = value
}

/**
 * Attach a request interceptor that injects the correlation ID.
 * An explicit header already present on the request is never overwritten.
 *
 *   attachCorrelation(correlation, axios.create())
 */
export function attachCorrelation<T>(correlation: Correlation, axiosInstance: T): T {
    const instance = axiosInstance as T & AxiosInstanceLike
    instance.interceptors.request.use((config) => {
        const headers = config.headers ?? {}

        if (!headerAlreadySet(headers, correlation.headerName)) {
            const correlationId = correlation.current() ?? correlation.generate()
            setHeader(headers, correlation.headerName, correlationId)
            config.headers = headers
        }

        return config
    })

    return axiosInstance
}
