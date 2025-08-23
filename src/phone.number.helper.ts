/** Normalize to a consistent representation (approx. E.164-like):
 * - Keep leading '+' if present
 * - Remove spaces, dashes, parentheses
 * - Remove any non-digit characters except leading '+'
 * - You can adapt to your locale/validation as needed
 */
export function normalize(phoneRaw: string): string {
  if (!phoneRaw) return "";
  const trimmed = phoneRaw.trim();
  const hasPlus = trimmed.startsWith("+");
  const digitsOnly = trimmed.replace(/[^\d]/g, "");
  return hasPlus ? `+${digitsOnly}` : digitsOnly; // store either "+855123..." or "0123..."
}
