/**
 * Wrap a plain `node:http` handler.
 *
 *   http.createServer(withCorrelation(correlation, (req, res) => { ... }))
 */
export function withCorrelation(correlation, handler) {
    return (req, res) => {
        const correlationId = correlation.resolve(req.headers);
        if (correlation.echoResponseHeader) {
            res.setHeader(correlation.headerName, correlationId);
        }
        return correlation.run(correlationId, () => handler(req, res));
    };
}
//# sourceMappingURL=node-http.js.map