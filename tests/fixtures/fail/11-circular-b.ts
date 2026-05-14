/**
 * FAIL fixture — target rule: import-x/no-cycle  (file B of a 2-file cycle)
 *
 * B → A → B  (same cycle, detected from both ends)
 *
 * See 11-circular-a.ts for full documentation on why circular dependencies
 * are harmful and how to resolve them.
 *
 * Note: the test runner lints 11-circular-a.ts and verifies that the cycle
 * is detected FROM THAT FILE. ESLint's import-x plugin follows the import
 * graph starting from each linted file, so it finds the cycle when processing
 * either A or B.
 */

// B imports from A — closes the cycle
import { valueFromA } from './11-circular-a'; // ← import-x/no-cycle fires

export const valueFromB = 'module-b';

export const combinedFromB = (): string => `${valueFromB}+${valueFromA}`;
