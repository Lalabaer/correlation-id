export declare function isValidHeaderName(value: unknown): value is string;
/**
 * Normalize a header name to lowercase after validating it as an RFC 9110 token.
 * Throws `TypeError` for empty strings, spaces, colons, or other invalid characters.
 */
export declare function assertHeaderName(value: unknown, label?: string): string;
//# sourceMappingURL=header-name.d.ts.map