/**
 * FAIL fixture — target rule: unicorn/no-for-loop
 *
 * Indexed `for` loops (for (let i = 0; i < arr.length; i++)) are error-prone:
 *   - Off-by-one errors: i <= arr.length vs i < arr.length
 *   - Index arithmetic mistakes in the loop body: arr[i + 1], arr[i - 1]
 *   - Mutation risk: the index variable is mutable
 *   - Verbose: three clauses for a simple iteration
 *
 * The `for-of` loop eliminates all of these:
 *   - No index, no off-by-one
 *   - Correct with any iterable (arrays, Sets, Maps, generators)
 *   - Works with `const` — no mutable loop variable
 *   - Clearer intent: "for each item" vs "for each index"
 *
 * When the index IS needed, Array.prototype.entries() provides it:
 *   for (const [index, item] of items.entries()) { ... }
 *
 * For transformations, map/filter/reduce are often cleaner still.
 */

// ❌ Classic indexed for loop — unicorn/no-for-loop fires
export const joinNames = (names: readonly string[]): string => {
  const parts: string[] = [];
  for (let i = 0; i < names.length; i++) { // no-for-loop
    parts.push(names[i] ?? '');
  }
  return parts.join(', ');
};

// ❌ Indexed loop used to build a lookup — should be reduce or Object.fromEntries
export const indexById = (
  items: ReadonlyArray<{ readonly id: string; readonly label: string }>
): Record<string, string> => {
  const result: Record<string, string> = {};
  for (let i = 0; i < items.length; i++) { // no-for-loop
    const item = items[i];
    if (item !== undefined) {
      result[item.id] = item.label;
    }
  }
  return result;
};
