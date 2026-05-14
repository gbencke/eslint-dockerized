/**
 * FAIL fixture — target rule: functional/immutable-data
 *
 * Direct mutation of objects and arrays creates aliasing bugs: two different
 * pieces of code hold references to the same object, and one unexpectedly
 * modifies it while the other assumes it is unchanged. These bugs are
 * notoriously hard to reproduce and debug because the mutation happens in a
 * different call frame than the observation of the corrupted state.
 *
 * The rule flags:
 *   - Property assignment on objects  (obj.prop = value)
 *   - Index assignment on arrays      (arr[0] = value)
 *   - Mutating array methods          (arr.push, pop, splice, sort, reverse…)
 *   - Property deletion               (delete obj.prop)
 *
 * Correct alternatives:
 *   - Object spread:  { ...obj, prop: newValue }
 *   - Array spread:   [...arr, newItem]
 *   - Immutable methods: arr.toSorted(), arr.toReversed(), arr.toSpliced()
 *   - Array.prototype.with() for index replacement
 */

interface Config {
  readonly timeout: number;
  readonly retries: number;
  readonly endpoint: string;
}

// ❌ Mutating a function parameter — the caller's object is modified in place
export const applyDefaults = (config: Config): void => {
  (config as { timeout: number }).timeout = config.timeout > 0 ? config.timeout : 5000; // immutable-data
};

// ❌ Pushing to an array parameter — mutates the caller's array
export const appendError = (log: string[], message: string): void => {
  log.push(message); // immutable-data — push mutates in place
};

// ❌ Sorting an array in place — toSorted() is the immutable alternative
export const sortDescending = (values: number[]): number[] => {
  values.sort((a, b) => b - a); // immutable-data — sort mutates in place
  return values;
};

// ❌ Index assignment
export const replaceFirst = (items: string[], replacement: string): void => {
  items[0] = replacement; // immutable-data — index assignment mutates
};
