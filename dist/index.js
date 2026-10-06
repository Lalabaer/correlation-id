import { attachCorrelation } from './adapters/axios.js';
import { expressCorrelation } from './adapters/express.js';
import { fastifyCorrelation } from './adapters/fastify.js';
import { correlationFetch } from './adapters/fetch.js';
import { kafkaHeaders, withKafkaMessage } from './adapters/kafka.js';
import { withCorrelation } from './adapters/node-http.js';
import { withWebCorrelation } from './adapters/web.js';
import { createCorrelation as createCorrelationCore } from './core/correlation.js';
import { assertHeaderName, isValidHeaderName } from './core/header-name.js';
import { isValidCorrelationId, MAX_ID_LENGTH, uuidv7 } from './core/id.js';
import { createNodeRuntime } from './runtime/node.js';
const nodeRuntime = createNodeRuntime();
/** Create a correlation instance backed by Node.js AsyncLocalStorage. */
export function createCorrelation(config = {}) {
    return createCorrelationCore(config, nodeRuntime);
}
export { assertHeaderName, attachCorrelation, correlationFetch, expressCorrelation, fastifyCorrelation, isValidCorrelationId, isValidHeaderName, kafkaHeaders, MAX_ID_LENGTH, uuidv7, withCorrelation, withKafkaMessage, withWebCorrelation, };
//# sourceMappingURL=index.js.map