import { AsyncLocalStorage } from 'node:async_hooks';
import { uuidv7 } from '../core/id.js';
const storage = new AsyncLocalStorage();
/**
 * Prefer native `crypto.randomUUIDv7` (Node >= 24.16 / 26.1) when present.
 * Loaded via `process.getBuiltinModule` so a named import does not fail to link
 * on older Node versions, and Edge runtimes that lack `node:crypto` stay safe.
 */
function resolveNativeUUIDv7() {
    const proc = process;
    if (typeof proc.getBuiltinModule !== 'function') {
        return undefined;
    }
    try {
        const cryptoModule = proc.getBuiltinModule('node:crypto');
        const fn = cryptoModule?.randomUUIDv7;
        if (typeof fn === 'function') {
            return () => fn();
        }
    }
    catch {
        // Edge / restricted runtimes may reject node:crypto.
    }
    return undefined;
}
const nativeUUIDv7 = resolveNativeUUIDv7();
export function createNodeRuntime() {
    return {
        run(correlationId, fn) {
            return storage.run({ correlationId }, fn);
        },
        current() {
            return storage.getStore()?.correlationId;
        },
        defaultIdGenerator() {
            return nativeUUIDv7 ?? uuidv7;
        },
    };
}
//# sourceMappingURL=node.js.map