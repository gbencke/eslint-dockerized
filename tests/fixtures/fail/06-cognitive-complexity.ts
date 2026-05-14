/**
 * FAIL fixture — target rule: sonarjs/cognitive-complexity (threshold: 15)
 *
 * Cognitive complexity measures how hard a function is to understand and
 * maintain. Unlike cyclomatic complexity (which just counts paths), cognitive
 * complexity weighs NESTING: each structural element adds 1 + the current
 * nesting depth. A function deeply nested in if/for/switch blocks is much
 * harder to follow than a flat function with the same number of branches.
 *
 * The config enforces a limit of 15. Functions above that threshold must be
 * decomposed into smaller, named functions — each of which is individually
 * understandable.
 *
 * The function below has a cognitive complexity of approximately 22:
 *
 *   if (value < min)          → +1 (depth 0)  = 1
 *   if (strict)               → +2 (depth 1)  = 3
 *   if (value < min - step)   → +3 (depth 2)  = 6
 *   else if (value > max)     → +1 (depth 0)  = 7
 *   if (strict)               → +2 (depth 1)  = 9
 *   if (value > max + step)   → +3 (depth 2)  = 12
 *   else                      → +1 (depth 0)  = 13
 *   if (strict)               → +2 (depth 1)  = 15
 *   if (value === min)        → +3 (depth 2)  = 18
 *   else if (value === max)   → +1 (depth 2)  = 19
 *   if (...% step === 0)      → +4 (depth 3)  = 23  ← well above 15
 */

interface RangeConfig {
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly strict: boolean;
}

// ❌ Too complex — sonarjs/cognitive-complexity fires
export const categorize = (value: number, config: RangeConfig): string => {
  if (value < config.min) {
    if (config.strict) {
      if (value < config.min - config.step) {
        return 'far-below';
      }
      return 'below';
    }
    return 'under-minimum';
  } else if (value > config.max) {
    if (config.strict) {
      if (value > config.max + config.step) {
        return 'far-above';
      }
      return 'above';
    }
    return 'over-maximum';
  } else {
    if (config.strict) {
      if (value === config.min) {
        return 'at-minimum';
      } else if (value === config.max) {
        return 'at-maximum';
      }
      if ((value - config.min) % config.step === 0) {
        return 'on-step';
      }
      return 'between-steps';
    }
    return 'in-range';
  }
};
