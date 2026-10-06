import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Correlation } from '../core/types.js';
type NextFunction = (err?: unknown) => void;
/**
 * Express / Connect middleware. Typed structurally so this package does not
 * depend on Express at runtime.
 *
 *   app.use(expressCorrelation(correlation))
 */
export declare function expressCorrelation(correlation: Correlation): (req: IncomingMessage, res: ServerResponse, next: NextFunction) => void;
export {};
//# sourceMappingURL=express.d.ts.map