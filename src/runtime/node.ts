import { AsyncLocalStorage } from 'node:async_hooks'

import { uuidv7 } from '../core/id.js'
import type { CorrelationRuntime } from '../core/types.js'

interface CorrelationStore {
    readonly correlationId: string
}

const storage = new AsyncLocalStorage<CorrelationStore>()

type RandomUUIDv7 = () => string

interface CryptoModule {
    randomUUIDv7?: RandomUUIDv7
}

/**
 * Prefer native `crypto.randomUUIDv7` (Node >= 24.16 / 26.1) when present.
 * Loaded via `process.getBuiltinModule` so a named import does not fail to link
 * on older Node versions, and Edge runtimes that lack `node:crypto` stay safe.
 */
function resolveNativeUUIDv7(): RandomUUIDv7 | undefined {
    type ProcessWithBuiltin = NodeJS.Process & { getBuiltinModule?: (id: string) => unknown }
    const proc = process as ProcessWithBuiltin

    if (typeof proc.getBuiltinModule !== 'function') {
        return undefined
    }

    try {
        const cryptoModule = proc.getBuiltinModule('node:crypto') as CryptoModule | undefined
        const fn = cryptoModule?.randomUUIDv7

        if (typeof fn === 'function') {
            return () => fn()
        }
    } catch {
        // Edge / restricted runtimes may reject node:crypto.
    }

    return undefined
}

const nativeUUIDv7 = resolveNativeUUIDv7()

export function createNodeRuntime(): CorrelationRuntime {
    return {
        run<T>(correlationId: string, fn: () => T): T {
            return storage.run({ correlationId }, fn)
        },

        current(): string | undefined {
            return storage.getStore()?.correlationId
        },

        defaultIdGenerator(): () => string {
            return nativeUUIDv7 ?? uuidv7
        },
    }
}
