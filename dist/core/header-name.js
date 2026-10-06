/** RFC 9110 token: 1*tchar, excluding separators. */
const HEADER_TOKEN = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
export function isValidHeaderName(value) {
    return typeof value === 'string' && value.length > 0 && HEADER_TOKEN.test(value);
}
/**
 * Normalize a header name to lowercase after validating it as an RFC 9110 token.
 * Throws `TypeError` for empty strings, spaces, colons, or other invalid characters.
 */
export function assertHeaderName(value, label = 'headerName') {
    if (!isValidHeaderName(value)) {
        throw new TypeError(`Invalid ${label}: expected a non-empty RFC 9110 token (e.g. "x-correlation-id"), got ${JSON.stringify(value)}`);
    }
    return value.toLowerCase();
}
//# sourceMappingURL=header-name.js.map