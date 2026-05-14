/**
 * FAIL fixture — target rule: import-x/no-cycle  (file A of a 2-file cycle)
 *
 * A → B → A  (circular dependency)
 *
 * Circular imports cause one module to be in a partially-initialised state
 * when the other module first accesses it. In CommonJS this silently returns
 * `{}` or `undefined` for values that haven't been assigned yet; in ESM the
 * import binding exists but the value may be `undefined` at the time of first
 * access — causing "X is not a function" or "Cannot read properties of
 * undefined" errors that are extremely hard to trace back to a cycle.
 *
 * The import-x/no-cycle rule detects cycles statically, at lint time.
 * maxDepth: Infinity in the config means ALL transitive cycles are caught,
 * not just direct A→A self-imports.
 *
 * Common remedies:
 *   1. Extract the shared type/value to a third neutral module
 *   2. Invert the dependency via a callback / dependency injection parameter
 *   3. Merge the two modules if they logically form a single unit
 */

// A imports from B — and B imports from A → cycle detected here
import { valueFromB } from './11-circular-b'; // ← import-x/no-cycle fires

export const valueFromA = 'module-a';

export const combinedFromA = (): string => `${valueFromA}+${valueFromB}`;
