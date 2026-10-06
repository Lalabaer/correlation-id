/**
 * Headers to add to an outgoing Kafka (or similar) message.
 * Priority: explicit `id` > current context > newly generated ID.
 */
export function kafkaHeaders(correlation, id) {
    return correlation.headers(id);
}
/**
 * Wrap a kafkajs-style `eachMessage` handler so processing runs inside the
 * correlation context. Buffer/Uint8Array header values are decoded automatically.
 *
 *   consumer.run({ eachMessage: withKafkaMessage(correlation, handle) })
 */
export function withKafkaMessage(correlation, handler) {
    return async (payload) => {
        const correlationId = correlation.resolve(payload.message.headers);
        await correlation.run(correlationId, () => handler(payload));
    };
}
//# sourceMappingURL=kafka.js.map