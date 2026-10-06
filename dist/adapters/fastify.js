/**
 * Fastify plugin factory.
 *
 *   await app.register(fastifyCorrelation(correlation))
 *   app.get("/", (request) => request.correlationId)
 *
 * The onRequest hook calls `done` inside `run`, so every later hook, the route
 * handler, and any async work they start inherit the AsyncLocalStorage context.
 */
export function fastifyCorrelation(correlation) {
    function plugin(app, _options, done) {
        app.decorateRequest('correlationId', '');
        app.addHook('onRequest', (request, reply, next) => {
            const correlationId = correlation.resolve(request.headers);
            request.correlationId = correlationId;
            if (correlation.echoResponseHeader) {
                reply.header(correlation.headerName, correlationId);
            }
            correlation.run(correlationId, next);
        });
        done();
    }
    Object.assign(plugin, {
        [Symbol.for('skip-override')]: true,
        [Symbol.for('fastify.display-name')]: 'correlation-id',
    });
    return plugin;
}
//# sourceMappingURL=fastify.js.map