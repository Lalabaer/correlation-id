import type { Correlation } from '../core/types.js';
type WebHandler = (request: Request) => Response | Promise<Response>;
/**
 * Wrap a WHATWG Fetch API handler (Next.js App Router route handlers, Hono, etc.).
 *
 *   export const GET = withWebCorrelation(correlation, async (request) => {
 *     return Response.json({ id: correlation.current() })
 *   })
 */
export declare function withWebCorrelation(correlation: Correlation, handler: WebHandler): WebHandler;
export {};
//# sourceMappingURL=web.d.ts.map