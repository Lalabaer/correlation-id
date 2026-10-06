import { attachCorrelation } from './adapters/axios.js';
import { expressCorrelation } from './adapters/express.js';
import { fastifyCorrelation } from './adapters/fastify.js';
import { correlationFetch } from './adapters/fetch.js';
import { kafkaHeaders, withKafkaMessage } from './adapters/kafka.js';
import { withCorrelation } from './adapters/node-http.js';
import { withWebCorrelation } from './adapters/web.js';
import { assertHeaderName, isValidHeaderName } from './core/header-name.js';
import { isValidCorrelationId, MAX_ID_LENGTH, uuidv7 } from './core/id.js';
import type { Correlation, CorrelationConfig, HeaderBag } from './core/types.js';
/** Create a correlation instance backed by Node.js AsyncLocalStorage. */
export declare function createCorrelation(config?: CorrelationConfig): Correlation;
export { assertHeaderName, attachCorrelation, type Correlation, type CorrelationConfig, correlationFetch, expressCorrelation, fastifyCorrelation, type HeaderBag, isValidCorrelationId, isValidHeaderName, kafkaHeaders, MAX_ID_LENGTH, uuidv7, withCorrelation, withKafkaMessage, withWebCorrelation, };
//# sourceMappingURL=index.d.ts.map