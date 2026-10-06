function hasHeaderMethod(headers) {
    return typeof headers.has === 'function';
}
function hasSetMethod(headers) {
    return typeof headers.set === 'function';
}
function headerAlreadySet(headers, name) {
    if (!headers) {
        return false;
    }
    if (hasHeaderMethod(headers)) {
        return headers.has(name);
    }
    const bag = headers;
    return Object.keys(bag).some((key) => key.toLowerCase() === name.toLowerCase() && bag[key] != null);
}
function setHeader(headers, name, value) {
    if (hasSetMethod(headers)) {
        headers.set(name, value);
        return;
    }
    ;
    headers[name] = value;
}
/**
 * Attach a request interceptor that injects the correlation ID.
 * An explicit header already present on the request is never overwritten.
 *
 *   attachCorrelation(correlation, axios.create())
 */
export function attachCorrelation(correlation, axiosInstance) {
    const instance = axiosInstance;
    instance.interceptors.request.use((config) => {
        const headers = config.headers ?? {};
        if (!headerAlreadySet(headers, correlation.headerName)) {
            const correlationId = correlation.current() ?? correlation.generate();
            setHeader(headers, correlation.headerName, correlationId);
            config.headers = headers;
        }
        return config;
    });
    return axiosInstance;
}
//# sourceMappingURL=axios.js.map