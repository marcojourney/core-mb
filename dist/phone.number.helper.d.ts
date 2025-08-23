/** Normalize to a consistent representation (approx. E.164-like):
 * - Keep leading '+' if present
 * - Remove spaces, dashes, parentheses
 * - Remove any non-digit characters except leading '+'
 * - You can adapt to your locale/validation as needed
 */
export declare function normalize(phoneRaw: string): string;
