/**
 * Wrap `fetch` so every outgoing request carries a correlation ID.
 * Priority: explicit header on the request > current context > newly generated ID.
 * An explicit header set by the caller is never overwritten.
 *
 *   const fetch = correlationFetch(correlation)
 *   await fetch("http://payments/charges", { method: "POST", body })
 */
export function correlationFetch(correlation, fetchImpl = globalThis.fetch) {
    return (input, init = {}) => {
        const headers = new Headers(init.headers ?? (input instanceof Request ? input.headers : undefined));
        if (!headers.has(correlation.headerName)) {
            const correlationId = correlation.current() ?? correlation.generate();
            headers.set(correlation.headerName, correlationId);
        }
        return fetchImpl(input, { ...init, headers });
    };
}
//# sourceMappingURL=fetch.js.map