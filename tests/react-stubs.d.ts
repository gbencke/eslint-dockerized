/**
 * Minimal type stubs that allow the test fixture .tsx files to be parsed and
 * type-checked by TypeScript without @types/react being installed in the image.
 *
 * Only the hooks and types used inside the fixture files are declared here.
 * Precision is intentionally sacrificed for brevity — these stubs satisfy the
 * TypeScript compiler for linting purposes, not for production use.
 *
 * JSX support: tsconfig.json uses "jsx": "preserve" which delegates JSX
 * transformation to the bundler. TypeScript only needs the JSX namespace to
 * assign types to JSX expressions; it does NOT need a jsx-runtime module.
 */

// ── React module stub ──────────────────────────────────────────────────────

declare module 'react' {
  // useState: typed overload so explicit generics work (e.g. useState<string>(''))
  export function useState<S>(initialState: S | (() => S)): [S, (value: S | ((prev: S) => S)) => void];

  // useEffect: matches the real signature for exhaustive-deps analysis
  export function useEffect(
    effect: () => void | (() => void),
    deps?: readonly unknown[]
  ): void;

  // useCallback: preserves the callback type so exhaustive-deps can analyse deps
  export function useCallback<T extends (...args: readonly unknown[]) => unknown>(
    callback: T,
    deps: readonly unknown[]
  ): T;

  export function useMemo<T>(factory: () => T, deps: readonly unknown[]): T;

  export function useRef<T>(initialValue: T): { current: T };

  // Fragment is a symbol used by JSX shorthand <>...</>
  export const Fragment: unique symbol;
}

// ── JSX namespace ──────────────────────────────────────────────────────────
// Required for TypeScript to type JSX expressions when jsx: "preserve" is set.
// Every intrinsic element (div, ul, li, img, button, …) is allowed via the
// index signature; specific props like src, alt, and href are accepted because
// the value type is Record<string, unknown>.

declare namespace JSX {
  interface Element {
    readonly type: string | symbol;
    readonly props: Record<string, unknown>;
  }

  // Allow any HTML element name. jsx-a11y rules still enforce accessibility
  // constraints at the ESLint level regardless of these broad type definitions.
  interface IntrinsicElements {
    readonly [elemName: string]: Record<string, unknown>;
  }

  interface ElementChildrenAttribute {
    readonly children: Record<string, unknown>;
  }
}
