import { uuidv7 } from '../core/id.js'
import type { CorrelationRuntime } from '../core/types.js'

/** Browser / non-ALS runtime: no ambient context; each call site must pass or generate an ID. */
export function createBrowserRuntime(): CorrelationRuntime {
    return {
        run<T>(_correlationId: string, fn: () => T): T {
            return fn()
        },

        current(): string | undefined {
            return undefined
        },

        defaultIdGenerator(): () => string {
            return uuidv7
        },
    }
}
