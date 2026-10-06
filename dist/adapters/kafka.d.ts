import type { Correlation, HeaderBag } from '../core/types.js';
/**
 * Headers to add to an outgoing Kafka (or similar) message.
 * Priority: explicit `id` > current context > newly generated ID.
 */
export declare function kafkaHeaders(correlation: Correlation, id?: string): Record<string, string>;
interface KafkaMessageLike {
    headers?: HeaderBag;
}
interface EachMessagePayloadLike {
    topic: string;
    partition: number;
    message: KafkaMessageLike;
    heartbeat?(): Promise<void>;
    pause?(): () => void;
}
type EachMessageHandler = (payload: EachMessagePayloadLike) => Promise<void>;
/**
 * Wrap a kafkajs-style `eachMessage` handler so processing runs inside the
 * correlation context. Buffer/Uint8Array header values are decoded automatically.
 *
 *   consumer.run({ eachMessage: withKafkaMessage(correlation, handle) })
 */
export declare function withKafkaMessage(correlation: Correlation, handler: EachMessageHandler): EachMessageHandler;
export {};
//# sourceMappingURL=kafka.d.ts.map