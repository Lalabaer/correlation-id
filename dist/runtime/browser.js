import { uuidv7 } from '../core/id.js';
/** Browser / non-ALS runtime: no ambient context; each call site must pass or generate an ID. */
export function createBrowserRuntime() {
    return {
        run(_correlationId, fn) {
            return fn();
        },
        current() {
            return undefined;
        },
        defaultIdGenerator() {
            return uuidv7;
        },
    };
}
//# sourceMappingURL=browser.js.map