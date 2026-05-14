/**
 * FAIL fixture — target rule: functional/no-let
 *
 * `let` declarations introduce mutable bindings. Every `let` is a declaration
 * of intent to reassign the variable over its lifetime. When a variable is
 * never actually reassigned, `let` is misleading and `const` should be used
 * instead. When a variable IS reassigned, the code is usually better expressed
 * as a pure transformation (map, reduce, recursion) that avoids mutable state
 * entirely.
 *
 * The rule bans ALL `let` declarations regardless of whether the variable is
 * actually reassigned. This forces developers to choose between:
 *   a) Using `const` for values that don't change
 *   b) Restructuring mutable accumulation as pure expressions
 *
 * Correct alternatives:
 *   - `const` for variables that don't need reassignment
 *   - Array.prototype.reduce() for accumulations
 *   - Recursive functions for iterative computation
 *   - Immutable update patterns (spread) for state changes
 */

// ❌ let accumulator that could be expressed as reduce()
export const sumPrices = (prices: readonly number[]): number => {
  let total = 0; // functional/no-let
  for (const price of prices) {
    total += price;
  }
  return total;
};

// ❌ let variable that is effectively const (never reassigned)
export const getLabel = (code: string): string => {
  let prefix = 'ITEM'; // functional/no-let — never reassigned, should be const
  return `${prefix}-${code}`;
};

// ❌ let flag used as a stateful accumulator
export const hasExpired = (timestamps: readonly number[], cutoff: number): boolean => {
  let expired = false; // functional/no-let
  for (const ts of timestamps) {
    if (ts < cutoff) {
      expired = true;
    }
  }
  return expired;
};
