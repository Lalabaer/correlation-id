/**
 * Express / Connect middleware. Typed structurally so this package does not
 * depend on Express at runtime.
 *
 *   app.use(expressCorrelation(correlation))
 */
export function expressCorrelation(correlation) {
    return (req, res, next) => {
        const correlationId = correlation.resolve(req.headers);
        if (correlation.echoResponseHeader) {
            res.setHeader(correlation.headerName, correlationId);
        }
        correlation.run(correlationId, () => {
            next();
        });
    };
}
//# sourceMappingURL=express.js.map