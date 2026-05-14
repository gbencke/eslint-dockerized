/**
 * PASS fixture: Clean TypeScript type-system patterns
 *
 * Demonstrates the type-system practices enforced by the ESLint config:
 *
 *  - No `any` (@typescript-eslint/no-explicit-any, no-unsafe-*)
 *  - Discriminated unions make invalid states unrepresentable
 *  - `satisfies` validates object shape without widening inferred types
 *  - `unknown` used for external data, narrowed with type guards
 *  - Branded nominal types prevent domain semantic confusion
 *  - Exhaustive switch via the `assertNever` pattern
 *  - All exported functions carry explicit return types
 *  - Named exports only (import-x/no-default-export)
 */

// ── Discriminated union: async state ──────────────────────────────────────

type AsyncState<T> =
  | { readonly status: 'idle' }
  | { readonly status: 'loading' }
  | { readonly status: 'success'; readonly data: T }
  | { readonly status: 'error'; readonly error: Error };

// ── assertNever for exhaustiveness ────────────────────────────────────────

const assertNever = (value: never): never => {
  throw new Error(`Unhandled discriminant: ${JSON.stringify(value)}`);
};

// ── Exhaustive switch — compiler guides you to every new union member ──────

const describeState = <T>(state: AsyncState<T>): string => {
  switch (state.status) {
    case 'idle':    return 'Not yet started';
    case 'loading': return 'In progress…';
    case 'success': return `Done — received ${JSON.stringify(state.data)}`;
    case 'error':   return `Failed — ${state.error.message}`;
    default:        return assertNever(state);
  }
};

// ── Branded nominal types ─────────────────────────────────────────────────

declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

type UserId  = Brand<string, 'UserId'>;
type OrderId = Brand<string, 'OrderId'>;

const userId  = (raw: string): UserId  => raw as UserId;
const orderId = (raw: string): OrderId => raw as OrderId;

// TypeScript now distinguishes UserId from OrderId even though both are strings.

const getOrder = (id: OrderId): string => `order:${id}`;

// ── satisfies: validate shape without widening ────────────────────────────

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVEL_LABELS = {
  debug: 'Verbose debugging output',
  info:  'General information',
  warn:  'Potential issues',
  error: 'Critical failures',
} satisfies Record<LogLevel, string>;
// LOG_LEVEL_LABELS.debug is still type `string` (not `string`, widened further)

// ── unknown + type guard: safe external data handling ─────────────────────

type Result<T, E = string> =
  | { readonly ok: true;  readonly value: T }
  | { readonly ok: false; readonly error: E };

const parsePositiveNumber = (raw: unknown): Result<number> => {
  if (typeof raw !== 'number' || !Number.isFinite(raw)) {
    return { ok: false, error: `Expected finite number, got ${typeof raw}` };
  }
  if (raw <= 0) {
    return { ok: false, error: `Expected positive number, got ${raw}` };
  }
  return { ok: true, value: raw };
};

// ── Named exports ─────────────────────────────────────────────────────────

export {
  describeState,
  parsePositiveNumber,
  getOrder,
  userId,
  orderId,
  LOG_LEVEL_LABELS,
};

export type { AsyncState, UserId, OrderId, Result, LogLevel };
