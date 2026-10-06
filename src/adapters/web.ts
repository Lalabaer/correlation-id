import type { Correlation } from '../core/types.js'

type WebHandler = (request: Request) => Response | Promise<Response>

/**
 * Wrap a WHATWG Fetch API handler (Next.js App Router route handlers, Hono, etc.).
 *
 *   export const GET = withWebCorrelation(correlation, async (request) => {
 *     return Response.json({ id: correlation.current() })
 *   })
 */
export function withWebCorrelation(correlation: Correlation, handler: WebHandler): WebHandler {
    return async (request) => {
        const correlationId = correlation.resolve(request.headers)

        return correlation.run(correlationId, async () => {
            const response = await handler(request)

            if (!correlation.echoResponseHeader) {
                return response
            }

            try {
                response.headers.set(correlation.headerName, correlationId)

                return response
            } catch {
                // Some Responses ship immutable headers; rebuild with the echo header.
                const headers = new Headers(response.headers)
                headers.set(correlation.headerName, correlationId)

                return new Response(response.body, {
                    status: response.status,
                    statusText: response.statusText,
                    headers,
                })
            }
        })
    }
}
