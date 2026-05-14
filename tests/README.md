# ESLint Docker Image — Test Suite

This directory validates that the `dockerized-eslint` image correctly enforces
every rule category in the production ESLint configuration. Tests are
self-contained: all fixtures, the TypeScript configuration, and the runner
script live here and require only Docker to execute.

---

## Quick Start

```bash
# From the repo root — build the image then run the tests
bash build.sh && bash tests/run-tests.sh

# Verbose mode — shows full ESLint output for every test case
bash tests/run-tests.sh -v

# Test a different image tag
bash tests/run-tests.sh -i my-custom-eslint-image
```

Exit code `0` means all tests passed. Exit code `1` means at least one test
failed; the runner prints which test failed and why.

---

## Directory Layout

```
tests/
├── README.md               This file
├── tsconfig.json           TypeScript config for type-aware linting of fixtures
├── react-stubs.d.ts        Minimal React / JSX type declarations (no @types/react needed)
├── run-tests.sh            Automated test runner
└── fixtures/
    ├── pass/               Files that must produce ZERO ESLint errors
    │   ├── 01-clean-typescript.ts
    │   ├── 02-clean-functional.ts
    │   ├── 03-clean-promises.ts
    │   └── 04-clean-react.tsx
    └── fail/               Files that must trigger a specific ESLint rule
        ├── 01-explicit-any.ts
        ├── 02-floating-promise.ts
        ├── 03-no-let.ts
        ├── 04-immutable-data.ts
        ├── 05-for-loop.ts
        ├── 06-cognitive-complexity.ts
        ├── 07-duplicate-functions.ts
        ├── 08-jsx-key.tsx
        ├── 09-exhaustive-deps.tsx
        ├── 10-missing-alt.tsx
        ├── 11-circular-a.ts + 11-circular-b.ts
        └── 12-promise-chain.ts
```

---

## Test Philosophy

### Pass fixtures

A `pass/` file proves that **clean, idiomatic TypeScript is not over-penalised**.
These files demonstrate the correct version of the patterns tested in `fail/`.
They must exit ESLint with code `0` (no rule violations at `error` severity).
Warnings (`warn`-level rules) are tolerated and do not cause the test to fail.

Each pass file covers one conceptual area:

| File | Concepts validated |
|---|---|
| `01-clean-typescript.ts` | `unknown` over `any`, discriminated unions, `satisfies`, branded types, `assertNever` exhaustiveness |
| `02-clean-functional.ts` | `const` everywhere, `readonly` types, pure functions, spread instead of mutation, `toSorted`/`toReversed` |
| `03-clean-promises.ts` | `await`, `Promise.all`, `.catch()` chains, `return await` inside `try-catch`, `void` for intentional fire-and-forget |
| `04-clean-react.tsx` | Explicit function signature (no `React.FC`), destructured `useState`, complete `useEffect` deps, `alt` text, `type` on buttons |

### Fail fixtures

A `fail/` file proves that **the target rule fires on the exact bad pattern it
is designed to catch**. The test runner:

1. Runs ESLint on the file
2. Asserts exit code ≠ 0 (at least one error was found)
3. Asserts the target rule name appears in the output

Each fail file is intentionally minimal — it contains only enough code to
trigger the target rule clearly. Additional rule violations in the same file
are irrelevant to the test outcome.

---

## Test Case Reference

### PASS tests

#### `pass/01-clean-typescript.ts` — Type-system patterns

Validates that the following **do not** trigger errors:

- `unknown` used for external data, narrowed with `typeof` / `instanceof` guards
- Discriminated unions where each state carries exactly the fields it needs
- `assertNever(value: never)` in switch `default` for exhaustiveness checking
- `satisfies` to validate an object shape without widening the inferred type
- Branded nominal types (`Brand<string, 'UserId'>`) with smart constructors
- All exported functions have explicit return type annotations
- Named exports only (no default export)

#### `pass/02-clean-functional.ts` — Functional programming patterns

Validates that the following **do not** trigger errors:

- `const` for every binding — no `let` anywhere
- `readonly` on all interface properties
- `ReadonlyArray<T>` for array parameters
- New immutable array methods: `toSorted()`, `toReversed()`, `toSpliced()`
- Object spread `{ ...obj, key: newValue }` instead of property assignment
- Array spread `[...arr, newItem]` instead of `push()`
- `for-of` loops instead of indexed `for` loops
- `Array.prototype.includes()` instead of `indexOf() !== -1`
- Property signatures in interfaces (`readonly fn: () => T`, not `fn(): T`)

#### `pass/03-clean-promises.ts` — Async/await patterns

Validates that the following **do not** trigger errors:

- `await` on every Promise-returning call
- `return await` inside `try-catch` blocks (not bare `return`)
- `Promise.all([ ... ])` with its result awaited
- `.then().catch()` chains that terminate with `.catch()`
- `void somePromise()` as an explicit fire-and-forget pattern

#### `pass/04-clean-react.tsx` — React component patterns

Validates that the following **do not** trigger errors:

- Explicit function signature `function Comp({ ... }: Props): JSX.Element`
- `const [value, setValue] = useState<T>(initial)` — destructured
- `useEffect(() => { ... }, [dep1, dep2])` — complete dependency array
- `useCallback(fn, [dep1, dep2])` — used only where it stabilises a dep
- `<img src="..." alt="Descriptive text" />` — meaningful alt text
- `<button type="button">` — explicit button type
- Only named exports at the module level

---

### FAIL tests

#### `fail/01-explicit-any.ts` — `@typescript-eslint/no-explicit-any`

**Pattern:** Functions typed as `(data: any): any` or variables annotated
`: any`.

**Why it matters:** `any` turns off type checking for a value and all
downstream usages. A single `any` in a call chain contaminates every value
derived from it, turning compile-time errors into silent runtime failures.

**Correct fix:** Replace `any` with `unknown` and narrow with type guards,
or with the correct union type, or parse the data with Zod/Valibot at the
system boundary.

---

#### `fail/02-floating-promise.ts` — `@typescript-eslint/no-floating-promises`

**Pattern:** Calling an `async` function without `await`, without `.catch()`,
and without returning the resulting Promise.

**Why it matters:** The operation appears to start, but any failure it
produces is silently discarded. Database writes, email sends, and cache
invalidations have failed in production with zero error signals because of
floating Promises.

**Correct fix:** `await fn()`, or `fn().catch(handleError)`, or `return fn()`,
or `void fn()` if the fire-and-forget intent is deliberate and documented.

---

#### `fail/03-no-let.ts` — `functional/no-let`

**Pattern:** `let totalPrice = 0` inside a function body.

**Why it matters:** `let` declares a mutable binding. Every `let` variable is
a mutation waiting to happen. When the variable is never actually reassigned,
`let` sends a false signal. When it IS reassigned, the computation is usually
expressible as a pure transformation (`reduce`, recursion) that avoids
mutable state entirely.

**Correct fix:** `const` for non-reassigned variables; `reduce` or spread
accumulation for accumulators.

---

#### `fail/04-immutable-data.ts` — `functional/immutable-data`

**Pattern:** `arr.push(item)`, `obj.prop = value`, `arr[0] = x`,
`arr.sort(comparator)`.

**Why it matters:** Mutating shared data creates aliasing bugs — two call
sites hold references to the same object and one unexpectedly modifies it.
These bugs are hard to reproduce because the mutation and the observation
of corrupted state happen in different call frames.

**Correct fix:**
- Object update: `{ ...obj, prop: newValue }`
- Array append: `[...arr, newItem]`
- Array sort: `arr.toSorted(comparator)` (ES2023)
- Array reverse: `arr.toReversed()` (ES2023)

---

#### `fail/05-for-loop.ts` — `unicorn/no-for-loop`

**Pattern:** `for (let i = 0; i < arr.length; i++) { ... arr[i] ... }`

**Why it matters:** Indexed `for` loops introduce three error sources: the
loop initialiser, the condition (off-by-one), and the index arithmetic in
the body. `for-of` eliminates all three and works correctly with any iterable.

**Correct fix:** `for (const item of arr) { ... }`. When the index is needed:
`for (const [i, item] of arr.entries()) { ... }`.

---

#### `fail/06-cognitive-complexity.ts` — `sonarjs/cognitive-complexity`

**Pattern:** A function with deeply nested `if/else` blocks that push the
cognitive complexity above the configured threshold of 15.

**Why it matters:** Cognitive complexity measures how hard the control flow
is to follow. A function with complexity 22 requires holding 22 mental
context switches while reading it. Every engineer who touches it must reload
all of that context. Decomposing into smaller named functions reduces each
piece to a complexity well below 15.

**How it is counted (simplified):** Each structural break adds 1 + its nesting
depth. A branch at depth 0 costs 1; the same branch at depth 3 costs 4. See
the inline comment in the fixture for the exact calculation.

**Correct fix:** Extract named helper functions for each branch. Each helper
independently has low complexity.

---

#### `fail/07-duplicate-functions.ts` — `sonarjs/no-identical-functions`

**Pattern:** Two exported functions with bodies of ≥ 3 lines that are
textually identical.

**Why it matters:** Duplicate logic must be updated in both places when the
business rule changes. Failing to update both creates a subtle inconsistency
that is very difficult to track down.

**Correct fix:** Extract the shared logic into a single named function that
both callers use.

---

#### `fail/08-jsx-key.tsx` — `react/jsx-key`

**Pattern:** `items.map(item => <li>{item.name}</li>)` with no `key` prop on
the `<li>`.

**Why it matters:** React's reconciler uses `key` to track which list items
changed between renders. Without keys, React re-renders every list item on
every change. Worse, component state (focus, scroll position, animation phase)
may be incorrectly preserved or lost when items are added, removed, or
reordered.

**Correct fix:** `items.map(item => <li key={item.id}>{item.name}</li>)`.
Use a stable, unique identifier — never the array index.

---

#### `fail/09-exhaustive-deps.tsx` — `react-hooks/exhaustive-deps`

**Pattern:** `useEffect(() => { doSomething(dep) }, [])` where `dep` is a
prop or state value but is absent from the dependency array.

**Why it matters:** The effect captures the value of `dep` from the render in
which it was created (a stale closure). When `dep` changes in a subsequent
render, the effect does NOT re-run — it continues using the old value. The
component shows stale data while appearing correct to a casual test, producing
a production bug that only manifests under specific prop-change sequences.

**Correct fix:** Add every captured reactive value to the dependency array.
If a value should not cause re-runs, move it outside the component or into a
`useRef`.

---

#### `fail/10-missing-alt.tsx` — `jsx-a11y/alt-text`

**Pattern:** `<img src="..." />` with no `alt` attribute.

**Why it matters:** Screen readers announce image elements to visually impaired
users by reading the `alt` text. Without it, the screen reader either reads
the file path (meaningless to the user) or skips the image entirely (content
is lost). This is a WCAG 2.1 Level A requirement.

**Correct fix:**
- Informative image: `<img src="..." alt="Alice's profile photo" />`
- Decorative image: `<img src="..." alt="" role="presentation" />`

---

#### `fail/11-circular-a.ts` + `fail/11-circular-b.ts` — `import-x/no-cycle`

**Pattern:** Module A imports from B; module B imports from A, forming a cycle.

**Why it matters:** Circular imports cause one module to be in a
partially-initialised state when the other first accesses it. In Node.js (CJS)
this silently returns `{}` or `undefined` for values not yet assigned, causing
"X is not a function" or undefined-access errors at runtime that are extremely
difficult to trace back to the import cycle.

**Detection:** The rule follows the import graph from the linted file and
reports if any import path leads back to the file itself. `maxDepth: Infinity`
in the config means ALL transitive cycles are detected, not just direct
self-imports.

**Correct fixes:**
1. Extract the shared type/value to a neutral third module
2. Invert the dependency: pass the required functionality as a callback parameter
3. Merge the two modules if they logically form a single unit

---

#### `fail/12-promise-chain.ts` — `promise/catch-or-return`

**Pattern:** `fetchUser(id).then(process)` — a `.then()` chain that has no
`.catch()` terminator and is not returned to the caller.

**Why it matters:** Any rejection in the chain propagates with no handler,
producing an unhandled Promise rejection. In Node.js 15+, unhandled rejections
terminate the process. In browsers, they appear only in the DevTools console
and are invisible in production monitoring.

**Correct fix:**
- Add `.catch(handler)` at the end of the chain
- `return` the chain so the caller handles rejection
- Convert to `async/await` with `try-catch`

---

## Infrastructure Files

### `tsconfig.json`

Provides TypeScript project configuration so that type-aware lint rules (those
that use the TypeScript type checker) can operate on the fixture files.

Key settings:
- `"target": "ES2022"` — enables modern syntax including `toSorted`, `toReversed`
- `"module": "ESNext"` + `"moduleResolution": "bundler"` — allows extensionless
  relative imports (used in the circular-dep fixture)
- `"jsx": "preserve"` — TypeScript parses JSX without transforming it; the
  ESLint parser handles JSX syntax independently
- `"strict": true` — full strict mode, consistent with production tsconfig
- `"skipLibCheck": true` — suppresses errors in `.d.ts` declaration files
  (including the React stubs)

The `tests/tsconfig.json` is discovered by the TypeScript project service
because ESLint searches upward from each linted file to find the nearest
`tsconfig.json`. Since all fixtures are under `tests/`, this file is always
found.

### `react-stubs.d.ts`

Minimal type declarations that allow the `.tsx` fixtures to be compiled by
TypeScript without installing `@types/react` in the Docker image.

Declared:
- `module 'react'` — `useState`, `useEffect`, `useCallback`, `useMemo`,
  `useRef`, `Fragment`
- `namespace JSX` — `Element`, `IntrinsicElements`, `ElementChildrenAttribute`

These stubs provide just enough type information for:
1. TypeScript to parse and resolve `import { useState } from 'react'`
2. ESLint's `react-hooks` rules to identify hook calls by name
3. `jsx-a11y` rules to analyse JSX attributes
4. The TypeScript parser to accept JSX element syntax

They are **not** suitable for production use — they lack the full React type
surface needed for accurate React component typing.

---

## Adding New Tests

### Adding a PASS test

1. Create `tests/fixtures/pass/NN-description.ts` (or `.tsx`).
2. Write clean code that correctly follows the rule(s) you want to verify.
3. Add a header comment documenting which practices the file demonstrates.
4. Add a call to `run-tests.sh`:
   ```bash
   expect_pass \
     "Human-readable description" \
     "fixtures/pass/NN-description.ts"
   ```

### Adding a FAIL test

1. Create `tests/fixtures/fail/NN-rule-slug.ts` (or `.tsx`).
2. Write the minimum code needed to trigger the target rule.
3. Add a header comment explaining:
   - Which rule is being tested
   - Why the pattern is harmful
   - What the correct fix looks like
4. Add a call to `run-tests.sh`:
   ```bash
   expect_fail \
     "Human-readable description — rule-name" \
     "fixtures/fail/NN-rule-slug.ts" \
     "rule-name"
   ```
   The third argument must exactly match the rule identifier as it appears in
   ESLint output (e.g. `@typescript-eslint/no-floating-promises`).

---

## Troubleshooting

### "Docker image not found"
Build the image before running tests:
```bash
bash build.sh
```

### A PASS test fails unexpectedly
Run with `-v` to see the full ESLint output:
```bash
bash tests/run-tests.sh -v
```
Common causes:
- The fixture file uses a pattern that triggers an additional rule not
  covered in the file's header comment. Add a `readonly` to a parameter,
  add an explicit return type, or restructure to avoid the unintended violation.
- A plugin was updated and a new rule was added to a preset configuration.

### A FAIL test passes unexpectedly (rule not triggered)
- Verify the rule name matches exactly (case-sensitive, including the
  plugin prefix like `@typescript-eslint/`).
- Run the image manually against the fixture to inspect the raw output:
  ```bash
  docker run --rm \
    -v "$(pwd)/tests:/data" \
    dockerized-eslint \
    -c /config/eslint.config.ts \
    fixtures/fail/NN-rule-slug.ts
  ```
- Confirm the rule is actually `error` (not `warn`) in the config. The
  runner only checks for non-zero exit code AND rule name in output.

### TypeScript errors in tsx fixtures
TypeScript errors in `.tsx` fixtures (e.g., "Cannot find module 'react'") are
suppressed by `skipLibCheck: true` and the `react-stubs.d.ts` declarations.
If new errors appear, extend `react-stubs.d.ts` with the missing declarations.
