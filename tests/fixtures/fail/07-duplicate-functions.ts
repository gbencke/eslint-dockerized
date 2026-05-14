/**
 * FAIL fixture — target rule: sonarjs/no-identical-functions (threshold: 3)
 *
 * Duplicate function bodies are a sign of copy-paste programming. When the
 * same logic appears in two places, a bug fix or behaviour change must be
 * applied in both places. Miss one, and you have an inconsistency that is
 * extremely difficult to debug.
 *
 * The rule fires when two functions have bodies of ≥ 3 lines that are
 * textually identical. The correct fix is always to extract the shared logic
 * into a single named function that both callers use.
 *
 * The two functions below have identical 4-line bodies, which triggers the rule.
 */

// ❌ formatOrderAmount and formatInvoiceAmount are identical — deduplicate them
export const formatOrderAmount = (amount: number, currency: string): string => {
  const rounded = Math.round(amount * 100) / 100;
  const fixed = rounded.toFixed(2);
  const symbol = currency.toUpperCase();
  return `${symbol} ${fixed}`;
};

export const formatInvoiceAmount = (amount: number, currency: string): string => {
  const rounded = Math.round(amount * 100) / 100;  // sonarjs/no-identical-functions
  const fixed = rounded.toFixed(2);
  const symbol = currency.toUpperCase();
  return `${symbol} ${fixed}`;
};
