import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Correlation } from '../core/types.js';
type NodeHandler = (req: IncomingMessage, res: ServerResponse) => unknown;
/**
 * Wrap a plain `node:http` handler.
 *
 *   http.createServer(withCorrelation(correlation, (req, res) => { ... }))
 */
export declare function withCorrelation(correlation: Correlation, handler: NodeHandler): NodeHandler;
export {};
//# sourceMappingURL=node-http.d.ts.map