# Modern TypeScript Clean Code Practices
## Functional Coding, Modularization, Best Practices, and ESLint Configuration

**Audience:** Senior and Staff engineers setting team standards  
**FP Stance:** Pragmatic — FP preferred, OOP permitted where it genuinely fits  
**ESLint Scope:** Adds `eslint-plugin-unicorn`, `eslint-plugin-sonarjs`, `eslint-plugin-import-x`, and `eslint-import-resolver-typescript` to the existing `eslint-dockerized` configuration  
**React Coverage:** Full — hooks design, component patterns, accessibility, concurrent features

---

## Lead Summary

TypeScript crossed a threshold somewhere between 2022 and 2025. It stopped being "JavaScript with types" and became the production language of record for serious web development. With that shift, the contract between a developer and their codebase changed fundamentally — the type system became an active collaborator, capable of catching entire categories of bugs before they reach production.

Yet many TypeScript codebases are not much cleaner than their JavaScript predecessors. `any` is used liberally. Strict mode is disabled. OOP patterns from Java or C# are replicated without question. ESLint sits as background noise.

This guide addresses that gap. It is a comprehensive, grounded, opinionated guide to modern TypeScript clean code practices for senior engineers who set standards and make decisions that affect entire teams. It covers five core areas — clean code philosophy, functional programming discipline, type system mastery, modularization and architecture, and React functional patterns — and concludes with a complete proposed `eslint.config.ts` for the `eslint-dockerized` repository.

**The core positions this guide takes:**

- The TypeScript compiler is a collaborator, not an obstacle. When it raises an error, the first question is "what is it seeing?" not "how do I silence this?"
- `any` is not a type — it is a hole in the type system. Every `any` is a bet that this particular value will never be misused. The bet gets lost in production.
- Immutability is the default. `const` and `readonly` are the starting position. `let` and mutation are justified exceptions.
- FP first, OOP when it fits. Data transformations are pure functions. Lifecycle-aware objects use classes. The default is functional; the exception is object-oriented.
- Types encode invariants. Design types that make invalid states unrepresentable — not just handled at runtime, but impossible to construct at the type level.
- Modules reflect architecture. Feature-based layouts, clean architecture layers, no barrel files except at deliberate public API boundaries, and circular dependency prevention.
- Rules enforce agreements. Every ESLint rule should correspond to a principle the team has agreed on. Mechanical enforcement of agreed principles produces better outcomes than arbitrary gatekeeping.

The guide is organized to be read linearly for complete adoption or consulted by section for specific guidance. Each section is self-contained. The ESLint configuration in Section 8 is a deployable artifact with inline rationale for every rule decision.

---

## Table of Contents

| Section | Title | Focus |
|---|---|---|
| 1 | Introduction | Context, audience, scope, and how to use this guide |
| 2 | The TypeScript Clean Code Philosophy | SOLID reframed; parse don't validate; compiler as collaborator; anti-patterns; strict mode settings |
| 3 | Functional Programming in TypeScript | The case for FP; native primitives; immutability enforcement; pure functions; composition; declarative style; OOP exceptions; Effect/Remeda; eslint-plugin-functional rules |
| 4 | Type System as a Design Tool | Making invalid states unrepresentable; discriminated unions; exhaustiveness checking; branded types; `satisfies`; template literal types; `unknown` vs `any`; utility types; inference guidelines |
| 5 | Modularization & Architecture | Feature-based vs. technical-role layouts; Clean Architecture in TypeScript; DDD tactical patterns; dependency direction; barrel file debate; TypeScript paths; circular dependency prevention; monorepo patterns |
| 6 | React Functional Patterns | Why class components are dead; dropping `React.FC`; discriminated union props; generic components; custom hooks; server vs. local state; composition patterns; Context performance; effect discipline; accessibility |
| 7 | ESLint Ecosystem & Rule Design | Flat config architecture; current config analysis; rule severity philosophy; `strictTypeChecked` rules explained; functional plugin tuning; unicorn rules; sonarjs complexity; import-x module discipline; promise safety; React plugin configurations |
| 8 | Proposed ESLint Configuration | Design rationale; new Dockerfile packages; complete `eslint.config.ts`; rule-by-rule rationale table; migration guide |
| 9 | Team Adoption & Governance | Phased adoption strategy; CI integration; `eslint-disable` governance; plugin versioning; buy-in approach; impact metrics |
| 10 | Conclusion | Compounding returns; summary of positions; the pragmatic path forward; references |
| 11 | Testing TypeScript | Pure function testing; type-safe mocks; React component testing; hook testing; discriminated union testing; snapshot considerations; test file ESLint overrides |
| 12 | Advanced Anti-Patterns | `any` propagation; god object types; mutable accumulation; optional chain overuse; Promise void trap; enum-boolean pattern; class-as-namespace; anti-pattern summary table |
| 13 | Performance, Build Tooling, and Advanced Generics | Compiler performance; project references; build tooling choices (Vite, esbuild, tsc); advanced generics; TypeScript 5.x features; fullstack type safety; error handling patterns; strict mode migration |
| 14 | Comprehensive Rule Reference | Core ESLint rules; TypeScript ESLint rules; functional rules; unicorn rules; sonarjs rules; import-x rules; React plugin rules; configuration decision matrix |
| 15 | Appendix: Quick-Start Guide and Cheat Sheets | 15-minute setup checklist; clean code quick reference; component template; hook template; ESLint severity reference card; common error message fixes; ten principles summary |

---

## Key Artifacts

**Proposed `eslint.config.ts`** — Section 8 contains a complete, production-ready ESLint flat configuration for the `eslint-dockerized` repository with:
- Switch from `eslint.configs.all` to `eslint.configs.recommended` (cleaner composition)
- Four new plugins: `unicorn`, `sonarjs`, `import-x`, `eslint-import-resolver-typescript`
- Tuned functional rules for pragmatic FP-preferred stance
- React rules split to `.tsx`/`.jsx` files only
- `react-hooks/exhaustive-deps` promoted to `error`
- Global `ignores` block for generated files
- Inline comments explaining every non-obvious rule decision

**Updated Dockerfile** — Section 8.2 contains the complete updated `npm install -g` command with four new pinned packages.

**Migration guide** — Section 8.5 provides a step-by-step migration plan from the existing config to the proposed config with effort estimates per rule category.

**Team adoption playbook** — Section 9 provides the complete change management approach: phased adoption, CI integration, `eslint-disable` governance, and buy-in strategy.


---

# 1. Introduction

TypeScript crossed a threshold somewhere between 2022 and 2025. It stopped being "JavaScript with types" and became the production language of record for serious web development. npm download counts, job postings, open-source project adoption — every signal points the same direction. TypeScript is not a niche tool for large teams anymore; it is the default for anyone writing JavaScript that will still exist in six months.

This shift matters for clean code because TypeScript fundamentally changes the contract between a developer and their codebase. In JavaScript, "clean code" was largely about naming, structure, and test coverage — the compiler offered no help. In TypeScript, the type system becomes an active collaborator: it catches entire categories of bugs at compile time, encodes invariants that would otherwise live only in comments or developer memory, and makes refactoring safe at a scale that was previously impossible.

Yet despite this, many TypeScript codebases are not much cleaner than their JavaScript predecessors. The type system is neutered with `any`. Strict mode is disabled. The same OOP patterns from Java or C# are replicated without asking whether they fit the language. ESLint is configured with a handful of `recommended` presets and then ignored.

This guide is for senior and staff engineers who set standards for their teams. It is opinionated, grounded in the 2024–2025 community consensus, and designed to produce a defensible position you can walk into a tech review with. It covers five interconnected areas:

1. **Clean code philosophy** — what it means specifically in TypeScript, how classic principles translate, and which anti-patterns to eradicate.
2. **Functional programming** — a pragmatic FP-first approach: immutability by default, pure functions preferred, OOP tolerated where it genuinely fits.
3. **Type system mastery** — discriminated unions, branded types, `satisfies`, and using the compiler to make invalid states unrepresentable.
4. **Modularization and architecture** — feature-based layouts, clean architecture layers, barrel file discipline, and circular dependency prevention.
5. **React functional patterns** — typed components, custom hooks, composition patterns, and accessibility.

The guide concludes with a concrete proposed `eslint.config.ts` for the `eslint-dockerized` repository — adding new plugins and tuning existing rules to enforce the principles described above. The guide also covers:

6. **Testing discipline** — how TypeScript changes the testing contract, type-safe mocks, React component testing, and hook testing patterns.
7. **Advanced anti-patterns** — the patterns most frequently found in real codebases and their systematic remedies.
8. **Performance and build tooling** — TypeScript compiler performance, incremental builds, Vite/esbuild/tsc workflows, and advanced generic patterns.
9. **Comprehensive rule reference** — annotated rationale for every rule in the proposed config, with a decision matrix for different team contexts.

---

## Why Another TypeScript Guide?

The existing body of TypeScript best practice writing is extensive but fragmented. Tutorial blog posts cover one pattern at a time. Framework documentation focuses on framework-specific patterns. ESLint plugin READMEs document what each rule does but not why to enable it or how it interacts with other rules.

This guide fills a specific gap: a comprehensive, integrated view of TypeScript clean code from the perspective of a Staff engineer who must make decisions that affect an entire team and codebase. It connects principles (immutability by default) to mechanisms (the `readonly` keyword, `ReadonlyArray`, `as const`) to enforcement (eslint-plugin-functional rules) to adoption strategy (phased rollout, CI integration) — end-to-end in one document.

Every recommendation is grounded in one of three sources: the 2024–2025 TypeScript community consensus (documented production experience at scale), the measurable properties of functional code (testability, composability, predictability), or the documented behavior of the ESLint rules themselves. Preferences and personal taste are explicitly avoided. This is an engineering document, not a style guide.

---

## The ESLint-Dockerized Repository Context

The `eslint-dockerized` repository provides a self-contained ESLint linter in a Docker container, usable at the root of any TypeScript project. The current configuration uses:

- `@eslint/js` 9.24.0 with `eslint.configs.all`
- `typescript-eslint` 8.29.0 with `strictTypeChecked`
- `eslint-plugin-functional` 9.0.1 with `recommended` + `stylistic`
- `eslint-plugin-promise` 7.2.1 with `flat/recommended`
- `eslint-plugin-react` 7.37.2, `eslint-plugin-react-hooks` 5.1.0, `eslint-plugin-jsx-a11y` 6.10.2

The proposed configuration in Section 8 builds on this foundation, switching from `eslint.configs.all` to `eslint.configs.recommended` (cleaner, less conflicting), adding four new plugins (`unicorn`, `sonarjs`, `import-x`, `eslint-import-resolver-typescript`), and providing a complete rule-by-rule rationale for every change.

---

## How to Use This Guide

Each section is self-contained. If your team is already strong on FP fundamentals, jump to Section 4 (Type System) or Section 7 (ESLint Ecosystem). If you are introducing a new config to a brownfield codebase, Section 9 (Team Adoption) gives you the change management playbook. If you want the ESLint config immediately, go to Section 8.

Code examples throughout use TypeScript 5.x with `strict: true`. All ESLint examples target ESLint 9.x flat config format. Examples are designed to be runnable with minimal adaptation — no framework-specific boilerplate, no build system assumptions.


---

# 2. The TypeScript Clean Code Philosophy

## 2.1 What Clean Code Means in TypeScript Specifically

Robert C. Martin's _Clean Code_ was written for Java. Its wisdom holds, but it needs translation into a language with a structural type system, first-class functions, a compiler that reasons about null safety and control-flow narrowing, and an ecosystem built on functional composition. TypeScript is not Java with optional semicolons. It is a fundamentally different programming model, and the clean code principles that apply to it are both familiar and deeply recontextualized.

In JavaScript, "clean code" was largely about naming, structure, and test coverage. The runtime environment offered no help. You could write `user.profile.avatar` and the program would compile (there is no compilation) and then throw `TypeError: Cannot read properties of undefined (reading 'avatar')` at 3am on a Friday. In TypeScript, the type system becomes an active collaborator — it catches entire categories of bugs at compile time, encodes invariants that would otherwise live only in comments or developer memory, and makes refactoring safe at a scale that was previously impossible.

Yet despite this, many TypeScript codebases are not much cleaner than their JavaScript predecessors. The patterns are familiar and depressing: `any` used liberally as an escape hatch, non-null assertions (`!`) scattered throughout to silence compiler warnings, strict mode disabled or never enabled, the same OOP class hierarchies from Java or C# replicated without asking whether they fit the language and paradigm, ESLint configured with a handful of `recommended` presets and then treated as background noise.

The community consensus in 2025, synthesized across dozens of engineering blogs, conference talks, and team guidelines [1][2][3], is this: TypeScript's value is its type system, and code that circumvents the type system is not TypeScript code in any meaningful sense. It is JavaScript with extra syntax and a false sense of safety.

**In TypeScript, "clean code" means:**

- **Types as documentation.** A well-typed function signature is more reliable than a JSDoc comment because the compiler enforces it. `function findUser(id: UserId): Promise<User | null>` tells the reader everything they need to know — the input type, the return type, the possibility of not finding anything — without a single line of comment. Contrast this with `function findUser(id)` which tells you nothing.

- **Impossible states are unrepresentable.** If a type can express a state that should never occur — like `{ isLoading: true, data: User[] }` — the code is not clean. Clean TypeScript collapses impossible combinations into discriminated unions, making the type system guarantee program correctness rather than just annotate it.

- **No `any`.** `any` is not a type. It is a hole in the type system that propagates silently through the codebase, turning compile-time errors into runtime surprises. Every `any` is a broken promise: "I told the compiler to trust me here, and now neither of us knows what this actually is." The `@typescript-eslint/no-explicit-any` rule exists specifically to catch this.

- **Explicit function boundaries.** Types on function parameters and return types are not optional bureaucracy — they are the contracts that make large-scale refactoring safe. When you change a function signature, the compiler guides you to every affected call site. Without explicit types, that guidance disappears.

- **Compiler as first collaborator.** When the compiler raises an error, the question is not "how do I silence this?" but "what is the compiler seeing that I am missing?" The compiler is right more often than the developer in these moments, not because it is smarter, but because it has global visibility into every call site, every assignment, every possible path through the code.

The difference between a TypeScript codebase that is genuinely clean and one that merely compiles is often just `strict: true` in `tsconfig.json` and `no-explicit-any: error` in `.eslintrc`. Everything else builds from there.

## 2.2 Classic Principles Reframed for TypeScript

The principles of clean code did not change when TypeScript arrived. What changed is how they are implemented and enforced.

### Single Responsibility

In object-oriented languages, SRP applies primarily to classes. In TypeScript with a functional lean, it applies to everything:

- A **function** does one thing. It transforms one input shape into one output shape. When a function has a side effect, it declares it in its name and type signature. `saveUser(user: User): Promise<void>` — the `void` return type signals this is about effects, not transformation. `formatUserName(user: User): string` — no side effects, pure transformation.

- A **module** exports one logical concern. Not all the utilities for a feature, not all the hooks for a domain — one cohesive concept. When you ask "what does this module do?", the answer should be one sentence.

- A **type** models one concept. A `User` type should model a user. If it also contains payment information and shipping addresses, it is either a god object or it represents a query result that should have its own named type (`UserWithOrderHistory`).

- A **component** renders one piece of UI. A component that fetches data, formats it, renders a loading state, renders an error state, handles user interaction, and updates global state is not following SRP. Extract the concerns: a container component handles data, a presentation component handles rendering, a custom hook handles state logic.

The TypeScript type system reinforces SRP by making narrow types more useful than broad ones. A function that accepts `Pick<User, 'id' | 'name'>` instead of the full `User` type declares precisely what it needs. This forces the caller to be explicit and prevents the function from accidentally accessing fields it shouldn't.

### Open/Closed

The Open/Closed Principle states that software entities should be open for extension but closed for modification. In functional TypeScript, this is achieved through composition, not inheritance.

A pure function is naturally closed for modification: you do not change it to add behavior. You compose new behavior by wrapping it, by piping it with another function, by passing a different transformation function as an argument. The original function is unchanged.

```typescript
// Original function: closed for modification
const formatPrice = (amount: number, currency: string): string =>
  `${currency}${amount.toFixed(2)}`;

// Extended behavior: open for extension through composition
const formatPriceWithTax = (taxRate: number) =>
  (amount: number, currency: string): string =>
    formatPrice(amount * (1 + taxRate), currency);

// Different formatting for different locales: composition, not modification
const formatPriceLocalized = (locale: string) =>
  (amount: number, currency: string): string =>
    new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
```

Discriminated unions provide a different flavor of open/closed in the type domain. When you add a new member to a union type, the compiler guides you to every switch statement, every conditional, every place that must handle the new case. This is "open for extension" (add the union member) and "closed for modification" (existing handlers are untouched; you just add a new case).

### Liskov Substitution

In TypeScript's structural type system, assignability is the proxy for substitutability. If `DogAdapter` has all the properties and methods of `Animal`, it can be substituted anywhere an `Animal` is expected. The compiler enforces this at every call site, without requiring explicit `implements Animal` declarations (though those can be useful for documentation).

The deeper TypeScript lesson from LSP is this: prefer interfaces and union types over class hierarchies as substitutability contracts. An interface contract is lighter, more testable, and doesn't require the implementation to be a class at all — it can be a plain object that happens to have the right shape. This is much more aligned with how TypeScript's structural type system actually works.

```typescript
// ✅ Interface contract: any shape that satisfies UserRepository can be substituted
interface UserRepository {
  readonly findById: (id: UserId) => Promise<User | null>;
  readonly save: (user: User) => Promise<void>;
}

// Test: plain object satisfies the interface
const mockRepo: UserRepository = {
  findById: async (id) => ({ id, name: 'Test User', email: 'test@example.com', role: 'user' }),
  save: async () => void 0,
};
```

### Interface Segregation

Never force a module to depend on interfaces it does not use. In TypeScript, this translates to: keep type definitions small and focused. A function that only needs to read a user's name and email should not accept a parameter typed as your entire `User` entity, which includes payment methods, shipping addresses, order history, and notification preferences.

```typescript
// ❌ God interface: forces consumers to depend on everything
interface UserEmailNotificationService {
  sendWelcomeEmail(user: User): Promise<void>;  // User has 40 properties, we need 2
}

// ✅ Narrowed input: explicit about what is needed
interface EmailRecipient {
  readonly name: string;
  readonly email: string;
}

interface UserEmailNotificationService {
  sendWelcomeEmail(recipient: EmailRecipient): Promise<void>;
}
```

This principle becomes especially powerful in testing. The test for `sendWelcomeEmail` only needs to provide a `{ name, email }` object — not construct a full `User` with dozens of required fields.

Use `Pick<User, 'id' | 'name' | 'email'>` throughout the application to express precisely what is needed at each boundary. This keeps coupling minimal and makes refactoring safe: if you add a new required field to `User`, you only need to update the places that explicitly depend on it.

### Dependency Inversion

The most important principle for testable, composable TypeScript. High-level modules (domain logic, use cases) should not import concrete implementations of low-level modules (databases, HTTP clients, file system). Both should depend on abstractions (interfaces).

In TypeScript, this manifests in two primary patterns:

**Function parameter injection (for simple cases):**
```typescript
// ✅ Dependency injected as parameter
const getUser = async (
  findUser: (id: UserId) => Promise<User | null>,
  id: UserId
): Promise<User | null> => findUser(id);

// Usage in production
getUser(prismaUserRepo.findById, userId);

// Usage in tests
getUser(async (id) => ({ id, name: 'Mock', email: 'mock@test.com', role: 'user' }), userId);
```

**Constructor injection (for classes where OOP is appropriate):**
```typescript
// ✅ Interface-based dependency injection
interface NotificationService {
  readonly sendEmail: (to: string, subject: string, body: string) => Promise<void>;
}

class OrderService {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async completeOrder(orderId: OrderId): Promise<void> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) throw new OrderNotFoundError(orderId);
    await this.orderRepo.save({ ...order, status: 'completed' });
    await this.notificationService.sendEmail(
      order.customerEmail,
      'Order Complete',
      `Your order ${orderId} has been completed.`
    );
  }
}
```

## 2.3 Parse, Don't Validate: The Boundary Discipline

One of the most impactful ideas for clean TypeScript code comes from a principle that has become central to the TypeScript community: "Parse, Don't Validate." [3] The insight is simple but profound:

**Validation** checks that data satisfies constraints at runtime, then passes the data on with the same type. The validation logic gets duplicated wherever the data flows. You end up with defensive checks scattered throughout the codebase: `if (!user) throw new Error(...)`, `if (typeof user.email !== 'string') throw new Error(...)`, etc.

**Parsing** transforms untyped or weakly-typed data at the system boundary into a strongly-typed representation. Once parsed, the type system guarantees the data is valid — no repeated checks needed. The validation logic is centralized at the one place where external data enters the system.

In TypeScript, this means:

1. All external data (API responses, environment variables, user input, database query results, file reads) enters the system through a parsing layer.
2. That parsing layer uses a schema validation library — Zod, Valibot, or Arktype — that produces TypeScript types matching the validated structure.
3. Inside the typed core, you work with known types. No `if (data.user)` checks, no `as User` casts, no `?.` chains through uncertain objects.
4. At output boundaries, you trust your types because you validated at input.

```typescript
// ── The parsing layer ─────────────────────────────────────────────────────
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  role: z.enum(['admin', 'user', 'guest']),
  createdAt: z.string().datetime().transform(d => new Date(d)),
});

type User = z.infer<typeof UserSchema>;

// Parse at the boundary — this is the only place validation happens
async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  const data: unknown = await response.json();
  return UserSchema.parse(data);  // throws ZodError if invalid
}

// ── Inside the typed core — no validation needed ──────────────────────────
function isAdmin(user: User): boolean {
  return user.role === 'admin';  // no null check, no type guard, just types
}

function displayName(user: User): string {
  return user.name;  // no optional chaining, we know name exists and is a string
}

const updateUserRole = (user: User, role: User['role']): User =>
  ({ ...user, role });  // pure function, no validation needed
```

This pattern, when enforced across a codebase, eliminates an entire class of runtime errors: the "I assumed this was a string but it was undefined" family. The type system becomes a runtime guarantee through the parsing layer, not just a compile-time annotation.

**Environment variables** are one of the most commonly missed parsing boundaries:

```typescript
// ❌ Common mistake: trusting process.env
const config = {
  databaseUrl: process.env.DATABASE_URL,    // string | undefined
  port: parseInt(process.env.PORT ?? '3000'), // might be NaN
};

// ✅ Parse environment at startup
const EnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const env = EnvSchema.parse(process.env);  // fail-fast at startup if misconfigured
// env.DATABASE_URL is now string (not string | undefined)
// env.PORT is now number (not NaN)
```

Failing at startup with a clear error message ("Missing required environment variable: DATABASE_URL") is infinitely better than failing in production with "Cannot read properties of undefined (reading 'split')".

## 2.4 The Compiler as a Collaborator

The framing that most improves TypeScript code quality: treat the compiler as the most knowledgeable code reviewer on the team — one who has read every file, seen every call site, and has perfect knowledge of the type flow.

When the compiler flags an error, the first instinct should not be "how do I silence this?" It should be "what is the compiler seeing that I'm missing?" In the vast majority of cases, the compiler has identified a genuine issue: a possible null dereference, a type mismatch, an unhandled branch, an incorrect assumption.

**`as` casts and `!` assertions** are the two most common forms of arguing with the compiler. Both tell TypeScript "I know something you don't." Both create runtime exceptions when the developer was wrong.

```typescript
// The ! anti-pattern
const user = getUser(); // returns User | null
console.log(user!.name); // "I know this is never null" — until it is

// The as anti-pattern
const data: unknown = fetchExternalData();
const user = data as User; // "Trust me, this is a User" — no validation
console.log(user.email);   // TypeError if data wasn't actually a User
```

The discipline is: if you find yourself writing `as` or `!`, stop and ask why the type system lacks the information it needs. Then provide that information:

- Instead of `user!.name`, use optional chaining `user?.name` or add an explicit null check
- Instead of `data as User`, use a type guard or a schema parser (Zod, Valibot)
- Instead of `type as SpecificType`, restructure the code so the type flows correctly

**The `noUncheckedIndexedAccess` compiler option** is perhaps the single most impactful non-strict-mode setting. Without it, `arr[0]` has type `T` even though it could be `undefined` if the array is empty. With it, `arr[0]` has type `T | undefined`, which forces explicit null handling:

```typescript
// Without noUncheckedIndexedAccess
const names: string[] = [];
const first = names[0];    // type: string (incorrect — array is empty)
first.toUpperCase();        // runtime TypeError: Cannot read properties of undefined

// With noUncheckedIndexedAccess
const first = names[0];    // type: string | undefined
first.toUpperCase();        // ❌ TypeScript error: 'first' is possibly 'undefined'
first?.toUpperCase();       // ✅ Safe optional chaining
```

The price of this setting is some verbosity at array access sites. The return is the elimination of index-out-of-bounds bugs — one of the most common runtime errors in JavaScript codebases.

## 2.5 Common Anti-Patterns in Real Codebases

These are the patterns that experienced TypeScript engineers will flag immediately in a code review. Each represents a failure of clean code discipline that the tooling in Section 8 is designed to prevent.

**`any` as escape hatch**

```typescript
// ❌ Anti-pattern: using any to suppress a hard problem
const processApiResponse = (data: any): ProcessedData => {
  return {
    id: data.id,
    name: data.name?.trim(),
    tags: data.tags?.filter(Boolean),
  };
};

// ✅ Clean: use unknown and parse
const processApiResponse = (data: unknown): ProcessedData => {
  const parsed = ApiResponseSchema.parse(data);
  return {
    id: parsed.id,
    name: parsed.name.trim(),
    tags: parsed.tags.filter(Boolean),
  };
};
```

Every `any` in the codebase is a bet that this particular value will never be misused. The bet gets lost in production. The `@typescript-eslint/no-explicit-any` rule prevents new `any` usage; the `no-unsafe-*` rule family prevents existing `any` values from silently infecting typed code.

**Non-null assertions scattered throughout**

```typescript
// ❌ Anti-pattern: asserting non-null without evidence
const avatar = user!.profile!.avatar!;

// ✅ Clean: handle the null case explicitly
const avatar = user?.profile?.avatar ?? '/default-avatar.png';
```

The `!` operator says "I guarantee this is not null or undefined." When that guarantee is violated — when `user` is null, when `profile` is undefined — the error message is "Cannot read properties of null (reading 'profile')" which is far less helpful than a well-placed early return or a default value. Use optional chaining and nullish coalescing to handle uncertainty explicitly.

**`enum` declarations**

TypeScript `enum` declarations have several surprising behaviors that make them problematic in 2025:

1. Numeric enums allow accidental value misuse: `UserRole.Admin === 0` is `true`, and any 0 value can be compared to it
2. String enums work more safely but add runtime overhead (they are real JavaScript objects)
3. `const enum` is not compatible with `isolatedModules` (required for many bundlers) and `verbatimModuleSyntax`
4. Enums break tree-shaking predictably

The clean alternative is a const object with `as const` and a derived union type:

```typescript
// ❌ Anti-pattern: TypeScript enum
enum UserRole {
  Admin = 'admin',
  User = 'user',
  Guest = 'guest',
}

// ✅ Clean: const object + type derivation
const UserRole = {
  Admin: 'admin',
  User: 'user',
  Guest: 'guest',
} as const;

type UserRole = typeof UserRole[keyof typeof UserRole];
// → 'admin' | 'user' | 'guest'

// Usage is identical, but it's a plain object + union type
const role: UserRole = UserRole.Admin; // 'admin'
```

**Class hierarchies for utility grouping**

```typescript
// ❌ Anti-pattern: class as a namespace
class UserUtils {
  static formatName(user: User): string { return `${user.firstName} ${user.lastName}`; }
  static getInitials(user: User): string { return `${user.firstName[0]}${user.lastName[0]}`; }
  static isAdult(user: User): boolean { return user.age >= 18; }
}

// ✅ Clean: module with named exports
export const formatName = (user: User): string => `${user.firstName} ${user.lastName}`;
export const getInitials = (user: User): string => `${user.firstName[0]}${user.lastName[0]}`;
export const isAdult = (user: User): boolean => user.age >= 18;
```

Module-level named exports are tree-shakable, directly importable, and don't require class instantiation or `UserUtils.` prefix at call sites.

**Missing return types on exported functions**

```typescript
// ❌ Anti-pattern: inferred return type on public API
export const processOrder = async (orderId: string) => {
  const order = await getOrder(orderId);
  // ... complex processing
  return result; // what type is result? not obvious
};

// ✅ Clean: explicit return type on exported functions
export const processOrder = async (orderId: OrderId): Promise<ProcessedOrder> => {
  const order = await getOrder(orderId);
  // ... complex processing
  return result; // TypeScript now verifies result is ProcessedOrder
};
```

Without the explicit return type, a refactoring that changes the shape of `result` silently changes the function's contract. Callers break at runtime, not at compile time. With the explicit return type, any mismatch is an immediate compile error.

**Mutable default exports**

Default exports cause several problems: they cannot be renamed with a safe refactor tool (the import name at the call site is arbitrary), they break tree-shaking in some module systems, and they make code search less reliable. Prefer named exports:

```typescript
// ❌ Default export
export default function processUser(user: User): ProcessedUser { /* ... */ }

// ✅ Named export
export function processUser(user: User): ProcessedUser { /* ... */ }
```

The `import-x/no-default-export` rule enforces this. Common exceptions: Next.js page components, configuration files — handled via targeted overrides.

**Promises floating without handling**

```typescript
// ❌ Anti-pattern: returned Promise ignored
async function saveUserSettings(userId: string, settings: UserSettings): void {
  database.update({ where: { id: userId }, data: settings }); // ← this Promise is dropped
  logger.log('Settings saved'); // this runs before the database operation completes!
}

// ✅ Clean: await all Promises
async function saveUserSettings(userId: string, settings: UserSettings): Promise<void> {
  await database.update({ where: { id: userId }, data: settings });
  logger.log('Settings saved'); // runs after the database operation
}
```

This is the class of bug that `@typescript-eslint/no-floating-promises` was designed to prevent. It is one of the most impactful single rules in the TypeScript ESLint ecosystem.

## 2.6 Mandatory Compiler Settings

A `tsconfig.json` that does not enable `strict` is not a serious TypeScript project. The `strict` flag is not optional in 2025. It is the baseline from which everything else builds.

`strict: true` enables: `strictNullChecks`, `strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization`, `noImplicitAny`, `noImplicitThis`, `useUnknownInCatchVariables`, `alwaysStrict`.

Beyond `strict`, the following options should be standard in every new TypeScript project [6][7]:

```json
{
  "compilerOptions": {
    // ── Core strictness ───────────────────────────────────────────────────
    "strict": true,
    "noUncheckedIndexedAccess": true,         // arr[0] is T | undefined, not T
    "exactOptionalPropertyTypes": true,        // {a?: string} ≠ {a?: string | undefined}
    
    // ── Additional strictness ─────────────────────────────────────────────
    "noImplicitReturns": true,                 // Functions must return on all paths
    "noFallthroughCasesInSwitch": true,        // switch cases must break or return
    "noImplicitOverride": true,                // Overriding methods must use override keyword
    "forceConsistentCasingInFileNames": true,  // Prevents case-sensitivity bugs on case-insensitive systems
    
    // ── Module discipline ─────────────────────────────────────────────────
    "verbatimModuleSyntax": true,              // import type must be used for type-only imports
    "isolatedModules": true,                   // Each file is independently transformable
    "moduleDetection": "force",                // Treat all files as modules
    
    // ── Build ─────────────────────────────────────────────────────────────
    "skipLibCheck": true,                      // Skip d.ts files from libraries
    "composite": false,                        // Set to true for monorepo project references
    "declaration": true,                       // Generate .d.ts files for consumers
    "declarationMap": true                     // Source maps for .d.ts files
  }
}
```

**`exactOptionalPropertyTypes`** closes a subtle loophole that surprises many developers. Without it:

```typescript
interface Config {
  timeout?: number; // "optionally a number"
}

// Without exactOptionalPropertyTypes, both are valid:
const a: Config = {};                  // timeout absent: fine
const b: Config = { timeout: undefined }; // timeout explicitly undefined: also "fine"

// With exactOptionalPropertyTypes:
const c: Config = { timeout: undefined }; // ❌ Error: 'undefined' not assignable to 'number'
```

The distinction matters because `'timeout' in config` and `config.timeout !== undefined` produce different results for explicitly-set-to-undefined vs. absent.

**`verbatimModuleSyntax`** is the TypeScript 5.0 flag that ensures `import type` is used for type-only imports and `import` is used for value imports. This is necessary for correct behavior with modern bundlers and for reliable tree-shaking. The `@typescript-eslint/consistent-type-imports` rule enforces this at the linting level; `verbatimModuleSyntax` enforces it at the compiler level.

These settings together make the type system as strict as it can be without becoming impractical. They are the foundation that makes linting meaningful. Linting rules built on top of a permissive compiler are a leaky bucket — they catch surface-level issues while the underlying type system remains porous.


---

# 3. Functional Programming in TypeScript

## 3.1 The Case for FP-First Design

Functional programming is not a religion. It is not a set of rules to follow because a functional language theorist decreed them. It is a set of constraints that, when applied thoughtfully, produce code with specific and measurable properties: easier to reason about, faster to test, safer in concurrent execution, and more composable for future extension.

The constraints are: prefer immutable data, prefer pure functions (same input → same output, no observable side effects), compose behavior from small pieces rather than extending large objects. Every one of these preferences has a concrete engineering rationale.

**Why immutable data:** Mutable data creates aliasing bugs — two pieces of code hold references to the same object and each is surprised when the other modifies it. In JavaScript/TypeScript, objects are passed by reference. Without immutability discipline, `setUser(modifiedUser)` might silently modify the caller's `user` object if the implementation wasn't careful. Immutable data eliminates this class of bug entirely. If you never modify data in place, you never have aliasing bugs.

**Why pure functions:** Pure functions are the unit of testability. A function that takes some inputs and returns an output, with no external state dependencies and no side effects, can be tested with a simple `assert(fn(input) === expectedOutput)` — no setup, no teardown, no mocks. Tests for impure functions require you to construct the external state before calling the function and verify the external state after — both of which are fragile and slow. The more pure functions in a codebase, the faster and more reliable the test suite.

**Why composition over inheritance:** Inheritance creates tight coupling. When `CustomerOrder extends Order`, every change to `Order` potentially affects `CustomerOrder`. The coupling cascades through the inheritance hierarchy. Function composition has no such coupling — combining `calculateSubtotal` with `applyDiscount` requires no coupling between the two functions. Each can evolve independently.

TypeScript is a multi-paradigm language. It has classes, inheritance, and imperative loops. None of these are forbidden. The discipline is: **reach for functional patterns first, and reach for OOP or imperative code only when they solve a problem that functional patterns cannot solve cleanly.** This is the pragmatic FP-first position.

In practice, this means:
- Data transformations are written as pure functions, not methods on objects
- State changes produce new values, not mutations of existing values  
- Function composition replaces inheritance for code reuse
- Classes are used for objects with lifecycle (stream processors, caches, event emitters) or for framework integration (NestJS controllers, TypeORM entities, React error boundaries) — not as glorified namespaces
- `const` is the default; `let` is a justified exception
- `readonly` is the default on all type properties; mutability is a justified exception

The investment pays dividends in testing. A pure function requires no mock setup. Input goes in, output comes out — assert on the output. A class method with dependencies and mutable state requires mock injection, state reset between tests, and careful ordering of operations in the test. The functional version is faster to write, faster to run, and harder to break.

It also pays dividends in reasoning. When you call a pure function, you know it does not change anything in the world outside of returning a value. You can mentally substitute the function call with its return value. This referential transparency makes large codebases dramatically easier to understand because you can reason about individual pieces without loading the entire context into your head.

## 3.2 TypeScript's Native FP Primitives

TypeScript provides everything needed for practical FP without a library. The language and standard library have evolved significantly in the ES2020–ES2023 timeframe, and many common FP patterns are now native.

**`const` — The most basic discipline**

Every variable should be `const` unless you have an explicit, justified need to reassign it. The `prefer-const` ESLint rule enforces this. A `let` declaration is a signal: "this value will change over its lifetime." If you never reassign it, the signal is false — use `const`.

```typescript
// ❌ Misleading: signals mutability but doesn't mutate
let userId = getUserId();
console.log(userId);

// ✅ Honest: not a mutable variable
const userId = getUserId();
console.log(userId);
```

**`readonly` modifier** — Makes object properties immutable at the type level. Attempting to reassign a `readonly` property is a compile error:

```typescript
interface User {
  readonly id: UserId;
  readonly email: string;
  readonly name: string;
  readonly role: UserRole;
  readonly createdAt: Date;
}

const user: User = { id: userId('abc'), email: 'user@example.com', name: 'Alice', role: 'user', createdAt: new Date() };
user.name = 'Bob';   // ❌ TypeScript error: Cannot assign to 'name' because it is a read-only property
```

Note: `readonly` is shallow — it prevents reassigning `user.name` but not mutating `user.address.street` if `address` is a mutable object. For deep immutability, use nested `readonly` on all nested types.

**`Readonly<T>` utility type** — Applies `readonly` to all properties of an existing type, including inherited ones. **`ReadonlyArray<T>`** (equivalent to `readonly T[]`) prevents all array-mutating methods at the type level:

```typescript
// ReadonlyArray prevents mutation
const numbers: ReadonlyArray<number> = [1, 2, 3];
numbers.push(4);        // ❌ Error: Property 'push' does not exist on ReadonlyArray
numbers[0] = 99;        // ❌ Error: Index signature allows only reading
const sorted = [...numbers].sort(); // ✅ Copy then mutate the copy

// Readonly<T> prevents all property assignment
type ReadonlyUser = Readonly<User>;
// Equivalent to:
// { readonly id: UserId; readonly email: string; ... }
```

**`as const` assertion** — Two effects: narrows all values to their literal types, and makes all properties `readonly`. Essential for defining type-safe constants:

```typescript
// Without as const
const config = {
  host: 'localhost',
  port: 3000,
  env: 'development',
};
// type: { host: string; port: number; env: string }

// With as const
const config = {
  host: 'localhost',
  port: 3000,
  env: 'development',
} as const;
// type: { readonly host: 'localhost'; readonly port: 3000; readonly env: 'development' }

// The as const pattern for exhaustive union types
const ENVIRONMENTS = ['development', 'staging', 'production'] as const;
type Environment = typeof ENVIRONMENTS[number]; // 'development' | 'staging' | 'production'
```

**Generic functions** — Generics are the mechanism for polymorphic pure functions — functions that work on any type while remaining fully type-safe. The key insight is that generics let you express "this function is a transformation of some type T, and I don't need to know what T is":

```typescript
// Generic identity — the simplest possible generic function
const identity = <T>(x: T): T => x;

// Generic pipe — compose two functions
const pipe2 = <A, B, C>(
  f: (a: A) => B,
  g: (b: B) => C
): (a: A) => C =>
  (a) => g(f(a));

// Generic map — applies a transform to a wrapped value
const mapResult = <T, U>(
  result: Result<T>,
  transform: (value: T) => U
): Result<U> =>
  result.ok ? { ok: true, value: transform(result.value) } : result;

// Generic filter with type guard
const filterDefined = <T>(items: ReadonlyArray<T | null | undefined>): ReadonlyArray<T> =>
  items.filter((item): item is T => item !== null && item !== undefined);
```

**Higher-order functions** — `Array.prototype.map`, `filter`, `reduce`, `flatMap`, `find`, `findIndex`, `every`, `some`, `flat`. These are FP in JavaScript's standard library. Prefer them over imperative loops for data transformation.

```typescript
const users: ReadonlyArray<User> = getUsers();

// ✅ Declarative pipeline
const adminEmails = users
  .filter(u => u.role === 'admin' && u.isActive)
  .map(u => u.email)
  .sort();

// ❌ Imperative equivalent — harder to read, more error-prone
const adminEmails: string[] = [];
for (const user of users) {
  if (user.role === 'admin' && user.isActive) {
    adminEmails.push(user.email);
  }
}
adminEmails.sort();
```

## 3.3 Immutability: From Convention to Enforcement

Immutability is not just a pattern — it is a discipline that needs to be enforced to be effective. A codebase where 90% of functions are pure and 10% mutate freely is not an immutable codebase. The 10% creates the aliasing bugs, the surprise state changes, and the difficult-to-reproduce test failures.

**The immutability hierarchy in TypeScript:**

Level 1 — `const` prevents reassignment of the binding, not mutation of the value:
```typescript
const user = { name: 'Alice' };
user = { name: 'Bob' };  // ❌ Cannot reassign const
user.name = 'Bob';       // ✅ Allowed — const doesn't prevent mutation
```

Level 2 — `readonly` properties prevent property assignment at the type level:
```typescript
const user: { readonly name: string } = { name: 'Alice' };
user.name = 'Bob';  // ❌ TypeScript error: readonly property
```

Level 3 — `ReadonlyArray<T>` prevents array-mutating methods:
```typescript
const names: ReadonlyArray<string> = ['Alice', 'Bob'];
names.push('Charlie');   // ❌ TypeScript error
names.sort();            // ❌ TypeScript error
names.map(n => n);       // ✅ map/filter/reduce are non-mutating
```

Level 4 — `Object.freeze()` provides runtime enforcement:
```typescript
const config = Object.freeze({
  apiUrl: 'https://api.example.com',
  timeout: 5000,
});
config.apiUrl = 'http://evil.com'; // ❌ Runtime TypeError in strict mode
```

Level 5 — Structural sharing libraries (Immer.js, Immutable.js) for complex state trees.

For most application code, levels 2–3 provide sufficient immutability guarantees with zero runtime cost. Level 4 (`Object.freeze()`) is useful for configuration objects and well-known constants where runtime protection is worth the overhead. Level 5 is warranted for complex state management (Redux-style reducers) where deep structural sharing matters for performance.

**`eslint-plugin-functional`'s `immutable-data` rule** enforces that you never mutate objects or arrays. It flags:

```typescript
// All flagged by functional/immutable-data:
user.name = 'Bob';              // object mutation
users.push(newUser);            // array mutation
users.sort();                   // in-place sort
users[0] = differentUser;       // index mutation
delete user.temporaryField;     // property deletion
```

This rule has a moderate false-positive rate in infrastructure code (e.g., setting up test fixtures, building configuration objects incrementally), which is why targeted `eslint-disable` with explanations is acceptable at specific sites.

**The new immutable array methods (ES2023, TypeScript 5.x):**

```typescript
const numbers = [3, 1, 4, 1, 5, 9, 2, 6];

// Old: mutating (avoid)
const sorted = [...numbers].sort((a, b) => a - b); // copy first, then sort
const reversed = [...numbers].reverse();            // copy first, then reverse

// New: non-mutating (prefer)
const sorted = numbers.toSorted((a, b) => a - b);  // returns new sorted array
const reversed = numbers.toReversed();              // returns new reversed array
const withoutFirst = numbers.toSpliced(0, 1);       // returns new array with index 0 removed
const withUpdated = numbers.with(0, 99);            // returns new array with index 0 = 99
```

The `toSorted`, `toReversed`, `toSpliced`, and `with` methods are the 2023-era JavaScript additions that close the gap between "immutable by default" intent and the array API. They should be preferred over their mutating counterparts everywhere.

## 3.4 Pure Functions: Design and Verification

A pure function satisfies two invariants: (1) given the same arguments, it always returns the same value; (2) it produces no observable side effects (no mutation of external state, no I/O, no randomness, no time dependency).

TypeScript cannot enforce purity at the type level (unlike Haskell's `IO` monad). Purity is enforced by `eslint-plugin-functional` rules and by code review discipline. But understanding what makes a function impure is the essential prerequisite.

**Sources of impurity:**

```typescript
// 1. External state dependency
let counter = 0;
const getNextId = (): number => ++counter; // depends on external mutable state

// 2. Random values
const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]; // non-deterministic

// 3. Current time
const getTimestamp = (): string => new Date().toISOString(); // different on every call

// 4. I/O operations
const saveUser = async (user: User): Promise<void> => {
  await db.save(user); // side effect: writes to database
};

// 5. DOM/browser API access
const getWindowWidth = (): number => window.innerWidth; // depends on browser state

// 6. Object mutation
const addUser = (users: User[], user: User): void => {
  users.push(user); // mutates the input array
};
```

**Comparing pure and impure designs:**

```typescript
// ❌ Impure: accumulates in external state
let totalRevenue = 0;
const addOrderRevenue = (amount: number): void => {
  totalRevenue += amount;
};

// ✅ Pure: transforms input to output, no external state
const calculateTotalRevenue = (orders: ReadonlyArray<Order>): number =>
  orders.reduce((total, order) => total + order.amount, 0);

// ❌ Impure: mutates the user parameter
const activateUser = (user: User): void => {
  user.isActive = true;
  user.activatedAt = new Date();
};

// ✅ Pure: returns a new user object
const activateUser = (user: User, now: Date): User => ({
  ...user,
  isActive: true,
  activatedAt: now,  // time is injected as a parameter, not read from Date.now()
});
```

Notice the pattern in the pure `activateUser`: the current time is passed as a parameter rather than read from `new Date()`. This is the standard FP pattern for handling time dependency — inject the value rather than creating an external dependency. This makes the function fully deterministic and testable:

```typescript
// Test is simple and deterministic
const testDate = new Date('2024-01-01T00:00:00Z');
const activated = activateUser(inactiveUser, testDate);
expect(activated.activatedAt).toEqual(testDate);
// No mocking of Date required, no flaky timing behavior
```

**Effect isolation:** In functional architectures, side effects are pushed to the edges of the system. The business logic core is pure — it takes data in and returns new data. The infrastructure layer is where effects happen: database writes, HTTP calls, logging, emails. The boundary between pure core and effectful shell is explicit and enforced.

This is the "ports and adapters" (hexagonal architecture) pattern: pure domain logic is adapted to the outside world through side-effectful adapters. The domain doesn't know about the database; the database adapter doesn't know about domain rules.

**Verification without ceremony:** The simplest test for purity is setup/teardown overhead. If your test requires `beforeEach`, `afterEach`, mock injection, or external service stubbing to test a function, the function is probably impure. A pure function test is:

```typescript
test('calculateTotalRevenue sums order amounts', () => {
  const orders = [
    { id: '1', amount: 100 },
    { id: '2', amount: 250 },
    { id: '3', amount: 75 },
  ];
  expect(calculateTotalRevenue(orders)).toBe(425);
});
```

Zero setup, zero teardown, fully deterministic, runs instantly.

## 3.5 Function Composition with pipe and flow

Function composition is the fundamental mechanism for building complex behavior from simple, reusable functions. It is the FP alternative to inheritance for code reuse, and it has far superior properties: no coupling, no fragile base class problem, no diamond inheritance, and complete interchangeability of components.

**Basic composition:**

```typescript
// Function composition: output of one function is input of the next
const compose = <A, B, C>(f: (a: A) => B, g: (b: B) => C) =>
  (a: A): C => g(f(a));

const trim = (s: string): string => s.trim();
const lowercase = (s: string): string => s.toLowerCase();
const slugify = (s: string): string => s.replace(/\s+/g, '-');

const normalizeInput = compose(compose(trim, lowercase), slugify);
normalizeInput('  Hello World  ');  // → 'hello-world'
```

**`pipe` for left-to-right composition (reading order):**

```typescript
// Manual pipe for homogeneous types
const pipe = <T>(...fns: ReadonlyArray<(x: T) => T>) =>
  (value: T): T => fns.reduce((acc, fn) => fn(acc), value);

const normalizeInput = pipe(
  (s: string) => s.trim(),
  (s: string) => s.toLowerCase(),
  (s: string) => s.replace(/\s+/g, '-'),
);
```

**`pipe` with heterogeneous types (requires overloads or a library):**

```typescript
// With Remeda (handles type inference correctly)
import { pipe, filter, map, sortBy, take } from 'remeda';

const topActiveUsers = pipe(
  users,
  filter(u => u.isActive),
  sortBy(u => u.score, 'desc'),
  take(10),
  map(u => ({ id: u.id, name: u.name, score: u.score })),
);
// TypeScript infers the full type at each step correctly
```

**Real-world composition patterns:**

```typescript
// Composing validators
const validateEmail = (email: string): ValidationResult =>
  email.includes('@') ? valid() : invalid('Must be a valid email');

const validateLength = (min: number, max: number) =>
  (value: string): ValidationResult =>
    value.length >= min && value.length <= max
      ? valid()
      : invalid(`Must be between ${min} and ${max} characters`);

const validateRequired = (value: string): ValidationResult =>
  value.trim().length > 0 ? valid() : invalid('Required');

// Compose validators into a pipeline
const validateUserEmail = pipe(
  validateRequired,
  (v) => v.ok ? validateLength(5, 255)(v.input) : v,
  (v) => v.ok ? validateEmail(v.input) : v,
);
```

**`flow` (creates a composed function, evaluates lazily):**

```typescript
import { flow } from 'remeda';

// flow creates a function; pipe applies immediately
const processUserName = flow(
  (s: string) => s.trim(),
  (s: string) => s.toLowerCase(),
  (s: string) => s.replace(/\s+/g, '-'),
);

// processUserName is now a reusable transformation function
const slug1 = processUserName('  John Doe  ');   // 'john-doe'
const slug2 = processUserName('  Jane Smith  '); // 'jane-smith'
```

The `eslint-plugin-unicorn` rule `unicorn/no-array-for-each` nudges code away from `forEach` (which is inherently side-effectful and non-composable) towards `map`, `filter`, and `reduce` which return values and compose naturally.

## 3.6 Higher-Order Functions and Generics

Higher-order functions (functions that take or return functions) are the core mechanism of TypeScript FP. Generics make them type-safe across all possible types.

**The currying pattern for reusable, partially-applied functions:**

```typescript
// Curried: first call returns a configured function
const withMultiplier = (factor: number) =>
  (value: number): number => value * factor;

const double = withMultiplier(2);
const triple = withMultiplier(3);
const percentOf = (total: number) => withMultiplier(1 / 100)(total);

// Usage: clean, composable
const prices = [10, 20, 30];
const doubled = prices.map(double);           // [20, 40, 60]
const tripled = prices.map(triple);           // [30, 60, 90]
const fivePercent = percentOf(prices[0]!);    // 0.5
```

**Generic predicates for reusable filtering:**

```typescript
// Generic predicate factory
const isOfType = <T>(field: keyof T, value: T[typeof field]) =>
  (item: T): boolean => item[field] === value;

const isActive = isOfType<User>('isActive', true);
const isAdmin = isOfType<User>('role', 'admin');

// Usage
const activeUsers = users.filter(isActive);
const admins = users.filter(isAdmin);

// Compose predicates
const and = <T>(...predicates: ReadonlyArray<(item: T) => boolean>) =>
  (item: T): boolean => predicates.every(p => p(item));

const activeAdmins = users.filter(and(isActive, isAdmin));
```

**Generic transformers:**

```typescript
// Generic mapper
const toId = <T extends { readonly id: string }>(item: T): string => item.id;
const toName = <T extends { readonly name: string }>(item: T): string => item.name;

const userIds = users.map(toId);
const productNames = products.map(toName);

// Generic groupBy
const groupBy = <T, K extends string>(
  items: ReadonlyArray<T>,
  getKey: (item: T) => K
): Record<K, ReadonlyArray<T>> =>
  items.reduce(
    (groups, item) => {
      const key = getKey(item);
      const existing = groups[key] ?? [];
      return { ...groups, [key]: [...existing, item] };
    },
    {} as Record<K, ReadonlyArray<T>>
  );

const usersByRole = groupBy(users, u => u.role);
// { admin: [...], user: [...], guest: [...] }
```

**Generic Result type for error handling:**

```typescript
type Result<T, E = Error> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

// Pure error handling without try-catch
const safeDivide = (a: number, b: number): Result<number, string> =>
  b === 0 ? err('Division by zero') : ok(a / b);

const safeParseInt = (s: string): Result<number, string> => {
  const n = parseInt(s, 10);
  return isNaN(n) ? err(`Not a number: ${s}`) : ok(n);
};

// Chain results
const result = safeParseInt('42');
if (result.ok) {
  const divided = safeDivide(result.value, 7);
  console.log(divided.ok ? divided.value : divided.error);
}
```

## 3.7 Declarative Over Imperative

The declarative approach describes *what* you want; the imperative approach describes *how* to get it. Declarative code is typically shorter, more readable, and more directly expressive of intent. It also tends to be more amenable to optimization by the runtime.

**Head-to-head comparison:**

```typescript
// Scenario: Get the names of all active users with a score above 100, sorted descending

// ❌ Imperative: describes HOW
const getTopActiveUserNames = (users: User[]): string[] => {
  const result: string[] = [];
  for (let i = 0; i < users.length; i++) {
    const user = users[i]!;
    if (user.isActive && user.score > 100) {
      result.push(user.name);
    }
  }
  result.sort((a, b) => {
    const userA = users.find(u => u.name === a)!;
    const userB = users.find(u => u.name === b)!;
    return userB.score - userA.score;
  });
  return result;
};

// ✅ Declarative: describes WHAT
const getTopActiveUserNames = (users: ReadonlyArray<User>): ReadonlyArray<string> =>
  users
    .filter(u => u.isActive && u.score > 100)
    .sort((a, b) => b.score - a.score)
    .map(u => u.name);
```

The declarative version eliminates: the mutable `result` accumulator, the `for` loop with index, the `push` side effect, the awkward name-based lookup in the sort comparator. It expresses the intent in three operations: filter → sort → transform.

**When `reduce` is appropriate and when it's not:**

`reduce` is the most general array method — it can implement `map`, `filter`, `find`, and more. This generality is both its power and its curse. Overused, it produces code that is clever but unreadable:

```typescript
// ❌ Over-engineered: reduce used where map + filter would be clearer
const activeUserNames = users.reduce<string[]>(
  (acc, user) => user.isActive ? [...acc, user.name] : acc,
  []
);

// ✅ Idiomatic: filter then map
const activeUserNames = users
  .filter(u => u.isActive)
  .map(u => u.name);
```

`reduce` is appropriate when:
- The output type differs from the element type (aggregation, grouping, indexing)
- You need to process elements and build a result that isn't just a filtered/transformed array

```typescript
// ✅ Appropriate: groupBy produces Record<K, T[]>, not T[]
const usersByRole = users.reduce<Record<string, User[]>>(
  (groups, user) => ({
    ...groups,
    [user.role]: [...(groups[user.role] ?? []), user],
  }),
  {}
);

// ✅ Appropriate: count occurrences
const wordCounts = words.reduce<Record<string, number>>(
  (counts, word) => ({ ...counts, [word]: (counts[word] ?? 0) + 1 }),
  {}
);
```

The `unicorn/no-array-reduce: 'off'` setting in the proposed config reflects this nuance: FP teams use `reduce` deliberately and should not be prevented from doing so. The rule that does apply is using `reduce` for the right purposes.

## 3.8 Where OOP Is the Pragmatic Choice

FP-first does not mean OOP-never. Classes serve a genuine purpose in specific scenarios, and a pragmatic FP-first team recognizes those scenarios clearly.

**Lifecycle-aware objects.** Some abstractions inherently have a lifecycle — they are created, used over time, and eventually destroyed. A database connection pool, a WebSocket client, an event subscription manager — these maintain state across multiple operations in a way that a pure function cannot model cleanly. A class with a constructor, instance methods, and a `dispose()` or `close()` method is the natural fit:

```typescript
class DatabaseConnectionPool {
  private readonly connections: Connection[] = [];
  private isOpen = false;

  async initialize(config: PoolConfig): Promise<void> {
    this.connections.push(...await createConnections(config));
    this.isOpen = true;
  }

  async acquire(): Promise<Connection> {
    const conn = this.connections.find(c => !c.inUse);
    if (!conn) throw new Error('Pool exhausted');
    conn.inUse = true;
    return conn;
  }

  async release(conn: Connection): Promise<void> {
    conn.inUse = false;
  }

  async close(): Promise<void> {
    await Promise.all(this.connections.map(c => c.close()));
    this.isOpen = false;
  }
}
```

**Framework contracts.** NestJS controllers, TypeORM entities, Angular services, Express middleware — these frameworks expect classes. Attempting to use plain functions where a framework requires a class produces friction without benefit. Use classes where the framework requires them, and apply FP discipline within those classes.

**Domain aggregates in DDD.** An `Order` aggregate manages invariants across its child entities. This statefulness and invariant-enforcement maps well to a class with explicit `readonly` properties and methods that enforce business rules before mutating state:

```typescript
class Order {
  private constructor(
    readonly id: OrderId,
    readonly customerId: CustomerId,
    private _items: ReadonlyArray<OrderItem>,
    private _status: OrderStatus,
  ) {}

  static create(customerId: CustomerId): Order {
    return new Order(generateOrderId(), customerId, [], 'draft');
  }

  addItem(item: OrderItem): Order {
    if (this._status !== 'draft') {
      throw new DomainError('Can only add items to draft orders');
    }
    return new Order(this.id, this.customerId, [...this._items, item], this._status);
  }

  get items(): ReadonlyArray<OrderItem> { return this._items; }
  get status(): OrderStatus { return this._status; }
  get total(): Money { return this._items.reduce((sum, i) => sum.add(i.price), Money.zero()); }
}
```

Note: even in this OOP context, the `addItem` method returns a *new* `Order` rather than mutating `this._items`. FP discipline applies inside classes — `readonly` properties, immutable operations where practical.

**Error boundary components in React.** React 18 error boundaries still require class components (React 19 is adding function error boundaries, but until that lands widely, you need the class):

```typescript
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo): void {
    logError(error, info); // side effect: logging
  }

  override render(): React.ReactNode {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

## 3.9 The FP Library Landscape: Effect, Remeda, and the fp-ts Transition

The TypeScript FP library ecosystem clarified dramatically in 2024, resolving a period of fragmentation.

**The fp-ts → Effect transition**

fp-ts has been the canonical TypeScript FP library since 2018. It brought Haskell-style type classes (`Functor`, `Monad`, `Applicative`) to TypeScript, providing well-typed `Option`, `Either`, `TaskEither`, and similar abstractions. For teams that wanted typed effect handling and functional error propagation, it was the only serious option.

In 2024, fp-ts officially announced it was merging into the Effect-TS ecosystem. [6] Giulio Canti, fp-ts's author, joined the Effect organization. The fp-ts README now explicitly states: "Effect-TS can be regarded as the successor to fp-ts v2 and embodies what would be considered fp-ts v3."

For new projects starting in 2025, there is a clear recommendation: **Effect, not fp-ts.** [7][8][9]

**Effect-TS: What it provides**

Effect is a production-grade TypeScript library for building robust applications. The core type is `Effect<A, E, R>` — a lazy computation that:
- Produces a value of type `A` on success
- Fails with an error of type `E` (typed, not `unknown`)
- Requires an environment of type `R` (dependency injection at the type level)

```typescript
import { Effect, Context, Layer } from 'effect';

// Define a service interface
interface UserService {
  readonly getUser: (id: UserId) => Effect.Effect<User, UserNotFoundError>;
}

const UserService = Context.GenericTag<UserService>('UserService');

// Define the computation
const program = Effect.gen(function* () {
  const service = yield* UserService;
  const user = yield* service.getUser(userId('123'));
  return user.name;
});
// Type: Effect.Effect<string, UserNotFoundError, UserService>
// All three type parameters are explicit and visible

// Provide implementations
const live = Layer.succeed(UserService, {
  getUser: (id) => Effect.tryPromise({
    try: () => fetchUser(id),
    catch: (e) => new UserNotFoundError(id, e),
  }),
});

// Run with dependencies
const result = await Effect.runPromise(
  program.pipe(Effect.provide(live))
);
```

Effect's key benefits over raw TypeScript with Promises:
- **Typed errors.** `catch (e: unknown)` becomes `catch (e: UserNotFoundError | DatabaseError)` — all failure modes are explicit
- **Dependency injection at the type level.** The `R` type parameter tracks required services
- **Concurrency with fibers.** Structured concurrency that composes correctly
- **Retries and scheduling.** Built-in retry with exponential backoff, scheduled effects
- **Resource management.** `Effect.acquireRelease` for guaranteed cleanup

**Remeda: Pragmatic utilities without the learning curve**

For teams that want better-typed FP utilities without Effect's ecosystem investment, Remeda is the 2024 recommendation: [5]

```typescript
import { pipe, filter, sortBy, map, take, uniq } from 'remeda';

// Fully typed, no type casting needed
const result = pipe(
  orders,
  filter(o => o.status === 'completed'),
  sortBy([o => o.amount, 'desc']),
  take(5),
  map(o => ({ id: o.id, amount: o.amount })),
);
// Type correctly inferred at each step

// Remeda also provides non-curried versions for simple use
const sorted = sortBy(users, u => u.name);
const unique = uniq(tagIds);
```

Remeda advantages over Lodash:
- No `any` in type definitions — correct TypeScript inference throughout
- Tree-shakable — only import what you use
- `pipe` with proper multi-type inference
- Modern ES2020+ targets — no IE11 compatibility baggage

**Recommendation matrix:**

| Team situation | Recommendation |
|---|---|
| New project, team comfortable with FP | Effect for complex async/error handling; Remeda for utilities |
| New project, mixed FP experience | Remeda for utilities; native TypeScript FP patterns; consider Effect for specific services |
| Existing fp-ts codebase | Keep fp-ts for existing code; evaluate Effect migration for new services |
| Team new to FP | Native TypeScript FP patterns first; Remeda when utilities are needed |

## 3.10 Enforcing FP Discipline with eslint-plugin-functional

`eslint-plugin-functional` provides mechanically-enforced FP discipline. Understanding the rule groups and their impact is essential for calibrating the plugin to your team's needs. [10][11][12]

**Rule group reference:**

| Config | Rules Enabled | Use Case |
|---|---|---|
| `configs.lite` | Basic immutability + no-let | Minimal FP adoption |
| `configs.recommended` | Full immutability + stylistic | Pragmatic FP |
| `configs.strict` | All rules including no-classes | Full FP discipline |
| `configs.stylistic` | Stylistic FP patterns | Supplement to recommended |
| `configs.noMutations` | Only mutation rules | Targeted immutability focus |

**Rule-by-rule analysis for pragmatic teams:**

`functional/immutable-data` — **Keep as `error`.** This rule flags all object mutation and array mutation. It catches the most common source of aliasing bugs. False-positive rate is low once developers internalize the pattern of creating new objects/arrays instead of mutating.

```typescript
// ❌ Flagged
user.name = 'Bob';
users.push(newUser);

// ✅ Accepted
const updatedUser = { ...user, name: 'Bob' };
const updatedUsers = [...users, newUser];
```

`functional/no-let` — **Keep as `error`.** `let` declarations are mutation waiting to happen. Loop variables are the most common legitimate use. With `for-of` (prefer over indexed `for`), you rarely need `let`:

```typescript
// ❌ Flagged
let result = 0;
for (const n of numbers) { result += n; }

// ✅ Pure
const result = numbers.reduce((sum, n) => sum + n, 0);
```

`functional/no-method-signature` — **Keep as `error`.** Property signatures are immutable by default; method signatures are not:

```typescript
// ❌ Flagged: method signature is mutable
interface Repo {
  findById(id: string): User;
}

// ✅ Property signature: readonly by default
interface Repo {
  readonly findById: (id: string) => User;
}
```

`functional/prefer-immutable-types` — **Set to `warn`.** This rule encourages `readonly` on function parameters and return types. It's aspirational — you want to move towards it but don't want to block builds when library types aren't `readonly`:

```typescript
// Currently flagged at warn:
function processUsers(users: User[]): void { /* ... */ }

// Preferred:
function processUsers(users: ReadonlyArray<User>): void { /* ... */ }
```

`functional/no-classes` — **Keep `off` for React/framework code.** Classes are necessary for React error boundaries, NestJS controllers, TypeORM entities, and Angular services. Disabling globally would require fighting the framework.

`functional/no-expression-statements` — **Keep `off`.** This rule requires every statement to be an expression that returns a value — it forbids `void` calls, assignments (all assignments), and statements that exist purely for side effects. This is incompatible with React (`useEffect(() => {...})` is an expression statement) and with logging, I/O, and any side-effectful operation.

`functional/functional-parameters` — **Keep `off`.** This rule requires every function to have at least one parameter and no rest parameters. Zero-argument functions (`() => someValue()`) and rest parameters (`...args`) are common and legitimate.

`functional/no-throw-statements` — **Keep `off` for React.** React error boundaries rely on thrown errors. Infrastructure code at system boundaries (HTTP handlers, CLI entry points) commonly throws. The principle is worth teaching but too costly to enforce.

`functional/no-loop-statements` — **Keep `off`.** `for-of` loops are clean, readable, and idiomatic. The unicorn `no-for-loop` rule handles the specific case of indexed `for` loops (which should be replaced by `for-of` or `map`/`filter`).


---

# 4. Type System as a Design Tool

## 4.1 Beyond Basic Typing: Using Types to Encode Invariants

Most TypeScript developers use types reactively: they annotate variables, type function parameters, and let the compiler flag type errors. This is better than nothing, but it misses the deeper value of TypeScript's type system.

Senior engineers use types proactively: they *design* types before writing implementations. The question is not "how do I annotate this?" but "what states can this type represent, and which of those states are invalid?" When a type can represent invalid states, code must defend against those states at runtime. When a type can only represent valid states, the compiler does the defending — no runtime checks needed.

This principle — sometimes called "making illegal states unrepresentable," a phrase that originated in the Elm community and was popularized for TypeScript by various practitioners — is the most powerful application of TypeScript's type system. [20][21] It shifts the question from "did I handle the error case?" to "can this error case even occur?"

**The progression from defensive to type-safe design:**

Consider a form that requires either a card payment (with card number and CVV) or a PayPal payment (with a PayPal email). A naive type:

```typescript
// ❌ Naive: optional fields create invalid combinations
interface PaymentInfo {
  method: 'card' | 'paypal';
  cardNumber?: string;        // present for card, absent for paypal
  cvv?: string;              // present for card, absent for paypal
  paypalEmail?: string;      // present for paypal, absent for card
}

// This is representable but invalid — method says card but no cardNumber
const broken: PaymentInfo = {
  method: 'card',
  paypalEmail: 'user@example.com',  // wrong type for the method
  // cardNumber missing — required for card method but not enforced
};
```

With discriminated unions, the invalid combinations simply cannot be represented:

```typescript
// ✅ Discriminated union: each method has exactly its required fields
type PaymentInfo =
  | {
      readonly method: 'card';
      readonly cardNumber: string;
      readonly cvv: string;
      readonly expiryMonth: number;
      readonly expiryYear: number;
    }
  | {
      readonly method: 'paypal';
      readonly paypalEmail: string;
    }
  | {
      readonly method: 'bank-transfer';
      readonly accountNumber: string;
      readonly routingNumber: string;
      readonly accountHolderName: string;
    };

// The compiler prevents invalid combinations at every assignment
const payment: PaymentInfo = {
  method: 'card',
  paypalEmail: 'user@example.com', // ❌ Compile error: paypalEmail doesn't exist on card
};
```

The type has become the spec. Reading the `PaymentInfo` type tells you precisely what data each payment method requires — no documentation needed, no runtime validation needed beyond the parsing boundary.

## 4.2 Discriminated Unions: Making Invalid States Unrepresentable

A discriminated union is a union of types that share a common literal "discriminant" field. TypeScript uses the discriminant to narrow the type in conditional branches, automatically. [18][21][22]

**The anatomy of a discriminated union:**

```typescript
// Each member has the same field name ('kind') with a different literal value
type Shape =
  | { readonly kind: 'circle';    readonly radius: number }
  | { readonly kind: 'rectangle'; readonly width: number; readonly height: number }
  | { readonly kind: 'triangle';  readonly base: number;  readonly height: number };

// TypeScript narrows automatically based on the discriminant
const area = (shape: Shape): number => {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
      // TypeScript knows: shape.radius exists; shape.width does not
    case 'rectangle':
      return shape.width * shape.height;
      // TypeScript knows: shape.width and shape.height exist; shape.radius does not
    case 'triangle':
      return 0.5 * shape.base * shape.height;
  }
};
```

**Modeling async state — the most common pattern in React codebases:**

The naive approach to async state uses three separate boolean flags that can produce contradictory combinations:

```typescript
// ❌ Naive: 8 possible combinations, many invalid
interface AsyncState<T> {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  data?: T;
  error?: Error;
}

// Invalid but representable:
const broken = { isLoading: true, isSuccess: true, isError: false, data: someData };
// Simultaneously loading AND succeeded? Nonsense.
```

The discriminated union version:

```typescript
// ✅ Exactly 4 valid states, no invalid combinations
type AsyncState<T> =
  | { readonly status: 'idle' }
  | { readonly status: 'loading' }
  | { readonly status: 'success'; readonly data: T }
  | { readonly status: 'error'; readonly error: Error };

// Using it in a React component
function DataDisplay<T>({ state, render }: {
  state: AsyncState<T>;
  render: (data: T) => React.ReactElement;
}): React.ReactElement {
  switch (state.status) {
    case 'idle':
      return <p>Not yet started.</p>;
    case 'loading':
      return <Spinner />;
    case 'success':
      return render(state.data);      // TypeScript knows data exists
    case 'error':
      return <ErrorMessage error={state.error} />; // TypeScript knows error exists
  }
}
```

**State machine modeling with discriminated unions:**

Discriminated unions model state machines naturally because each state can carry its own data:

```typescript
// An order lifecycle as a state machine
type OrderStatus =
  | {
      readonly status: 'pending';
      readonly placedAt: Date;
    }
  | {
      readonly status: 'processing';
      readonly placedAt: Date;
      readonly processingStartedAt: Date;
      readonly assignedWarehouseId: string;
    }
  | {
      readonly status: 'shipped';
      readonly placedAt: Date;
      readonly shippedAt: Date;
      readonly trackingNumber: string;
      readonly carrier: string;
      readonly estimatedDelivery: Date;
    }
  | {
      readonly status: 'delivered';
      readonly placedAt: Date;
      readonly shippedAt: Date;
      readonly deliveredAt: Date;
    }
  | {
      readonly status: 'cancelled';
      readonly placedAt: Date;
      readonly cancelledAt: Date;
      readonly cancellationReason: string;
    };
```

This type perfectly models the business domain:
- A `pending` order has no warehouse assignment (not yet processing)
- A `shipped` order has a tracking number (didn't exist before shipping)
- A `delivered` order has a delivery timestamp (not available for pending/shipped)
- A `cancelled` order has a cancellation reason (doesn't apply to other states)

Every function that operates on an order can narrow to the exact state it needs:

```typescript
const getTrackingInfo = (order: Order & { readonly orderStatus: OrderStatus }): string | null => {
  switch (order.orderStatus.status) {
    case 'shipped':
    case 'delivered':
      return `${order.orderStatus.carrier}: ${order.orderStatus.trackingNumber}`;
    default:
      return null; // not shipped yet
  }
};
```

**Combining discriminated unions with Record types for exhaustive maps:**

```typescript
type Permission = 'read' | 'write' | 'admin' | 'delete';
type Role = 'guest' | 'user' | 'admin';

// Exhaustive mapping: every Role gets a defined set of Permissions
const ROLE_PERMISSIONS: Record<Role, ReadonlySet<Permission>> = {
  guest: new Set(['read']),
  user: new Set(['read', 'write']),
  admin: new Set(['read', 'write', 'admin', 'delete']),
} satisfies Record<Role, ReadonlySet<Permission>>;
// satisfies ensures we haven't missed a Role
```

## 4.3 Exhaustiveness Checking

Exhaustiveness checking is the compile-time guarantee that every branch of a discriminated union is handled. Without it, adding a new union member is a silent change — existing switch statements don't crash, they just fall through to a `default` that might return wrong data. [22]

**The `never` assertion pattern:**

```typescript
// The assertNever utility function
const assertNever = (value: never, message?: string): never => {
  throw new Error(
    message ?? `Unexpected unhandled value: ${JSON.stringify(value)}`
  );
};

// Usage in switch: the default branch receives never if all cases are handled
type Direction = 'north' | 'south' | 'east' | 'west';

const describeDirection = (direction: Direction): string => {
  switch (direction) {
    case 'north': return 'Heading north';
    case 'south': return 'Heading south';
    case 'east':  return 'Heading east';
    case 'west':  return 'Heading west';
    default:      return assertNever(direction); // TypeScript ensures this is never reached
  }
};

// If we add 'northeast' to Direction but forget to update this switch:
// type Direction = 'north' | 'south' | 'east' | 'west' | 'northeast';
// default: return assertNever(direction);
// ❌ TypeScript Error: Argument of type 'string' is not assignable to parameter of type 'never'
// The compiler guides you to every unhandled site.
```

**Using `@typescript-eslint/switch-exhaustiveness-check`:**

This rule automates the exhaustiveness check without requiring the manual `assertNever` pattern. When a switch statement switches over a discriminated union but doesn't handle all cases, the rule flags the switch statement:

```typescript
// With @typescript-eslint/switch-exhaustiveness-check enabled:
const handlePayment = (payment: PaymentInfo): void => {
  switch (payment.method) {
    case 'card':
      processCard(payment.cardNumber, payment.cvv);
      break;
    case 'paypal':
      processPayPal(payment.paypalEmail);
      break;
    // 'bank-transfer' is unhandled
    // ❌ ESLint: Switch is not exhaustive. Cases not matched: 'bank-transfer'
  }
};
```

The rule has an autofixer that inserts the missing case — useful when adding a new union member to find and update all switch statements across a large codebase.

**Exhaustiveness in object maps:**

Switch statements aren't the only place to enforce exhaustiveness. `Record<K, V>` where `K` is a union type enforces that every union member has an entry:

```typescript
type Status = 'idle' | 'loading' | 'success' | 'error';

// Record<Status, ...> requires all Status values to be present
const STATUS_LABELS: Record<Status, string> = {
  idle: 'Not started',
  loading: 'Loading...',
  success: 'Complete',
  error: 'Failed',
};
// Forgetting any Status value is a compile error
```

## 4.4 Branded/Nominal Types for Domain Value Objects

TypeScript's structural type system is one of its great strengths for composability, but it creates a subtle class of bugs in domain code: two strings with different semantic meanings are treated as interchangeable because they have the same structural type.

```typescript
// Both are strings — TypeScript sees no difference
type UserId = string;
type OrderId = string;
type ProductId = string;

function getOrder(orderId: OrderId): Promise<Order> { /* ... */ }

const userId: UserId = 'user-123';
getOrder(userId);  // TypeScript: fine. Production: silent bug — wrong ID type passed.
```

Branded types add a phantom type discriminant that makes distinct string types incompatible at the type level while remaining identical at runtime: [18][20]

```typescript
// The branding pattern
declare const __brand: unique symbol;
type Brand<T, TBrand extends string> = T & { readonly [__brand]: TBrand };

// Domain-specific types
type UserId = Brand<string, 'UserId'>;
type OrderId = Brand<string, 'OrderId'>;
type ProductId = Brand<string, 'ProductId'>;
type Email = Brand<string, 'Email'>;
type Money = Brand<number, 'Money'>;

// Smart constructors
const userId = (id: string): UserId => id as UserId;
const orderId = (id: string): OrderId => id as OrderId;
const email = (address: string): Email => {
  if (!address.includes('@')) throw new Error(`Invalid email: ${address}`);
  return address as Email;
};
const money = (amount: number): Money => {
  if (amount < 0) throw new Error(`Money cannot be negative: ${amount}`);
  return amount as Money;
};

// Usage: compile-time protection
function getOrder(orderId: OrderId): Promise<Order> { /* ... */ }

const uid: UserId = userId('user-123');
const oid: OrderId = orderId('order-456');

getOrder(uid);  // ❌ TypeScript Error: Argument of type 'UserId' is not assignable to type 'OrderId'
getOrder(oid);  // ✅ Correct
```

**When to use branded types — the cost/benefit analysis:**

| Use case | Branded type? | Reason |
|---|---|---|
| Entity IDs (UserId, OrderId) | **Yes** | Mixing IDs causes silent data corruption bugs |
| Email addresses | **Yes** | Validation invariant (must contain @); worth enforcing |
| Currency amounts (Money) | **Yes** | Units matter; USD vs. EUR confusion is a real bug class |
| Sanitized HTML | **Yes** | Unsanitized strings must not reach the DOM |
| Generic `string` variables | **No** | Overhead exceeds benefit for non-domain strings |
| Internal implementation details | **No** | Within a module's private scope, structural types are fine |

**Combining branded types with validation:**

```typescript
// Branded type for a validated email address
type Email = Brand<string, 'Email'>;

// Zod schema creates branded type via transform
import { z } from 'zod';

const EmailSchema = z.string().email().transform(s => s as Email);
type Email = z.infer<typeof EmailSchema>;

// Parse at the boundary
const email = EmailSchema.parse(userInput); // Email
// Inside the system, email is always a valid email address — no need to recheck
```

**Branded numbers for domain units:**

```typescript
// Prevent unit confusion
type USD = Brand<number, 'USD'>;
type EUR = Brand<number, 'EUR'>;
type Meters = Brand<number, 'Meters'>;
type Feet = Brand<number, 'Feet'>;

const usd = (amount: number): USD => amount as USD;
const eur = (amount: number): EUR => amount as EUR;

function addPrices(a: USD, b: USD): USD {
  return usd(a + b);  // only USD + USD is allowed
}

const price: USD = usd(100);
const europeanPrice: EUR = eur(90);
addPrices(price, europeanPrice);  // ❌ Compile error: EUR is not USD
```

## 4.5 The `satisfies` Operator: Validate Without Widening

TypeScript 4.9 introduced the `satisfies` operator. It resolves a long-standing design tension: you want to validate that an object conforms to a type, but you also want to preserve the most specific inferred type for each property. [19]

**The three type assignment mechanisms compared:**

```typescript
type ColorValue = string | [number, number, number];
type Theme = Record<string, ColorValue>;

// 1. Type annotation (: Type)
// Validates AND replaces the inferred type
const theme1: Theme = {
  primary: '#0099ff',    // inferred as string; annotated as ColorValue
  secondary: [0, 0, 255], // inferred as number[]; annotated as ColorValue
};
theme1.primary;    // type: ColorValue (string | [number, number, number]) — too wide
theme1.secondary;  // type: ColorValue — you've lost the knowledge that it's an RGB tuple

// 2. as Type (type assertion)
// Does NOT validate; replaces inferred type
const theme2 = {
  primary: '#0099ff',
  secondary: 'not-a-color',  // wrong value — TypeScript won't catch this
} as Theme;

// 3. satisfies Type
// Validates AND preserves specific types
const theme3 = {
  primary: '#0099ff',
  secondary: [0, 0, 255],
} satisfies Theme;
theme3.primary;    // type: string — preserved specific type
theme3.secondary;  // type: number[] — preserved specific type
theme3.missing;    // ❌ Property 'missing' does not exist on type 'Theme'
```

**Key use case: configuration objects where you need both validation and specific autocomplete:**

```typescript
type RouteConfig = {
  readonly [K: string]: {
    readonly method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    readonly auth: boolean;
    readonly rateLimit?: number;
  };
};

const routes = {
  '/api/users': { method: 'GET', auth: false, rateLimit: 100 },
  '/api/users/:id': { method: 'GET', auth: true },
  '/api/users/create': { method: 'POST', auth: true, rateLimit: 10 },
} satisfies RouteConfig;

// Each route preserves its specific shape
routes['/api/users'].method;         // type: 'GET' (not 'GET' | 'POST' | ...)
routes['/api/users/:id'].rateLimit;  // type: undefined (not number | undefined)
routes['/api/nonexistent'];          // TypeScript will warn about unknown key at access time
```

**`satisfies` with discriminated unions:**

```typescript
type PluginConfig =
  | { readonly type: 'database'; readonly url: string; readonly poolSize: number }
  | { readonly type: 'cache'; readonly host: string; readonly ttl: number }
  | { readonly type: 'queue'; readonly connectionString: string };

const pluginConfig = {
  type: 'database',
  url: 'postgresql://localhost/mydb',
  poolSize: 10,
} satisfies PluginConfig;

pluginConfig.url;      // type: string ← preserved, not widened
pluginConfig.poolSize; // type: number ← preserved
pluginConfig.host;     // ❌ Compile error: not on 'database' type
```

## 4.6 Template Literal Types and Conditional Types

TypeScript's advanced type features enable API designs that were impossible in JavaScript. They shift type-level logic from runtime checks to compile-time verification.

**Template literal types** capture string patterns as types: [4]

```typescript
// Event naming pattern
type EntityName = 'user' | 'order' | 'product';
type EventVerb = 'created' | 'updated' | 'deleted';
type DomainEvent = `${EntityName}.${EventVerb}`;
// → 'user.created' | 'user.updated' | 'user.deleted' | 'order.created' | ...

// Strongly-typed event bus
interface EventBus {
  publish(event: DomainEvent, payload: unknown): void;
  subscribe(event: DomainEvent, handler: (payload: unknown) => void): () => void;
}

bus.publish('user.created', newUser); // ✅
bus.publish('user.teleported', data); // ❌ Compile error: not a valid event

// Route pattern types
type ApiVersion = 'v1' | 'v2';
type Resource = 'users' | 'orders' | 'products';
type ApiRoute = `/api/${ApiVersion}/${Resource}`;

function callApi(route: ApiRoute): Promise<unknown> { /* ... */ }
callApi('/api/v1/users');    // ✅
callApi('/api/v3/users');    // ❌ Compile error: v3 not a valid version
callApi('/api/v1/invoices'); // ❌ Compile error: invoices not a valid resource
```

**Conditional types** for type-level branching:

```typescript
// Await: unwrap a Promise type
type Awaited<T> = T extends Promise<infer U> ? Awaited<U> : T;
// Awaited<Promise<string>> → string
// Awaited<Promise<Promise<number>>> → number
// Awaited<string> → string

// DeepReadonly: recursively make all properties readonly
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

// NonNullableDeep: recursively remove null and undefined
type DeepNonNullable<T> = {
  [K in keyof T]: NonNullable<DeepNonNullable<T[K]>>;
};

// RequireAtLeastOne: at least one property must be present
type RequireAtLeastOne<T, Keys extends keyof T = keyof T> =
  Pick<T, Exclude<keyof T, Keys>> &
  { [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>> }[Keys];

interface SearchFilters {
  userId?: string;
  orderId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

type SearchRequest = RequireAtLeastOne<SearchFilters>;
const search: SearchRequest = {};  // ❌ At least one filter required
const search: SearchRequest = { userId: '123' }; // ✅
```

**The `infer` keyword** for extracting types from complex structures:

```typescript
// Extract return type of an async function
type AsyncReturnType<T extends (...args: never[]) => Promise<unknown>> =
  T extends (...args: never[]) => Promise<infer R> ? R : never;

async function getUser(id: string): Promise<User> { /* ... */ }
type GetUserResult = AsyncReturnType<typeof getUser>; // → User

// Extract parameters of a function
type Parameters<T extends (...args: never[]) => unknown> =
  T extends (...args: infer P) => unknown ? P : never;

// Extract the element type of an array
type ElementOf<T extends ReadonlyArray<unknown>> =
  T extends ReadonlyArray<infer E> ? E : never;

const users: ReadonlyArray<User> = [];
type SingleUser = ElementOf<typeof users>; // → User

// Extract key-value pairs from a union
type ValueOf<T> = T[keyof T];
type UserRoleValue = ValueOf<typeof UserRole>; // 'admin' | 'user' | 'guest'
```

**Mapped types with key remapping:**

```typescript
// Create a type with all properties as optional, but with nullable default values
type WithDefaults<T, D extends Partial<T>> = {
  [K in keyof T]: K extends keyof D ? NonNullable<T[K]> : T[K];
};

// Create event handler types from a data type
type EventHandlers<T> = {
  readonly [K in keyof T as `onChange${Capitalize<string & K>}`]: (value: T[K]) => void;
};

interface FormData {
  name: string;
  email: string;
  age: number;
}

type FormHandlers = EventHandlers<FormData>;
// → { onChangeName: (value: string) => void; onChangeEmail: (value: string) => void; onChangeAge: (value: number) => void; }
```

## 4.7 `unknown` vs. `any`: Safe External Data Handling

The distinction between `unknown` and `any` is one of the most important in TypeScript. They look similar — both can hold any value — but their behavior is fundamentally different:

- **`any`**: You can do anything with an `any` value. Assign it to any type. Call it as a function. Access any property. TypeScript turns off all checking. `any` is a type-system exit hatch.

- **`unknown`**: You can hold any value, but you cannot do anything with it until you narrow it to a more specific type. It is type-safe: you must prove what an `unknown` value is before using it.

```typescript
// With any — dangerous
const processData = (data: any): string => {
  return data.user.name.toUpperCase(); // TypeScript doesn't check any of this
  // If data is null, data.user throws TypeError
  // If data.user.name is undefined, .toUpperCase() throws TypeError
};

// With unknown — safe
const processData = (data: unknown): string => {
  // Must narrow before using
  if (
    typeof data === 'object' &&
    data !== null &&
    'user' in data &&
    typeof (data as { user: unknown }).user === 'object' &&
    (data as { user: unknown }).user !== null &&
    'name' in (data as { user: unknown }).user! &&
    typeof ((data as { user: { name: unknown } }).user.name) === 'string'
  ) {
    return (data as { user: { name: string } }).user.name.toUpperCase();
  }
  throw new Error('Invalid data structure');
};

// Or better, use a schema parser:
const processData = (data: unknown): string => {
  const parsed = z.object({ user: z.object({ name: z.string() }) }).parse(data);
  return parsed.user.name.toUpperCase(); // completely safe
};
```

**The `any` contamination problem:**

`any` is contagious. Once a value enters your codebase as `any`, it spreads through every operation:

```typescript
const getConfig = (): any => fetchConfig(); // returns any

const config = getConfig();
const port = config.server.port;  // port: any — TypeScript no longer checks
const portNumber = port + 80;     // portNumber: any — still untyped
```

The `@typescript-eslint/no-unsafe-assignment`, `no-unsafe-member-access`, and `no-unsafe-call` rules catch `any` propagation. They flag usages where `any` values are being used in typed contexts, preventing the contamination from spreading silently.

**`useUnknownInCatchVariables`:**

TypeScript 4.4 added this `strict` sub-flag, and it is critical. Before it, `catch (e)` variables had type `any`. With it, they have type `unknown`:

```typescript
// Without useUnknownInCatchVariables (or pre-TS4.4)
try {
  await doSomething();
} catch (e) {
  console.log(e.message); // e is any — TypeScript allows this even if e isn't an Error
}

// With useUnknownInCatchVariables (part of strict: true)
try {
  await doSomething();
} catch (e) {
  // e is unknown — must narrow before use
  if (e instanceof Error) {
    console.log(e.message); // safe
  } else {
    console.log('Unknown error:', e);
  }
}
```

The `instanceof Error` check is the minimal narrowing. For more sophisticated error handling:

```typescript
import { z } from 'zod';

// Pattern: convert unknown catch values to typed errors
const toError = (e: unknown): Error =>
  e instanceof Error ? e : new Error(String(e));

try {
  await riskyOperation();
} catch (e) {
  const error = toError(e);
  logger.error('Operation failed', { message: error.message, stack: error.stack });
  throw error;
}
```

## 4.8 Utility Types as Composition Tools

TypeScript's built-in utility types are the vocabulary of type-level composition. They are the "std library" of the TypeScript type system, and mastery of them distinguishes engineers who fight the type system from engineers who work with it.

**Fundamental utility types:**

```typescript
// Partial: all properties optional — for update DTOs, patch requests
type UserUpdateInput = Partial<User>;

// Required: all properties required — for validated forms
type UserFormValues = Required<UserUpdateInput>;

// Pick: select specific properties — for projections, focused interfaces
type UserListItem = Pick<User, 'id' | 'name' | 'email' | 'role'>;

// Omit: exclude specific properties — for create DTOs (omit server-set fields)
type UserCreateInput = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;

// Record: map keys to values — for lookup tables, counters
type UserById = Record<UserId, User>;
type RolePermissions = Record<Role, ReadonlySet<Permission>>;

// Readonly: immutable version — for values that shouldn't change after creation
type ImmutableUser = Readonly<User>;

// ReturnType: extract function return type — for type-safe result handling
const createUser = async (input: UserCreateInput): Promise<User> => { /* ... */ };
type CreatedUser = Awaited<ReturnType<typeof createUser>>; // → User

// Parameters: extract function parameter types
type CreateUserParams = Parameters<typeof createUser>; // [UserCreateInput]

// InstanceType: extract class instance type
class UserRepository { /* ... */ }
type Repo = InstanceType<typeof UserRepository>;
```

**Advanced utility type compositions:**

```typescript
// A PATCH DTO: most fields optional, id required
type UserPatchDto = Pick<User, 'id'> & Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>;

// RequireKeys: make specific keys required from a Partial
type RequireKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;
type UserWithRequiredEmail = RequireKeys<Partial<User>, 'email' | 'id'>;

// Mutable: remove readonly from all properties (use sparingly — for test fixtures)
type Mutable<T> = { -readonly [K in keyof T]: T[K] };

// DeepRequired: recursively require all optional properties
type DeepRequired<T> = {
  [K in keyof T]-?: T[K] extends object ? DeepRequired<T[K]> : T[K];
};

// Nullable: add null to all properties
type Nullable<T> = { [K in keyof T]: T[K] | null };

// StrictExtract: extract union members that exactly match
type StrictExtract<T, U extends T> = T extends U ? T : never;
```

**Template literal utility types for string manipulation:**

```typescript
type Capitalize<S extends string> = // built-in
  S extends `${infer F}${infer R}` ? `${Uppercase<F>}${R}` : S;

type Camelcase<S extends string> =
  S extends `${infer Head}_${infer Tail}`
    ? `${Head}${Capitalize<Camelcase<Tail>>}`
    : S;

type GettersOf<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

interface User { id: string; name: string; email: string; }
type UserGetters = GettersOf<User>;
// → { getId: () => string; getName: () => string; getEmail: () => string; }
```

## 4.9 Type Inference: Leverage It, Know Its Limits

TypeScript's inference engine is sophisticated. It infers variable types from initializers, return types from function bodies, generic type parameters from arguments, and conditional type evaluations from input types. Used well, inference reduces annotation noise without reducing type safety. Used poorly, it produces types that are too wide, obscure intent, or break when the implementation changes.

**The inference sweet spots:**

```typescript
// ✅ Inference is obvious and reduces noise
const count = 42;                // number
const users = [] as User[];      // User[] (empty array needs a hint)
const greet = (name: string) => `Hello, ${name}`; // (name: string) => string

// ✅ Inference through generics works perfectly
const firstUser = users[0];     // User | undefined (with noUncheckedIndexedAccess)
const names = users.map(u => u.name);  // string[]
const adminUsers = users.filter(u => u.role === 'admin'); // User[]
```

**Where annotation adds value:**

```typescript
// ✅ Annotate exported function return types — contract visibility
export const processOrder = async (orderId: OrderId): Promise<ProcessedOrder> => {
  /* implementation */
};
// Without annotation, changing the return shape silently breaks the contract

// ✅ Annotate when inference would be too wide
const status = 'loading';  // inferred as string without annotation
const status: LoadingStatus = 'loading';  // inferred as literal 'loading'
// Or use as const:
const status = 'loading' as const;  // type: 'loading'

// ✅ Annotate class properties when initialization is deferred
class UserService {
  private cache: Map<UserId, User>;  // explicit type needed

  constructor() {
    this.cache = new Map();
  }
}
```

**When inference goes wrong and how to fix it:**

```typescript
// ❌ Over-inference: widened array type
const roles = ['admin', 'user', 'guest']; // string[] — loses literal types

// ✅ Fix: as const or explicit type
const roles = ['admin', 'user', 'guest'] as const; // readonly ['admin', 'user', 'guest']
const roles: ReadonlyArray<Role> = ['admin', 'user', 'guest']; // Role[]

// ❌ Under-inference: generic function can't infer correctly
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}
const x = first([1, 2, 3]);  // T inferred as number — correct
const y = first([]);          // T inferred as unknown — may not be what you want

// ✅ Constrain the generic for better inference
function first<T extends readonly unknown[]>(arr: T): T[number] | undefined {
  return arr[0];
}
```

**The annotation principle:** annotate for communication, not for the compiler. Annotation adds value when:
1. You are declaring a public contract (exported function)
2. The inferred type is too wide or too narrow for the intended use
3. The annotation makes the intent clearer to the next reader
4. You want the compiler to catch implementation deviations from the intent

When annotation just repeats what the compiler already knows (`const count: number = 42`), it is noise. Remove it.


---

# 5. Modularization & Architecture

## 5.1 Feature-Based vs. Technical-Role Module Layout

The organizational structure of a TypeScript codebase is one of the most consequential architectural decisions a team makes, and it's one that is often made implicitly by following a tutorial or copying an existing project without asking whether the structure scales.

There are two primary approaches: organize by technical role (all components together, all services together, all utilities together) or organize by feature/domain (everything related to the `cart` feature in one place, everything related to `user-profile` in another).

**Technical-role layout — the older convention:**

```
src/
├── components/
│   ├── CartList.tsx
│   ├── ProductCard.tsx
│   ├── UserProfile.tsx
│   ├── OrderHistory.tsx
│   └── PaymentForm.tsx
├── hooks/
│   ├── useCart.ts
│   ├── useProduct.ts
│   ├── useUser.ts
│   └── useOrders.ts
├── services/
│   ├── cartService.ts
│   ├── productService.ts
│   └── userService.ts
├── types/
│   ├── cart.ts
│   ├── product.ts
│   └── user.ts
└── utils/
    ├── cartUtils.ts
    └── formatters.ts
```

This structure fails at scale for a fundamental reason: **it organizes by what code is, not by what it does**. When you need to understand, modify, or delete the `cart` feature, you must navigate five separate directories. The cart components are in `components/`, their hooks are in `hooks/`, the service is in `services/`, the types are in `types/`, and the utilities are in `utils/`. A change to how the cart calculates totals might touch files in every one of those directories.

The coupling is invisible. Nothing in the directory structure tells you which files in `hooks/` depend on which files in `services/`. Those dependencies exist, but they're encoded in import statements rather than in the folder structure.

**Feature-based layout (vertical slices / screaming architecture):** [15]

```
src/
├── features/
│   ├── cart/
│   │   ├── components/
│   │   │   ├── CartList.tsx
│   │   │   ├── CartItem.tsx
│   │   │   └── CartSummary.tsx
│   │   ├── hooks/
│   │   │   ├── useCart.ts
│   │   │   └── useCartTotals.ts
│   │   ├── domain/
│   │   │   ├── cartCalculations.ts    ← pure functions
│   │   │   └── cartValidation.ts     ← pure functions
│   │   ├── infrastructure/
│   │   │   └── cartRepository.ts     ← data access
│   │   ├── types.ts                  ← feature-specific types
│   │   └── index.ts                  ← public API boundary
│   ├── checkout/
│   │   └── index.ts
│   ├── product-catalog/
│   │   └── index.ts
│   └── user-profile/
│       └── index.ts
├── shared/
│   ├── components/                   ← truly shared UI (Button, Modal, etc.)
│   ├── hooks/                        ← truly shared hooks (useDebounce, etc.)
│   ├── utils/                        ← utility functions used by 3+ features
│   └── types.ts                      ← shared domain types
└── App.tsx
```

This structure organizes by what the code *does* and which domain concern it belongs to. All cart code is in `features/cart`. To understand the cart feature, you navigate one directory. To delete the cart feature, you delete one directory.

**The `index.ts` as a deliberate API contract:**

Each feature's `index.ts` is not a convenience barrel — it is a contract. It declares exactly what this feature exposes to the rest of the application:

```typescript
// features/cart/index.ts — explicit public API
export { CartList } from './components/CartList';
export { CartSummary } from './components/CartSummary';
export { useCart } from './hooks/useCart';
export type { Cart, CartItem, CartTotals } from './types';

// NOT exported — internal implementation details:
// CartItem component, useCartTotals hook, cartCalculations, cartRepository
```

Other features import from `@/features/cart`, not from `@/features/cart/hooks/useCart`. This gives the cart team freedom to refactor internals (rename hooks, restructure files, extract new components) without breaking other features. The `index.ts` is the stable interface; everything behind it is mutable implementation.

**The rule for deciding where something lives:**

Code that changes together belongs together. This is Conway's Law in reverse: your module structure should reflect your domain structure, not your team structure. Practical heuristics:
- If you modified two files together in the last 5 commits, they probably belong in the same feature
- If a file is imported by 5+ different features, it belongs in `shared/`
- If a type is used only within one feature, it belongs in that feature's `types.ts`
- If a component has never been used outside its original feature, it belongs in that feature's `components/`

## 5.2 Clean Architecture and DDD in TypeScript

For domain-complex applications, a layered architecture makes the dependency structure explicit and enforces separation of concerns at the module level.

**Clean Architecture in TypeScript:** [16]

The canonical layers and their responsibilities:

```
src/
├── domain/              ← Business logic. Zero external dependencies.
│   ├── entities/        ← Core business objects with identity
│   │   ├── Order.ts
│   │   ├── Product.ts
│   │   └── User.ts
│   ├── value-objects/   ← Immutable value types
│   │   ├── Money.ts
│   │   ├── Email.ts
│   │   └── Address.ts
│   ├── events/          ← Domain events (things that happened)
│   │   ├── OrderPlaced.ts
│   │   └── UserRegistered.ts
│   └── interfaces/      ← Repository contracts (abstract, no implementations)
│       ├── OrderRepository.ts
│       └── UserRepository.ts
│
├── application/         ← Use cases. Depends on domain only.
│   ├── commands/        ← Write operations (create/update/delete)
│   │   ├── PlaceOrder.ts
│   │   └── CancelOrder.ts
│   ├── queries/         ← Read operations
│   │   ├── GetOrderById.ts
│   │   └── ListUserOrders.ts
│   └── dtos/            ← Data transfer objects for use case I/O
│       └── OrderDto.ts
│
├── infrastructure/      ← External systems. Implements domain interfaces.
│   ├── persistence/     ← Database implementations
│   │   ├── PrismaOrderRepository.ts
│   │   └── schema.prisma
│   ├── messaging/       ← Message queues, event buses
│   │   └── RabbitMQEventBus.ts
│   └── http/            ← External API clients
│       └── StripePaymentClient.ts
│
└── presentation/        ← Entry points. Depends on application layer.
    ├── api/
    │   ├── routes/
    │   │   └── orders.ts
    │   └── server.ts
    └── react/           ← Or: Next.js pages, React components
        └── pages/
```

**The dependency rule, stated precisely:** arrows only point inward. `infrastructure` can import from `domain`. `application` can import from `domain`. `presentation` can import from `application`. `domain` imports from nothing — it has zero external dependencies.

This constraint has three enormous consequences:

1. **The domain is independently testable.** Unit tests for domain logic require no framework setup, no database, no HTTP client. They test pure TypeScript functions and classes in isolation.

2. **Infrastructure is replaceable.** You can swap PostgreSQL for MongoDB, REST for GraphQL, Redis for Memcached — without touching domain logic or use cases. The interface stays the same; the implementation changes.

3. **The domain evolves independently.** New business rules are added to domain entities and use cases without coupling to which framework is currently rendering the UI.

**DDD tactical patterns in TypeScript:**

*Value Objects* — immutable types identified by their value, not by identity:

```typescript
class Money {
  private constructor(
    private readonly _amount: number,
    private readonly _currency: 'USD' | 'EUR' | 'GBP'
  ) {
    if (!Number.isFinite(_amount) || _amount < 0) {
      throw new DomainError(`Invalid amount: ${_amount}`);
    }
  }

  static of(amount: number, currency: 'USD' | 'EUR' | 'GBP'): Money {
    return new Money(amount, currency);
  }

  get amount(): number { return this._amount; }
  get currency(): typeof this._currency { return this._currency; }

  add(other: Money): Money {
    if (this._currency !== other._currency) {
      throw new DomainError(`Cannot add ${this._currency} and ${other._currency}`);
    }
    return new Money(this._amount + other._amount, this._currency);
  }

  multiply(factor: number): Money {
    return new Money(this._amount * factor, this._currency);
  }

  equals(other: Money): boolean {
    return this._amount === other._amount && this._currency === other._currency;
  }

  toString(): string {
    return `${this._currency} ${this._amount.toFixed(2)}`;
  }
}
```

*Entities* — objects identified by their unique ID, not by their properties:

```typescript
interface OrderItem {
  readonly productId: ProductId;
  readonly quantity: number;
  readonly unitPrice: Money;
}

// An entity: identity through ID, immutable properties
interface Order {
  readonly id: OrderId;
  readonly customerId: CustomerId;
  readonly items: ReadonlyArray<OrderItem>;
  readonly status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  readonly placedAt: Date;
  readonly total: Money;
}
```

*Domain Events* — immutable records of things that happened:

```typescript
interface DomainEvent {
  readonly eventId: string;
  readonly occurredAt: Date;
}

interface OrderPlaced extends DomainEvent {
  readonly eventType: 'OrderPlaced';
  readonly orderId: OrderId;
  readonly customerId: CustomerId;
  readonly items: ReadonlyArray<OrderItem>;
  readonly total: Money;
}

interface OrderCancelled extends DomainEvent {
  readonly eventType: 'OrderCancelled';
  readonly orderId: OrderId;
  readonly reason: string;
  readonly cancelledAt: Date;
}

type OrderEvent = OrderPlaced | OrderCancelled;
```

*Repository interfaces* — abstract persistence contracts:

```typescript
interface OrderRepository {
  readonly findById: (id: OrderId) => Promise<Order | null>;
  readonly findByCustomerId: (customerId: CustomerId) => Promise<ReadonlyArray<Order>>;
  readonly save: (order: Order) => Promise<void>;
  readonly delete: (id: OrderId) => Promise<void>;
}
```

The key insight: the `OrderRepository` interface lives in the domain layer. The implementation (`PrismaOrderRepository`) lives in the infrastructure layer. Domain code depends on the interface, never on the implementation.

## 5.3 Dependency Direction Rules

The dependency rule is simple to state and difficult to maintain at scale: **high-level policy must not depend on low-level details.** Business logic must not know about databases, HTTP, file systems, or external APIs.

In practice, violations creep in over time:
- A business rule function imports a Prisma client directly
- A domain service imports an HTTP client to call an external API
- A calculation utility imports a logger
- A validation function imports an environment variable

Each violation creates coupling. The business rule can no longer be tested without the database. The domain service can no longer be reused in a different context. The calculation function's behavior depends on logging configuration.

**Enforcing dependency direction with ESLint:**

```typescript
// In eslint.config.ts — add boundary enforcement to domain layer files
{
  files: ['src/domain/**/*.ts'],
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [
        {
          group: ['*/infrastructure/*', '*/persistence/*', '*/http/*'],
          message: 'Domain layer must not import from infrastructure. Use dependency injection.',
        },
        {
          group: ['express', 'fastify', 'hapi', 'prisma', 'typeorm', 'mongoose'],
          message: 'Domain layer must not import framework/database libraries.',
        },
      ],
    }],
  },
},
{
  files: ['src/application/**/*.ts'],
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [
        {
          group: ['*/infrastructure/*', '*/persistence/*', '*/http/*'],
          message: 'Application layer must not import from infrastructure. Use dependency injection.',
        },
      ],
    }],
  },
},
```

**TypeScript project references for build-level enforcement:**

ESLint rules are bypassed when someone adds `// eslint-disable-next-line`. TypeScript project references provide a second, harder-to-bypass layer of enforcement:

```json
// packages/domain/tsconfig.json
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "rootDir": "./src",
    "outDir": "./dist"
  },
  "references": []  // Domain references nothing
}

// packages/application/tsconfig.json
{
  "compilerOptions": {
    "composite": true
  },
  "references": [
    { "path": "../domain" }  // Application can reference domain
    // No infrastructure reference — enforced at build time
  ]
}
```

With project references, the TypeScript compiler refuses to compile `application` if it imports from `infrastructure`. This is architectural enforcement that cannot be bypassed with an `eslint-disable` comment.

## 5.4 The Barrel File Debate

The barrel file controversy has produced more engineering blog posts than almost any other TypeScript topic. After years of debate, the community has largely converged on a position: barrel files are harmful in application code and acceptable only at deliberate public API boundaries. [13][14]

**The performance case against barrel files:**

A developer at TkDodo documented removing barrel files from a Next.js application and reducing the module count from 11,000 to 3,500 — a 68% reduction. [13] The startup time for the development server dropped proportionally. The mechanism is tree-shaking failure: when you import one export from a barrel that re-exports 50 modules, the bundler must load and analyze all 50 modules to ensure it can resolve your import correctly, even if only one of them is used.

The effect compounds: if `features/cart/index.ts` barrel re-exports from 10 files, and `features/shared/index.ts` barrel re-exports from 20 files, and `App.tsx` imports from both, the bundler traverses 30 files to satisfy two imports. In a large application with deep barrel nesting, module counts in the tens of thousands are achievable without a single line of business code being unusual.

**The circular dependency risk:**

Barrel files make circular dependencies easy to create accidentally. If `featureA/index.ts` re-exports from `featureA/utils.ts`, and `featureA/utils.ts` imports from `featureA/components.ts`, and `featureA/components.ts` imports from `featureA/index.ts` (the barrel) for convenience, a cycle exists. The barrel is the common dependency that everything connects to, creating a hub-and-spoke topology that's fertile ground for cycles.

**The TypeScript server performance impact:**

The TypeScript language server must resolve all barrel exports to provide accurate autocomplete and error detection. Large barrel files slow down IDE responsiveness measurably. Engineers at companies with large TypeScript codebases (Microsoft, Airbnb, Stripe) have documented significant language server performance improvements after removing barrel files.

**The pattern that is acceptable:**

```typescript
// ✅ features/cart/index.ts — deliberate, selective public API
// This is fine because it's a conscious architectural boundary, not convenience
export { CartList } from './components/CartList';
export { useCart } from './hooks/useCart';
export type { Cart, CartItem } from './types';

// ❌ Avoid re-exporting everything blindly
export * from './components/CartList';    // exports internals
export * from './components/CartItem';    // exposes implementation details
export * from './hooks/useCart';
export * from './hooks/useCartTotals';
export * from './domain/cartCalculations'; // internal utility
```

**The library author exception:**

For published npm packages, barrel files make sense because:
1. Consumers don't use bundlers the same way as applications — many library consumers are server-side or use the library in contexts where module count matters less
2. The alternative (`import { http } from 'msw/http.js'` instead of `import { http } from 'msw'`) requires updating every import in every consumer when the library refactors

The solution for library authors is the `package.json` `exports` field with subpath exports, which achieves the same result (stable import paths) without the barrel file performance penalty. [14]

## 5.5 TypeScript Paths and Module Aliases

Deep relative imports (`../../../../domain/interfaces/UserRepository`) are a maintenance hazard. When you move a file, every import must be updated. When you're reading code, you must mentally count levels to understand where the import comes from.

TypeScript `paths` configuration in `tsconfig.json` provides clean, stable import paths:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@domain/*": ["src/domain/*"],
      "@application/*": ["src/application/*"],
      "@infrastructure/*": ["src/infrastructure/*"],
      "@presentation/*": ["src/presentation/*"],
      "@shared/*": ["src/shared/*"],
      "@features/*": ["src/features/*"]
    }
  }
}
```

With this configuration:

```typescript
// ✅ Absolute, stable, readable imports
import type { UserRepository } from '@domain/interfaces/UserRepository';
import type { User } from '@domain/entities/User';
import { GetUserUseCase } from '@application/queries/GetUserById';
import { formatCurrency } from '@shared/utils/formatters';

// ❌ Fragile relative imports — break when files move
import type { UserRepository } from '../../../../domain/interfaces/UserRepository';
import type { User } from '../../../domain/entities/User';
```

**Bundler configuration for paths:**

`tsconfig.json` paths only affect the TypeScript compiler and language server. For runtime resolution, each bundler needs its own alias configuration:

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@domain': path.resolve(__dirname, 'src/domain'),
      '@application': path.resolve(__dirname, 'src/application'),
      '@shared': path.resolve(__dirname, 'src/shared'),
    },
  },
});

// webpack.config.ts
module.exports = {
  resolve: {
    alias: {
      '@domain': path.resolve(__dirname, 'src/domain'),
    },
  },
};

// jest.config.ts (for tests)
module.exports = {
  moduleNameMapper: {
    '^@domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
  },
};
```

**The `eslint-plugin-import-x` `resolver-next` option:**

For `import-x/no-cycle` and `import-x/no-unresolved` to understand TypeScript paths, configure the TypeScript import resolver:

```typescript
// In eslint.config.ts
settings: {
  'import-x/resolver-next': [
    {
      name: 'typescript',
      options: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
    },
  ],
},
```

## 5.6 Circular Dependency Detection and Prevention

Circular dependencies are a structural smell that often indicate architectural violations: two modules that should not know about each other have developed an implicit coupling. When A imports from B and B imports from A, one of them loads in an uninitialized state, producing the dreaded "is not a function" or "is undefined" runtime errors that only appear in specific import orders.

**The failure mode:**

```typescript
// moduleA.ts
import { functionFromB } from './moduleB';
export const functionFromA = () => functionFromB() + 1;
export const constantA = 42;

// moduleB.ts
import { constantA } from './moduleA'; // circular
export const functionFromB = () => constantA * 2;
// When moduleB loads, moduleA hasn't finished loading
// constantA is undefined at this point — silently
```

**Detection with `madge`:**

```bash
# Install and run
npx madge --circular --extensions ts,tsx src/
# Output: ● Circular Dependencies (3)
# src/features/cart/hooks/useCart.ts → src/features/cart/index.ts → src/features/cart/hooks/useCart.ts
```

**Detection with `eslint-plugin-import-x`:**

```typescript
'import-x/no-cycle': ['error', {
  maxDepth: Infinity,  // check all cycle depths
  ignoreExternal: true, // don't check node_modules (too slow)
}],
```

With `maxDepth: Infinity`, the rule detects cycles of any depth — not just direct cycles (A → A) but transitive ones (A → B → C → A).

**Breaking cycles — three strategies:**

*Strategy 1: Extract shared types to a neutral module*

The most common cycle pattern: two modules both depend on a type that neither should own. Move the type to a `types.ts` or `interfaces.ts` that both can import from:

```typescript
// ❌ Cycle: userService.ts ←→ authService.ts
// userService.ts imports AuthToken from authService.ts
// authService.ts imports User from userService.ts

// ✅ Extract shared types
// types/auth.ts
export interface AuthToken { /* ... */ }
// types/user.ts
export interface User { /* ... */ }

// userService.ts
import type { AuthToken } from '@shared/types/auth';

// authService.ts
import type { User } from '@shared/types/user';
```

*Strategy 2: Dependency inversion*

If module A needs functionality from module B, and module B needs functionality from module A, pass B's functionality to A as a parameter rather than importing it:

```typescript
// ❌ Cycle
// orderService.ts imports notificationService.ts
// notificationService.ts imports orderService.ts to get order details

// ✅ Break cycle with dependency injection
// orderService.ts
interface OrderCompletedHandler {
  handleOrderCompleted: (orderId: OrderId) => Promise<void>;
}

class OrderService {
  constructor(private readonly onOrderCompleted: OrderCompletedHandler) {}
  
  async completeOrder(orderId: OrderId): Promise<void> {
    // ...
    await this.onOrderCompleted.handleOrderCompleted(orderId);
  }
}

// notificationService.ts — implements the handler, no cycle
class NotificationService implements OrderCompletedHandler {
  async handleOrderCompleted(orderId: OrderId): Promise<void> { /* ... */ }
}
```

*Strategy 3: Merge related modules*

Sometimes a cycle indicates that two modules are really one cohesive unit. If `userHelpers.ts` and `userTypes.ts` always import from each other, they belong in the same file.

## 5.7 Monorepo Considerations

Large organizations often structure TypeScript code in monorepos — single repositories containing multiple packages that depend on each other. TypeScript's built-in support for monorepos through project references makes this the preferred approach over copying types between repositories.

**TypeScript project references:**

Project references create explicit, compiler-enforced dependencies between TypeScript packages in a monorepo:

```json
// packages/domain/tsconfig.json
{
  "compilerOptions": {
    "composite": true,       // required for project references
    "declaration": true,     // generates .d.ts files for consumers
    "declarationMap": true   // source maps for d.ts files
  }
}

// packages/application/tsconfig.json
{
  "compilerOptions": {
    "composite": true
  },
  "references": [
    { "path": "../domain" }  // explicit dependency on domain
  ]
}

// Root tsconfig for the monorepo
// tsconfig.json
{
  "references": [
    { "path": "./packages/domain" },
    { "path": "./packages/application" },
    { "path": "./packages/infrastructure" }
  ]
}
```

Building with `tsc --build` compiles the entire monorepo in dependency order. Circular project references are a build error — you cannot accidentally create a cycle between packages.

**ESLint in monorepos:**

Each package can have its own `eslint.config.ts` that extends a shared base config. The dockerized ESLint config in this repo is well-suited for this: mount the config once at the monorepo level, and each package inherits it via the `--config /config/eslint.config.ts` flag.

**Tooling:**

- **Nx**: provides task graph, caching, affected computation, and architectural boundary enforcement (libraries cannot import from applications)
- **TurboRepo**: task pipeline execution with distributed caching; simpler than Nx
- **pnpm workspaces**: lightweight package management without the build system overhead

The key principle for monorepos: **packages must have explicit dependency declarations** (`package.json` `dependencies`) and those declarations must match the import graph. `eslint-plugin-import-x`'s `no-extraneous-dependencies` rule enforces this — if a package imports from another package not listed as a dependency, the rule flags it.


---

# 6. React Functional Patterns

## 6.1 Why Class Components Are Dead

React class components were the original mechanism for stateful React code. Before React 16.8 (hooks, February 2019), any component that needed state, lifecycle methods, or context access had to be a class. The pattern was everywhere and seemed permanent.

Then hooks arrived, and the pattern collapsed within 18 months.

Class components have concrete disadvantages in 2025 that go beyond style preference:

**No hooks support.** Hooks (`useState`, `useEffect`, `useContext`, `useCallback`, `useMemo`, and all custom hooks) cannot be called inside class components. The entire ecosystem of React hooks-based libraries (TanStack Query, Zustand, Recoil, use-debounce, react-hot-toast, and thousands of others) requires functional components. A class component cannot use any of them directly.

**`this` binding complexity.** Class methods require explicit `this` binding or arrow function class properties to avoid incorrect `this` context. The confusion around `this` in JavaScript is a well-documented source of bugs, and class components expose every new React developer to it.

**Verbose lifecycle methods that mix concerns.** A `componentDidMount` might set up a websocket subscription, initialize analytics, and start a polling timer. These are three unrelated concerns merged into one method because they happen to run at the same lifecycle moment. With `useEffect`, each concern gets its own effect with its own cleanup, making the code vastly easier to understand and debug.

**No concurrent mode features.** React's concurrent mode features (Suspense boundaries, transitions, the `use()` hook in React 19) are built for functional components. Class components exist in a compatibility mode that doesn't receive new React features.

**Harder to test.** Testing a class component requires instantiating the class (directly or through React's test utilities), managing lifecycle triggering, and asserting on class state. Testing a functional component is testing a function — simpler setup, cleaner assertions.

The community has spoken. Every major React tutorial, every major React library, every React job posting assumes functional components. Class components are a legacy pattern to be maintained in existing codebases, not a pattern to be chosen in new code. [24][25]

**The one exception:** error boundaries. As of React 18, error boundaries still require class components with `getDerivedStateFromError` and `componentDidCatch`. React 19 is adding function error boundary support, but until it's widely deployed, you need the class for error boundaries. This is the only legitimate new use of class components in modern React.

## 6.2 Component Typing: Drop React.FC, Use Explicit Signatures

`React.FC` (also `React.FunctionComponent`) has been an anti-pattern since approximately 2020, when the React TypeScript cheatsheet deprecated it and the community widely adopted the recommendation to drop it. [24][27]

**The three problems with `React.FC`:**

1. **Implicit children prop.** Until React 18 changed the type definitions, `React.FC<Props>` added `children?: ReactNode` to every component's props regardless of whether the component accepted children. This meant TypeScript would not catch passing children to components that silently ignored them:

```typescript
// With React.FC
const Button: React.FC<{ label: string }> = ({ label }) => (
  <button>{label}</button>
  // No children rendered anywhere
);

// TypeScript wouldn't flag this:
<Button label="Click me">
  <Icon />  // silently ignored, no error
</Button>
```

2. **Hidden return type.** `React.FC` infers the return type. For public/shared components, the return type is part of the contract. Explicit function signatures make it visible.

3. **Awkward generics.** A generic component with `React.FC` requires an extra type parameter: `const Select: React.FC<SelectProps<T>> = ...` — which doesn't work cleanly with generic type inference.

**The correct patterns:**

```typescript
// ✅ Standard component — explicit signature
interface UserCardProps {
  readonly user: User;
  readonly onEdit?: () => void;
  readonly onDelete?: () => void;
}

function UserCard({ user, onEdit, onDelete }: UserCardProps): React.ReactElement {
  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      {onEdit && <button type="button" onClick={onEdit}>Edit</button>}
      {onDelete && <button type="button" onClick={onDelete}>Delete</button>}
    </div>
  );
}

// ✅ Component that can return null
interface BadgeProps {
  readonly count: number;
}

function NotificationBadge({ count }: BadgeProps): React.ReactElement | null {
  if (count === 0) return null;
  return <span className="badge">{count > 99 ? '99+' : count}</span>;
}

// ✅ Generic component — type parameter on function
interface SelectProps<T> {
  readonly items: ReadonlyArray<T>;
  readonly selected: T | null;
  readonly onSelect: (item: T) => void;
  readonly getKey: (item: T) => string;
  readonly renderItem: (item: T) => React.ReactNode;
}

function Select<T>({
  items,
  selected,
  onSelect,
  getKey,
  renderItem,
}: SelectProps<T>): React.ReactElement {
  return (
    <ul role="listbox">
      {items.map(item => (
        <li
          key={getKey(item)}
          role="option"
          aria-selected={item === selected}
          onClick={() => onSelect(item)}
        >
          {renderItem(item)}
        </li>
      ))}
    </ul>
  );
}

// TypeScript infers T from the items prop
<Select<User>
  items={users}
  selected={selectedUser}
  onSelect={setSelectedUser}
  getKey={u => u.id}
  renderItem={u => u.name}
/>
```

**Return type guide:**

| Return type | When to use |
|---|---|
| `React.ReactElement` | Component always renders something, never null |
| `React.ReactElement \| null` | Component may conditionally render nothing |
| `React.ReactNode` | Container component that may render children, strings, numbers, or null |
| `JSX.Element` | Identical to `React.ReactElement`; use `React.ReactElement` for consistency |

**Using `React.PropsWithChildren`:**

For components that always accept children, make it explicit in the props:

```typescript
// ✅ Explicit children
interface LayoutProps {
  readonly title: string;
  readonly children: React.ReactNode;  // explicit, not implicit via React.FC
}

function PageLayout({ title, children }: LayoutProps): React.ReactElement {
  return (
    <main>
      <h1>{title}</h1>
      {children}
    </main>
  );
}
```

Or use `React.PropsWithChildren<T>` as a utility:

```typescript
type LayoutProps = React.PropsWithChildren<{
  readonly title: string;
}>;
```

## 6.3 Props Design: readonly, Discriminated Unions, Generic Components

Well-designed component props are one of the most important contributions to a React codebase's long-term maintainability. Props interfaces that are too broad allow invalid combinations. Props interfaces that are too narrow become inflexible. Props designed thoughtfully with TypeScript's type system encode the component's contract explicitly.

**Principle 1: `readonly` on all props**

Props are immutable data — functional components don't and shouldn't mutate them. Make this explicit:

```typescript
// ✅ All props readonly
interface FormFieldProps {
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly error?: string;
  readonly disabled?: boolean;
  readonly required?: boolean;
}
```

This communicates intent to the reader and, with `functional/prefer-immutable-types`, will be linted.

**Principle 2: Discriminated union props for variant components**

When a component has mutually exclusive modes of operation, model them as discriminated unions rather than optional boolean flags: [23]

```typescript
// ❌ Boolean flags allow invalid combinations
interface AlertProps {
  message: string;
  isInfo?: boolean;
  isWarning?: boolean;
  isError?: boolean;       // Which one wins if multiple are true?
  isSuccess?: boolean;
  icon?: React.ReactNode;  // Some variants may not support icons
}

// ✅ Discriminated union: each variant has exactly its required/available props
type AlertProps =
  | {
      readonly variant: 'info';
      readonly message: string;
    }
  | {
      readonly variant: 'warning';
      readonly message: string;
      readonly dismissible?: boolean;
    }
  | {
      readonly variant: 'error';
      readonly message: string;
      readonly error?: Error;    // Only error variant has an Error object
      readonly onRetry?: () => void;
    }
  | {
      readonly variant: 'success';
      readonly message: string;
      readonly duration?: number; // Auto-dismiss duration for success alerts
    };

function Alert(props: AlertProps): React.ReactElement {
  // TypeScript narrows props based on variant
  return (
    <div className={`alert alert-${props.variant}`}>
      <p>{props.message}</p>
      {props.variant === 'error' && props.onRetry && (
        <button type="button" onClick={props.onRetry}>Try again</button>
      )}
    </div>
  );
}

// Invalid combination is a compile error:
<Alert variant="info" error={someError} />  // ❌ error prop doesn't exist on info variant
```

**Principle 3: Polymorphic components with the `as` prop pattern**

Components that need to render as different HTML elements:

```typescript
type PolymorphicRef<C extends React.ElementType> =
  React.ComponentPropsWithRef<C>['ref'];

type PolymorphicComponentProp<C extends React.ElementType, Props = {}> = {
  readonly as?: C;
} & Props & Omit<React.ComponentPropsWithoutRef<C>, keyof Props | 'as'>;

type ButtonOwnProps = {
  readonly variant?: 'primary' | 'secondary' | 'ghost';
  readonly size?: 'sm' | 'md' | 'lg';
};

type ButtonProps<C extends React.ElementType = 'button'> =
  PolymorphicComponentProp<C, ButtonOwnProps>;

function Button<C extends React.ElementType = 'button'>({
  as,
  variant = 'primary',
  size = 'md',
  children,
  ...rest
}: ButtonProps<C>): React.ReactElement {
  const Component = as ?? 'button';
  return (
    <Component
      className={`btn btn-${variant} btn-${size}`}
      {...rest}
    >
      {children}
    </Component>
  );
}

// Usage
<Button>Click me</Button>                       // renders <button>
<Button as="a" href="/home">Home</Button>        // renders <a href="/home">
<Button as={Link} to="/about">About</Button>     // renders React Router Link
```

## 6.4 Custom Hooks: Single Responsibility, Explicit API

Custom hooks are the primary encapsulation mechanism in functional React. They separate stateful logic from rendering logic, enabling each to be tested and evolved independently. The custom hook pattern is, without exaggeration, the most important React pattern for maintainable code at scale. [30]

**What a well-designed custom hook looks like:**

```typescript
// ✅ A well-designed custom hook: focused, explicitly typed, self-documenting

interface UsePaginatedListOptions<T> {
  readonly fetchPage: (page: number, pageSize: number) => Promise<{
    readonly items: ReadonlyArray<T>;
    readonly totalCount: number;
  }>;
  readonly pageSize?: number;
  readonly initialPage?: number;
}

interface UsePaginatedListResult<T> {
  readonly items: ReadonlyArray<T>;
  readonly totalCount: number;
  readonly currentPage: number;
  readonly pageSize: number;
  readonly totalPages: number;
  readonly isLoading: boolean;
  readonly error: Error | null;
  readonly goToPage: (page: number) => void;
  readonly nextPage: () => void;
  readonly prevPage: () => void;
}

function usePaginatedList<T>({
  fetchPage,
  pageSize = 20,
  initialPage = 1,
}: UsePaginatedListOptions<T>): UsePaginatedListResult<T> {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const { data, isLoading, error } = useQuery({
    queryKey: ['paginated', currentPage, pageSize],
    queryFn: () => fetchPage(currentPage, pageSize),
  });

  const goToPage = useCallback((page: number): void => {
    setCurrentPage(page);
  }, []);

  const totalPages = data ? Math.ceil(data.totalCount / pageSize) : 0;

  return {
    items: data?.items ?? [],
    totalCount: data?.totalCount ?? 0,
    currentPage,
    pageSize,
    totalPages,
    isLoading,
    error: error as Error | null,
    goToPage,
    nextPage: useCallback(() => goToPage(Math.min(currentPage + 1, totalPages)), [goToPage, currentPage, totalPages]),
    prevPage: useCallback(() => goToPage(Math.max(currentPage - 1, 1)), [goToPage, currentPage]),
  };
}
```

Note the design choices:
- **Explicit return type** (`UsePaginatedListResult<T>`) — the API is visible and stable
- **Generic** (`<T>`) — works for any data type
- **Single responsibility** — manages one concern (paginated list state)
- **Server state via useQuery** — not duplicated into useState
- **Memoized callbacks** — stable references for `useEffect` dependencies
- **Readonly arrays** — immutable by default

**Anti-patterns in custom hooks:**

```typescript
// ❌ Too broad: "god hook" that manages too much
const usePageState = () => {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState([]);
  // ... 50 more lines
};

// ✅ Split by responsibility
const useUsers = () => { /* ... */ };
const useOrders = () => { /* ... */ };
const useCurrentUser = () => { /* ... */ };
const useTheme = () => { /* ... */ };
const useNotifications = () => { /* ... */ };
```

```typescript
// ❌ Duplicating server state in local state
const useUserData = (userId: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchUser(userId).then(setUser).finally(() => setLoading(false));
  }, [userId]);

  return { user, loading };
};

// ✅ Let TanStack Query own server state
const useUserData = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });
};
```

## 6.5 Server State vs. Local State: The Critical Distinction

One of the most impactful architectural decisions in a React application is deciding where state lives. The wrong answer leads to stale data, race conditions, cache invalidation bugs, and brittle loading state logic.

**The two categories of state:**

**Server state** is data that originates on a server, must be fetched asynchronously, can change without the client knowing, and may be shared between multiple components or even multiple clients. Examples: user profiles, product catalogs, order histories, search results. Server state has complex characteristics: caching, background synchronization, optimistic updates, cache invalidation.

**Local (client) state** is UI state that lives only in the browser and doesn't need persistence or synchronization. Examples: modal open/close, active tab, form field values, hover state, scroll position. Local state is simple: `useState` or `useReducer` handle it perfectly.

The bug: treating server state as local state.

```typescript
// ❌ Treating server state as local state
function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchUser(userId)
      .then(data => { if (!cancelled) setUser(data); })
      .catch(e => { if (!cancelled) setError(e); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [userId]);

  // This implementation:
  // - Has no caching (refetches on every mount)
  // - Is prone to race conditions
  // - Has no background refresh
  // - Duplicates the same logic in every component
  // - Has ~15 lines of boilerplate for a simple fetch
}

// ✅ Server state via TanStack Query
function UserProfile({ userId }: { userId: string }) {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // This implementation:
  // - Caches results by queryKey
  // - Deduplicates concurrent requests
  // - Refetches when window regains focus
  // - Handles race conditions automatically
  // - Is reusable across components
  // - Has ~6 lines total
}
```

**When to use different state solutions:**

| State type | Solution | Why |
|---|---|---|
| Server state (read) | TanStack Query, SWR | Caching, background sync, deduplication |
| Server state (mutations) | TanStack Query mutations | Optimistic updates, error rollback, cache invalidation |
| Global UI state | Zustand, Jotai | Light, no boilerplate, no Provider needed |
| Form state | React Hook Form | Validation, field state, submission handling |
| Simple local state | useState | Direct, no overhead for simple cases |
| Complex local state | useReducer | When state transitions are complex enough to benefit from explicit actions |
| URL state | react-router / next/router | For state that should be shareable and bookmarkable |

## 6.6 Composition Patterns

The React composition model — components as functions that accept props and return JSX — is extraordinarily flexible. The patterns that emerge from it scale from trivial to complex.

**Children composition — the simplest pattern:**

The `children` prop lets parent components control layout while child components control content. This is the most natural React composition and should be the first choice:

```typescript
interface CardProps {
  readonly title: string;
  readonly children: React.ReactNode;
  readonly footer?: React.ReactNode;
}

function Card({ title, children, footer }: CardProps): React.ReactElement {
  return (
    <article className="card">
      <header className="card-header"><h3>{title}</h3></header>
      <div className="card-body">{children}</div>
      {footer && <footer className="card-footer">{footer}</footer>}
    </article>
  );
}

// Usage: Card controls layout; caller controls content
<Card title="Order Summary" footer={<OrderActions />}>
  <OrderItemList items={order.items} />
  <OrderTotals total={order.total} />
</Card>
```

**Slot pattern — named content areas:**

More explicit than children for components with multiple content areas:

```typescript
interface ModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly header: React.ReactNode;
  readonly body: React.ReactNode;
  readonly footer?: React.ReactNode;
}

function Modal({ isOpen, onClose, header, body, footer }: ModalProps): React.ReactElement | null {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">{header}</div>
        <div className="modal-body">{body}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
```

**Render props — for cross-cutting logic injection:**

```typescript
interface DataLoaderProps<T> {
  readonly fetchData: () => Promise<T>;
  readonly children: (state: AsyncState<T>) => React.ReactNode;
}

function DataLoader<T>({ fetchData, children }: DataLoaderProps<T>): React.ReactElement {
  const { data, isLoading, error } = useQuery({ queryFn: fetchData, queryKey: ['data'] });
  
  const state: AsyncState<T> = isLoading
    ? { status: 'loading' }
    : error
    ? { status: 'error', error: error as Error }
    : data !== undefined
    ? { status: 'success', data }
    : { status: 'idle' };

  return <>{children(state)}</>;
}

// Usage: loading state logic is extracted; rendering is still controlled by caller
<DataLoader fetchData={fetchUsers}>
  {state => state.status === 'success'
    ? <UserList users={state.data} />
    : state.status === 'loading'
    ? <Spinner />
    : <ErrorMessage error={state.error} />
  }
</DataLoader>
```

**Compound components — for complex widgets with shared state:**

The compound component pattern creates a group of components that share implicit state via context. It's the right pattern for complex widgets like accordions, tabs, select dropdowns, and similar UI components: [28]

```typescript
// Tabs compound component
interface TabsContextValue {
  readonly activeTab: string;
  readonly setActiveTab: (tab: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

const useTabsContext = (): TabsContextValue => {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error('Must be used within <Tabs>');
  return ctx;
};

interface TabsProps {
  readonly defaultTab: string;
  readonly children: React.ReactNode;
}

function Tabs({ defaultTab, children }: TabsProps): React.ReactElement {
  const [activeTab, setActiveTab] = useState(defaultTab);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

interface TabListProps { readonly children: React.ReactNode; }
function TabList({ children }: TabListProps): React.ReactElement {
  return <div className="tab-list" role="tablist">{children}</div>;
}

interface TabProps { readonly id: string; readonly label: string; }
function Tab({ id, label }: TabProps): React.ReactElement {
  const { activeTab, setActiveTab } = useTabsContext();
  return (
    <button
      role="tab"
      type="button"
      aria-selected={activeTab === id}
      onClick={() => setActiveTab(id)}
    >
      {label}
    </button>
  );
}

interface TabPanelProps { readonly id: string; readonly children: React.ReactNode; }
function TabPanel({ id, children }: TabPanelProps): React.ReactElement | null {
  const { activeTab } = useTabsContext();
  return activeTab === id ? <div role="tabpanel">{children}</div> : null;
}

// Attach sub-components to the namespace
Tabs.List = TabList;
Tabs.Tab = Tab;
Tabs.Panel = TabPanel;

// Usage: intuitive, co-located, TypeScript-typed
<Tabs defaultTab="overview">
  <Tabs.List>
    <Tabs.Tab id="overview" label="Overview" />
    <Tabs.Tab id="details" label="Details" />
    <Tabs.Tab id="reviews" label="Reviews" />
  </Tabs.List>
  <Tabs.Panel id="overview"><OverviewContent /></Tabs.Panel>
  <Tabs.Panel id="details"><DetailsContent /></Tabs.Panel>
  <Tabs.Panel id="reviews"><ReviewsContent /></Tabs.Panel>
</Tabs>
```

## 6.7 Context API: Appropriate Scope and Performance

React Context is frequently overused. It solves a specific problem — prop drilling of global, infrequently-changing data — and is poorly suited for everything else.

**Context is appropriate for:**
- Theme (light/dark, design tokens)
- Locale/i18n (language, date formats)
- Authenticated user (read-only, changes infrequently)
- Feature flags (read-only, loaded once)
- Toast notification service (write-heavy but low frequency)

**Context is NOT appropriate for:**
- Form state (use React Hook Form)
- Server state (use TanStack Query)
- High-frequency UI state (use Zustand or Jotai atoms)
- Component-local state (use useState/useReducer)

**The performance problem with Context:**

Every component that calls `useContext(MyContext)` re-renders when the context value changes. If you put frequently-changing state in Context, every consumer re-renders on every change:

```typescript
// ❌ Performance trap: changes on every keystroke, causing re-renders everywhere
const SearchContext = React.createContext<{ query: string; setQuery: (q: string) => void } | null>(null);

// ✅ Better: use Zustand for high-frequency state
const useSearchStore = create<{ query: string; setQuery: (q: string) => void }>(set => ({
  query: '',
  setQuery: (query) => set({ query }),
}));
```

**Context splitting for performance:**

When Context has both read and write operations, split them into separate contexts so read-only consumers don't re-render on writes:

```typescript
// Split context to minimize re-renders
const UserContext = React.createContext<User | null>(null);
const UserDispatchContext = React.createContext<React.Dispatch<UserAction> | null>(null);

// Components that only display user data use UserContext
const UserAvatar = () => {
  const user = React.useContext(UserContext);
  return user ? <img src={user.avatarUrl} alt={user.name} /> : null;
};
// This component ONLY re-renders when user changes, not when dispatch changes

// Components that only trigger updates use UserDispatchContext
const LogoutButton = () => {
  const dispatch = React.useContext(UserDispatchContext);
  return <button type="button" onClick={() => dispatch?.({ type: 'logout' })}>Logout</button>;
};
```

## 6.8 Effect Discipline: Dependency Arrays and Extraction

`useEffect` is the most commonly misused hook in the React ecosystem. A significant portion of production React bugs — stale closures, infinite loops, memory leaks, incorrect cleanup — originate in incorrectly written effects. [24][29]

**The golden rules:**

**Rule 1: Never lie in the dependency array.**
`eslint-plugin-react-hooks`'s `exhaustive-deps` rule is the automated enforcement. If the rule says a dependency is missing, add it. If adding it causes an infinite loop, the component has a design problem — not the rule.

**Rule 2: Don't fetch data in useEffect.**
The fetch-in-effect pattern requires 15+ lines of boilerplate per fetch, has no caching, is prone to race conditions, and duplicates identical logic in every component. Use TanStack Query, SWR, or React 19's `use()` hook for data fetching.

**Rule 3: Extract effect logic into named functions.**
An effect body should fit in 5–10 lines. If it doesn't, extract the logic into named functions that describe what they do:

```typescript
// ❌ Monolithic effect
useEffect(() => {
  const subscription = eventBus.subscribe('user-updated', (event) => {
    if (event.userId === currentUserId) {
      setUser(event.newData);
      if (event.newData.role !== user?.role) {
        setPermissions(getPermissionsForRole(event.newData.role));
        showToast(`Your role changed to ${event.newData.role}`);
      }
    }
  });
  return () => subscription.unsubscribe();
}, [currentUserId, user?.role]);

// ✅ Extracted, named logic
const handleUserUpdated = useCallback((event: UserUpdatedEvent): void => {
  if (event.userId !== currentUserId) return;
  updateUser(event.newData);
  if (event.newData.role !== user?.role) {
    updatePermissions(event.newData.role);
    notifyRoleChange(event.newData.role);
  }
}, [currentUserId, user?.role, updateUser, updatePermissions, notifyRoleChange]);

useEffect(() => {
  const subscription = eventBus.subscribe('user-updated', handleUserUpdated);
  return () => subscription.unsubscribe();
}, [handleUserUpdated]);
```

**Rule 4: Always clean up.**
Effects that set up subscriptions, timers, or event listeners must return a cleanup function:

```typescript
// ✅ Proper cleanup
useEffect(() => {
  const timer = setInterval(() => {
    setCurrentTime(new Date());
  }, 1000);

  return () => clearInterval(timer);  // cleanup: stop the timer
}, []);

useEffect(() => {
  const handleResize = () => setWindowWidth(window.innerWidth);
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize); // cleanup
}, []);
```

**The `useCallback` / `useMemo` discipline:**

Use them only for measured performance problems, not preemptively. [29]

`useCallback` stabilizes a function reference to prevent unnecessary re-renders or effect re-runs:

```typescript
// When to use useCallback:
// 1. The callback is a dependency of useEffect or another useCallback
// 2. The callback is passed to a child wrapped in React.memo

// ✅ Justified: callback is a useEffect dependency
const fetchData = useCallback(async () => {
  const data = await loadUserData(userId);
  setUser(data);
}, [userId]); // refreshes when userId changes

useEffect(() => {
  void fetchData();
}, [fetchData]); // fetchData in deps is stable when userId is stable

// ❌ Unjustified: no dependency, no memo'd child
const handleClick = useCallback(() => {
  console.log('clicked');
}, []); // allocates a new function on every render to avoid allocating a new function... pointless
```

## 6.9 Concurrent React: Suspense, use(), Server Components

React 18 and 19 introduced concurrent features that change how components interact with asynchronous data. Understanding them informs both component design and eslint rule calibration.

**Suspense boundaries:**

Suspense lets components declare that they are "waiting" for some asynchronous resource. When a component inside a `<Suspense>` boundary suspends (throws a Promise), React shows the fallback UI instead of the suspended component:

```typescript
// ✅ Data fetching with Suspense (React 19 use() hook)
function UserProfile({ userId }: { userId: string }): React.ReactElement {
  const user = use(fetchUser(userId)); // throws a Promise until resolved
  // After resolution, user is the User object — no loading state needed
  return <div>{user.name}</div>;
}

// Wrapping in Suspense boundary
<Suspense fallback={<ProfileSkeleton />}>
  <UserProfile userId={currentUserId} />
</Suspense>
```

**Server Components (Next.js App Router):**

React Server Components render on the server and are never hydrated on the client. They can be async functions, access databases directly, and keep large dependencies server-side:

```typescript
// ✅ Server Component: async, accesses database directly, never sends JS to client
async function UserList(): Promise<React.ReactElement> {
  const users = await prisma.user.findMany({ where: { isActive: true } });
  return (
    <ul>
      {users.map(user => <li key={user.id}>{user.name}</li>)}
    </ul>
  );
}

// 'use client' is needed only for components that need:
// - React state (useState, useReducer)
// - Effects (useEffect)
// - Browser APIs (window, document)
// - Event listeners (onClick with state, not just href)
'use client';
function SearchBar(): React.ReactElement {
  const [query, setQuery] = useState('');
  return <input value={query} onChange={e => setQuery(e.target.value)} />;
}
```

The principle: default to Server Components. Add `'use client'` only when the component genuinely needs client-side interactivity. This produces smaller bundles and faster initial page loads.

## 6.10 Accessibility: jsx-a11y Integration

Accessibility is not a feature to add later — it is a quality dimension of every UI component. `eslint-plugin-jsx-a11y` enforces a subset of WCAG 2.1 Level AA guidelines at the linting level, catching accessibility regressions before they reach users.

**The most impactful jsx-a11y rules:**

`jsx-a11y/alt-text` — all `<img>` elements need descriptive `alt` text, or `alt=""` for decorative images:

```typescript
// ❌ Missing alt text
<img src={user.avatarUrl} />

// ✅ Descriptive alt text
<img src={user.avatarUrl} alt={`${user.name}'s avatar`} />

// ✅ Decorative image
<img src={decorativeDivider} alt="" role="presentation" />
```

`jsx-a11y/button-has-type` — buttons need explicit `type` attributes to prevent accidental form submission:

```typescript
// ❌ Default type is 'submit' — might unexpectedly submit forms
<button onClick={handleAction}>Click me</button>

// ✅ Explicit type
<button type="button" onClick={handleAction}>Click me</button>
```

`jsx-a11y/click-events-have-key-events` — interactive elements need keyboard support:

```typescript
// ❌ Mouse-only interaction
<div onClick={handleSelect} className="selectable">{item.name}</div>

// ✅ Keyboard and mouse support
<button
  type="button"
  onClick={handleSelect}
  className="selectable"
>
  {item.name}
</button>
// OR: use the native button element which handles keyboard natively
```

`jsx-a11y/anchor-has-content` — links must have accessible text:

```typescript
// ❌ Empty link
<a href="/home"><Icon /></a>

// ✅ With accessible label
<a href="/home" aria-label="Go to home page"><Icon aria-hidden="true" /></a>
```

`jsx-a11y/no-autofocus` — `autoFocus` is disorienting for screen reader users who can't predict where focus will jump:

```typescript
// ❌ Forces screen reader to jump unexpectedly
<input autoFocus placeholder="Search" />

// ✅ Let users navigate naturally; manage focus programmatically if needed
const inputRef = useRef<HTMLInputElement>(null);
useEffect(() => {
  // Only auto-focus when explicitly needed (e.g., modal opens)
  inputRef.current?.focus();
}, [isModalOpen]);
```

All `jsxA11y.configs.recommended.rules` should be `error`, not `warn`. Accessibility issues that reach production affect real users with disabilities. The linting check is the last automated gate before deployment.


---

# 7. ESLint Ecosystem & Rule Design

## 7.1 The Flat Config Revolution

ESLint 9 (released April 5, 2024) made flat config the default and deprecated the legacy `.eslintrc.*` system. This is not a minor version bump — it is a fundamental change to how ESLint configuration is written and composed. Understanding the difference is prerequisite to maintaining or extending any modern ESLint setup. [31][32]

**What changed from `.eslintrc` to flat config:**

In `.eslintrc` (the legacy system):
- Configuration cascaded through the file system — parent `.eslintrc` files merged with child ones
- `extends` was a magic array of strings resolved from `node_modules`
- `plugins` were string names resolved from `node_modules`
- `overrides` handled file-specific configuration
- Configuration parsing rules were complex and non-obvious

In `eslint.config.ts` (flat config):
- Configuration is an array of config objects exported from a single file
- No cascading — the file you specify is the complete configuration
- `plugins` are imported objects (no string magic, full type safety)
- File targeting uses `files` arrays (explicit globs) instead of `overrides`
- `extends` in the legacy sense no longer exists — you compose by spreading config arrays

**The `tseslint.config()` helper:**

The `typescript-eslint` package provides `tseslint.config()` which wraps ESLint's flat config array with TypeScript typing. It provides:
- Type inference for rule options
- TypeScript-typed plugin registrations
- Nested config merging that respects TypeScript's type system

```typescript
import tseslint from 'typescript-eslint';

// tseslint.config() provides full TypeScript types for config objects
export default tseslint.config({
  files: ['**/*.ts'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error', // ← typed: knows valid options
  },
});
```

**The `defineConfig()` utility from `eslint/config` (March 2025):** [32]

ESLint 9.23+ added `defineConfig()` which restores an `extends` mechanic to flat config and provides better TypeScript typing:

```typescript
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig([
  tseslint.configs.strictTypeChecked,
  {
    files: ['**/*.ts'],
    extends: [
      // Compose additional configs with extends
    ],
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
    },
  },
]);
```

`defineConfig()` also flattens nested arrays automatically, eliminating the `...spread` notation required in raw flat config.

**Performance characteristics of type-aware linting:**

`strictTypeChecked` and all other `*TypeChecked` configs require the TypeScript type checker to run during linting. This is significantly slower than non-type-aware linting. For a codebase with 500 TypeScript files, non-type-aware linting might run in 5 seconds; type-aware linting might run in 25–40 seconds.

Mitigations:
- Use `parserOptions.projectService: true` (the modern API, faster than `project: './tsconfig.json'`)
- Enable incremental TypeScript builds: `tsc --build --incremental` before linting
- Run type-aware linting in CI; run non-type-aware linting on pre-commit hooks (faster feedback)
- Cache lint results with ESLint's built-in `--cache` flag

```bash
# Development: fast, non-type-aware
eslint --no-type-check src/

# CI: thorough, type-aware
eslint src/
```

## 7.2 Current Repo Configuration Analysis

The `eslint-dockerized` repo's current `eslint.config.ts` is worth examining in detail. Understanding the intent and the gaps prepares us for the proposed improvements.

**Existing configuration, annotated:**

```typescript
import eslint from '@eslint/js';
import functional from "eslint-plugin-functional";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import pluginPromise from "eslint-plugin-promise";

export default tseslint.config({
  files: ["**/*.ts", "**/*.tsx"],
  extends: [
    eslint.configs.all,                        // ALL core ESLint rules — very aggressive
    tseslint.configs.strictTypeChecked,        // Excellent: strictest TS rules
    functional.configs.recommended,             // Good: FP discipline
    functional.configs.stylistic,              // Good: FP style rules
    pluginPromise.configs['flat/recommended'], // Good: Promise safety
  ],
  plugins: {
    react,                                     // Registered but rules spread below
    'react-hooks': reactHooks,
    'jsx-a11y': jsxA11y,
  },
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      projectService: true,                    // Good: uses TypeScript service
      ecmaFeatures: { jsx: true },
    },
  },
  settings: {
    react: { version: 'detect' },
  },
  rules: {
    "functional/no-classes": "off",            // Correct: classes needed for React/NestJS
    "functional/no-expression-statements": "off", // Correct: JSX requires this
    "functional/functional-parameters": "off", // Correct: zero-arg functions are fine
    ...react.configs.recommended.rules,        // Good: React recommended
    ...reactHooks.configs.recommended.rules,   // Good: hooks rules
    ...jsxA11y.configs.recommended.rules,      // Good: accessibility
  },
});
```

**Assessment of `eslint.configs.all`:**

This is the most controversial choice in the existing config. `eslint.configs.all` enables every single core ESLint rule — including many that:

1. **Conflict with TypeScript usage.** Rules like `no-unused-vars` are superseded by `@typescript-eslint/no-unused-vars`. When both are active, you get duplicate errors with potentially different options. Similarly, `no-shadow`, `no-use-before-define`, `require-await`, `no-redeclare`, and `no-undef` all have better TypeScript-aware counterparts.

2. **Conflict with modern JavaScript patterns.** `init-declarations` (require all variables to be initialized) conflicts with the common pattern of declaring a variable at the top of a block and conditionally initializing it. `max-classes-per-file` conflicts with defining multiple small classes in one file when they're tightly related. `no-ternary` forbids the ternary operator, which is idiomatic TypeScript.

3. **Conflict with TypeScript-specific code.** `no-magic-numbers` has false positives for TypeScript's literal types and array indices. `prefer-destructuring` sometimes produces less readable code in TypeScript when combined with type annotations.

4. **Have extremely aggressive defaults.** `max-statements`, `max-lines`, `max-lines-per-function`, `complexity` all have very low defaults in `eslint.configs.all` that most real-world code will violate extensively.

**The recommended approach:** Use `eslint.configs.recommended` as the core ESLint base (a curated set of rules that catch real bugs), and rely on `tseslint.configs.strictTypeChecked` for the TypeScript-specific rules. This composition gives you all the bug-catching power without the noise from rules that don't apply to TypeScript code.

**What the existing config does well:**

- `tseslint.configs.strictTypeChecked` is excellent — the highest-value TypeScript linting configuration
- `functional.configs.recommended` + `stylistic` is the right choice for pragmatic FP
- The three `functional` overrides are correct for React
- `pluginPromise` provides solid async safety
- React/react-hooks/jsx-a11y are all registered and configured correctly
- `projectService: true` is the modern, performant TypeScript service setup

**What's missing:**

1. `eslint-plugin-unicorn` — code modernization and quality (100+ rules)
2. `eslint-plugin-sonarjs` — cognitive complexity and code smell detection
3. `eslint-plugin-import-x` — circular dependency detection, import ordering, type import enforcement
4. Several high-value `@typescript-eslint` rules not enabled by `strictTypeChecked` alone
5. No `ignores` block — generated files and build output are linted, producing false positives and slowing CI
6. No split between TS-only and TSX files — React rules apply to all files instead of only JSX files

## 7.3 Rule Severity Philosophy

Rule severity is not arbitrary. Every rule should be at the severity level that matches its purpose and the codebase's maturity. The framework:

**`"error"` — fail builds, block PRs. Use when:**
- The rule prevents a bug that will reach production if not caught
- The rule enforces a security constraint
- The rule enforces an architectural invariant the codebase depends on
- The violation category has a documented history of causing production incidents

```typescript
'@typescript-eslint/no-floating-promises': 'error',  // Unhandled Promises → silent failures
'import-x/no-cycle': 'error',                        // Circular deps → initialization bugs
'react-hooks/exhaustive-deps': 'error',              // Wrong deps → stale closure bugs
'jsx-a11y/alt-text': 'error',                        // Missing alt → broken for screen readers
```

**`"warn"` — visible, not blocking. Use when:**
- The rule enforces a preferred style where exceptions are occasionally legitimate
- The team is migrating toward the rule (move to `error` after violations reach zero)
- The rule is aspirational for code you don't control (library types that aren't `readonly`)
- You're evaluating a new rule before committing to it

```typescript
'functional/prefer-immutable-types': 'warn',   // Aspirational; library types aren't always readonly
'unicorn/prevent-abbreviations': 'warn',        // Style preference; gradual adoption
'react/no-array-index-key': 'warn',            // Bad practice, but exceptions exist
```

**`"off"` — disabled. Always document why:**

```typescript
'no-unused-vars': 'off',               // off: replaced by @typescript-eslint/no-unused-vars
'functional/no-classes': 'off',        // off: classes needed for React error boundaries, NestJS
'unicorn/no-null': 'off',              // off: React components return null; React.FC pattern
'unicorn/no-array-reduce': 'off',      // off: FP teams use reduce deliberately
```

The comment on each `off` rule is not optional etiquette — it is essential documentation. Without the comment, the next engineer who reviews the config doesn't know whether the rule was intentionally disabled or accidentally omitted. The `unicorn/no-abusive-eslint-disable` rule enforces that `eslint-disable` comments in source files are documented; the same discipline applies to config-level `off` settings.

## 7.4 typescript-eslint strictTypeChecked: Key Rules Explained

`tseslint.configs.strictTypeChecked` is the highest-value ESLint configuration available for TypeScript codebases. It requires the TypeScript type checker to run during linting, which enables rules that understand the semantics of your code — not just its syntax. [34][35]

**Understanding the rule families:**

The rules in `strictTypeChecked` fall into three categories:

1. **Promise safety** — prevent the most common async bug: Promise not awaited or handled
2. **`any` contamination prevention** — catch `any` values propagating through typed code
3. **Type-aware correctness** — catch logical errors the compiler alone would miss

**`@typescript-eslint/no-floating-promises` — the single highest-value rule:**

This rule flags any Promise that is created but not awaited or `.catch()`-ed. An unhandled Promise is a silent failure: the operation appears to succeed, but any error or async result is simply discarded.

```typescript
// ❌ All flagged by no-floating-promises:

// 1. Missing await in async function
async function processPayment(payment: Payment): Promise<void> {
  paymentService.charge(payment.amount); // Promise dropped — charge might fail silently
  sendConfirmationEmail(payment.userId); // Promise dropped — email might fail silently
}

// 2. Floating Promise in a Promise chain
fetchUser(id).then(user => {
  sendWelcomeEmail(user.email); // Promise returned from .then callback, but not awaited
});

// 3. Void operator misuse (not catching the pattern)
const result = processItems(items);  // result is Promise<void>, but stored without await

// ✅ Correct patterns:
async function processPayment(payment: Payment): Promise<void> {
  await paymentService.charge(payment.amount);
  await sendConfirmationEmail(payment.userId);
}

// When you intentionally don't need to await:
void processItems(items);  // void operator explicitly signals "fire and forget"
```

**`@typescript-eslint/no-misused-promises` — prevents Promises in synchronous positions:**

```typescript
// ❌ onClick expects synchronous void; async function returns Promise
<button onClick={async () => {
  await submitForm();  // Promise returned from onClick handler — may cause issues
}}>
  Submit
</button>

// ✅ Wrap to explicitly discard the Promise
<button onClick={() => { void submitForm(); }}>
  Submit
</button>
// OR
const handleSubmit = (): void => { void submitForm(); };
<button onClick={handleSubmit}>Submit</button>

// ❌ if condition gets a Promise (always truthy)
if (validateAsync(data)) {  // validateAsync returns Promise<boolean> — Promise is truthy
  proceed();
}

// ✅ Await the async validation
const isValid = await validateAsync(data);
if (isValid) { proceed(); }
```

**`@typescript-eslint/await-thenable` — prevents awaiting non-Promises:**

```typescript
// ❌ Awaiting a non-Promise value (useless await)
const result = await 42;          // 42 is not a Promise
const value = await synchronousFunction(); // returns string, not Promise<string>

// ✅ Only await actual Promises
const result = 42;
const value = synchronousFunction();
const asyncResult = await asynchronousFunction();
```

**The `no-unsafe-*` family — preventing `any` contamination:**

These rules work together to prevent `any` values from silently propagating through typed code:

```typescript
// @typescript-eslint/no-unsafe-assignment
const data: any = getExternalData();
const name = data.user.name;   // name: any — unsafe assignment

// @typescript-eslint/no-unsafe-member-access
const data: any = {};
const name = data.user.name;   // accessing members of any — unsafe

// @typescript-eslint/no-unsafe-call
const fn: any = getFunction();
fn();                          // calling any as a function — unsafe

// @typescript-eslint/no-unsafe-return
function processData(): User {
  const data: any = getRawData();
  return data;                 // returning any as typed User — unsafe
}

// @typescript-eslint/no-unsafe-argument
function greetUser(user: User): void { /* ... */ }
const rawData: any = {};
greetUser(rawData);            // passing any to typed parameter — unsafe
```

Together, these five rules create a "firewall" around typed code: `any` values cannot enter, exit, or propagate through typed functions without triggering a lint error. This is the mechanical enforcement of the "no `any`" principle.

**`@typescript-eslint/switch-exhaustiveness-check` — discriminated union completeness:**

```typescript
type Status = 'active' | 'inactive' | 'suspended' | 'deleted';

function getStatusColor(status: Status): string {
  switch (status) {
    case 'active':   return 'green';
    case 'inactive': return 'gray';
    case 'suspended': return 'yellow';
    // 'deleted' not handled
    // ❌ ESLint: Switch is not exhaustive. Cases not matched: 'deleted'
  }
}

// After adding the missing case, adding a new Status value to the union
// will immediately flag every unhandled switch statement
```

**`@typescript-eslint/restrict-template-expressions` — prevent accidental stringification:**

```typescript
// ❌ Accidental object stringification
const user = { name: 'Alice', email: 'alice@example.com' };
console.log(`User: ${user}`); // "User: [object Object]" — almost certainly a bug

// ❌ undefined in template literal
const name = user?.name;
console.log(`Hello, ${name}`); // "Hello, undefined" — unlikely intended

// ✅ Explicit stringification
console.log(`User: ${user.name} (${user.email})`);
console.log(`Hello, ${name ?? 'Guest'}`);
```

**Additional rules to add beyond `strictTypeChecked`:**

`@typescript-eslint/consistent-type-imports` with `prefer-inline` enforces that type-only imports use the `type` keyword:

```typescript
// ❌ Value import for type-only usage
import { User } from './types';           // bundles the User module unnecessarily
function greet(user: User): string { /* */ }

// ✅ Type import — no runtime dependency
import { type User } from './types';      // erased at compile time
// OR inline (prefer-inline: true):
import { User } from './types';
function greet(user: import('./types').User): string { /* */ }

// With consistent-type-imports: ['error', { prefer: 'type-imports', fixStyle: 'inline-type-imports' }]
import { type User, type Order, UserService } from './module';
// type imports erased at runtime; UserService (value) remains
```

This rule is critical when `verbatimModuleSyntax: true` is in `tsconfig.json`. With that compiler option, every import that's used only as a type must be marked as `import type`. Violation is a compile error.

`@typescript-eslint/no-unnecessary-condition` catches conditions that are always `true` or always `false` based on the type:

```typescript
// ❌ Always true: TypeScript knows user is User, not null
function processUser(user: User): void {
  if (user !== null) {  // always true — user is User, not null
    doWork(user);
  }
}

// ❌ Always false: TypeScript knows count is number
function displayCount(count: number): string {
  if (typeof count === 'string') {  // always false — count is number
    return count.toUpperCase();
  }
  return String(count);
}
```

These conditions are either dead code or indicate a misunderstanding of the type. Either way, they should be removed or fixed.

`@typescript-eslint/prefer-nullish-coalescing` replaces `||` with `??` for null-coalescing:

```typescript
// ❌ || treats 0, '', false as falsy — incorrect for numeric/boolean defaults
const port = config.port || 3000;   // 0 as port becomes 3000 — bug!
const title = props.title || '';     // '' as title becomes '' — ok but confusing
const flag = props.enabled || false; // false as flag becomes false — unclear intent

// ✅ ?? only coalesces null and undefined
const port = config.port ?? 3000;   // 0 stays 0; null/undefined becomes 3000
const title = props.title ?? '';     // only null/undefined becomes ''
const flag = props.enabled ?? false; // only null/undefined becomes false
```

The `||` pattern is a well-known JavaScript footgun. `??` is the semantically correct null-coalescing operator for the vast majority of cases where `||` is used.

`@typescript-eslint/prefer-optional-chain` replaces manual null-check chains with optional chaining:

```typescript
// ❌ Verbose manual null-checking
const avatarUrl = user && user.profile && user.profile.avatar && user.profile.avatar.url;

// ✅ Optional chaining
const avatarUrl = user?.profile?.avatar?.url;
```

## 7.5 eslint-plugin-functional: Tuning for Pragmatic FP

The full rule analysis for `eslint-plugin-functional` is in Section 3.10. Here we focus on the ESLint configuration mechanics and the specific preset interactions. [10][11]

**Understanding the preset hierarchy:**

`functional.configs.recommended` enables:
- All `noMutations` rules as `error`
- Most `noOtherParadigms` rules as `error`  
- Most `noStatements` rules as `error`
- Most `noExceptions` rules as `error`
- The `stylistic` rules as `warn`

`functional.configs.stylistic` adds:
- `functional/prefer-property-signatures: 'warn'`
- `functional/prefer-tacit: 'warn'`

**The interaction with `eslint.configs.all`:**

When using `eslint.configs.all`, several rules conflict with `eslint-plugin-functional`:

- `eslint.configs.all` enables `no-param-reassign`, which `eslint-plugin-functional` also enforces (as part of the immutability rules). Redundant but harmless.
- `eslint.configs.all` enables `prefer-destructuring`, which can conflict with functional patterns that prefer explicit property access.
- `eslint.configs.all` enables `no-restricted-syntax` without configuration, which blocks `for-of` and other patterns.

**The configuration mechanics for the proposed config:**

When switching from `eslint.configs.all` to `eslint.configs.recommended`, several rules that `all` was providing must be explicitly added or confirmed to be covered by `tseslint.configs.strictTypeChecked`:

| Rule needed | Source when using `recommended` |
|---|---|
| `no-unused-vars` | `@typescript-eslint/no-unused-vars` (in `strictTypeChecked`) |
| `no-shadow` | `@typescript-eslint/no-shadow` (must add explicitly) |
| `no-use-before-define` | `@typescript-eslint/no-use-before-define` (must add explicitly) |
| `no-undef` | TypeScript compiler handles this; rule can be `off` |
| `no-redeclare` | TypeScript compiler handles this; rule can be `off` |
| `prefer-const` | `eslint.configs.recommended` includes this |

## 7.6 eslint-plugin-unicorn: The Must-Have Rules and the Overrides

`eslint-plugin-unicorn` by Sindre Sorhus is a collection of over 100 opinionated rules. The plugin's `recommended` preset is very aggressive — applying it wholesale to most TypeScript codebases will produce hundreds of violations, many of which are legitimate style choices. The right strategy is to enable `unicorn/recommended` and deliberately disable rules that don't fit. [37]

**The value proposition of unicorn:**

unicorn rules modernize JavaScript/TypeScript code by enforcing patterns that reflect current best practices:
- Node.js protocol imports (`node:fs` over `fs`)
- Modern array methods (`for-of` over indexed `for` loops, `.includes()` over `.indexOf()`)
- Better error handling patterns (`Error` must have a message)
- Consistent naming (prevent abbreviations, enforce filename casing)
- Avoiding legacy patterns (`typeof x === 'undefined'` → `x === undefined`)

**High-value unicorn rules — detailed explanations:**

`unicorn/prefer-node-protocol` — All built-in Node.js module imports should use the `node:` prefix:

```typescript
// ❌ Old style
import fs from 'fs';
import path from 'path';
import { createServer } from 'http';

// ✅ New style with node: prefix
import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'node:http';
```

The `node:` prefix makes it unambiguous that you're importing a Node.js built-in module, not an npm package with the same name.

`unicorn/no-for-loop` — Replace indexed `for` loops with `for-of`:

```typescript
// ❌ Indexed for loop
for (let i = 0; i < users.length; i++) {
  processUser(users[i]);
}

// ✅ for-of (or declarative map/forEach for transformations)
for (const user of users) {
  processUser(user);
}
```

Indexed `for` loops have three common pitfalls: off-by-one errors, incorrect index arithmetic, and modifying the array during iteration. `for-of` eliminates all three.

`unicorn/filename-case` — Enforce consistent file naming:

```typescript
// With configuration: camelCase for non-component files, PascalCase for components
'unicorn/filename-case': ['error', {
  cases: {
    camelCase: true,   // for hooks, utilities, services: useCart.ts, cartService.ts
    pascalCase: true,  // for components: CartList.tsx, UserProfile.tsx
    kebabCase: true,   // for config files: eslint.config.ts
  },
  ignore: [
    /\.test\./,     // test files
    /\.spec\./,
    /\.stories\./,  // Storybook
    /\.d\.ts$/,     // type declarations
  ],
}],
```

This rule prevents the common naming inconsistency where some files are `CartList.tsx` and others are `cart-list.tsx` and still others are `cartlist.tsx`.

`unicorn/no-abusive-eslint-disable` — Prevents bare `eslint-disable` without specifying which rule to disable:

```typescript
// ❌ Disables ALL rules — dangerous
// eslint-disable-next-line
const x: any = getData();

// ✅ Targeted disable with documentation
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- External API returns dynamic data
const x: any = getData();
```

`unicorn/error-message` — All `Error` constructor calls must have a message:

```typescript
// ❌ Error without context — useless stack traces
throw new Error();
throw new TypeError();

// ✅ Meaningful error messages
throw new Error('User ID is required');
throw new TypeError(`Expected string, got ${typeof value}: ${String(value)}`);
```

`unicorn/prevent-abbreviations` — Encourage readable names over abbreviations:

```typescript
// ❌ Abbreviations reduce readability
const fn = (e: Event, cb: () => void, err: Error) => { /* ... */ };
const req = getRequest();
const res = sendResponse();

// ✅ Descriptive names
const handler = (event: Event, callback: () => void, error: Error) => { /* ... */ };
const request = getRequest();
const response = sendResponse();
```

The rule is configurable to allow specific abbreviations that are team conventions:

```typescript
'unicorn/prevent-abbreviations': ['warn', {
  replacements: {
    e: { event: true },     // e → event
    err: { error: true },   // err → error
    cb: { callback: true }, // cb → callback
    fn: false,              // fn is acceptable in FP contexts
    props: false,           // React convention
    ref: false,             // React ref convention
    ctx: false,             // Context is universally understood
    req: false,             // HTTP request — widely understood
    res: false,             // HTTP response — widely understood
  },
}],
```

**Rules to disable for React/FP context:**

`unicorn/no-null` — unicorn prefers `undefined` over `null` because they behave identically in most contexts and `undefined` is more idiomatic JavaScript. However, React components return `null` (not `undefined`) when rendering nothing, and many third-party libraries return `null`. This rule causes too many false positives in React code:

```typescript
// React components return null
function NotificationBadge({ count }: { count: number }): React.ReactElement | null {
  if (count === 0) return null;  // ❌ unicorn/no-null — but this is correct React
  return <span>{count}</span>;
}
```

`unicorn/no-array-reduce` — unicorn recommends against `reduce()` in favor of more explicit loops. This conflicts with FP-heavy code where `reduce` is used deliberately and idiomatically for aggregation. With `functional/no-loop-statements` present (even if turned off), the guidance is to use higher-order functions including `reduce`:

```typescript
// ❌ unicorn flags this, but it's idiomatic FP
const totals = orders.reduce(
  (acc, order) => ({
    count: acc.count + 1,
    total: acc.total + order.amount,
  }),
  { count: 0, total: 0 }
);
```

## 7.7 eslint-plugin-sonarjs: Code Quality Gates

`eslint-plugin-sonarjs` brings SonarQube-style static analysis to ESLint. The plugin has evolved significantly — version 3.x (2024) removed rules that duplicated other plugins (`@typescript-eslint`, `unicorn`) and focused on unique value-adds. [36]

**The signature rule: `sonarjs/cognitive-complexity`**

Cognitive complexity is a metric for how hard code is to understand and maintain. Unlike cyclomatic complexity (which counts distinct execution paths), cognitive complexity measures how difficult the control flow *feels* to read — applying extra weight to nested conditions and penalizing code that breaks the linear flow:

```typescript
// High cognitive complexity:
function processOrder(order: Order, user: User, config: Config): ProcessedOrder {
  if (order.status === 'pending') {          // +1
    if (user.isVerified) {                   // +2 (nested)
      if (config.strictMode) {               // +3 (nested deeper)
        if (order.amount > config.threshold) { // +4 (even deeper)
          // ... complex logic
        }
      }
    } else {                                 // +1
      for (const item of order.items) {      // +2 (nested loop)
        if (item.hasDiscount) {              // +3 (nested in loop)
          // ...
        }
      }
    }
  }
}
// Total: ~16 — exceeds the recommended threshold of 15
```

A cognitive complexity above 15 in a single function is a clear architectural signal: the function is doing too much and needs decomposition. Enforcing a limit prevents complexity accumulation over time.

```typescript
// After decomposition: each function is simple and readable
const processVerifiedOrder = (order: Order, config: Config): ProcessedOrder => {
  if (config.strictMode && order.amount > config.threshold) {
    return processStrictOrder(order, config);
  }
  return processStandardOrder(order);
};

const processUnverifiedOrder = (order: Order): ProcessedOrder => {
  const discountedItems = order.items.filter(item => item.hasDiscount);
  return applyDiscounts(order, discountedItems);
};

const processOrder = (order: Order, user: User, config: Config): ProcessedOrder => {
  if (order.status !== 'pending') return { ...order, skipped: true };
  return user.isVerified
    ? processVerifiedOrder(order, config)
    : processUnverifiedOrder(order);
};
// Each function is well under 15 cognitive complexity
```

**`sonarjs/no-identical-functions`:**

Duplicate code is a maintenance hazard. When the same logic exists in two places, fixing a bug requires finding and fixing both. This rule detects functions with identical bodies:

```typescript
// ❌ Duplicate logic
const formatUserName = (firstName: string, lastName: string): string =>
  `${firstName.trim()} ${lastName.trim()}`;

const formatContactName = (firstName: string, lastName: string): string =>
  `${firstName.trim()} ${lastName.trim()}`;  // identical — sonarjs flags this

// ✅ Extract shared function
const formatFullName = (firstName: string, lastName: string): string =>
  `${firstName.trim()} ${lastName.trim()}`;
const formatUserName = formatFullName;
const formatContactName = formatFullName;
```

**`sonarjs/no-collapsible-if`:**

```typescript
// ❌ Nested ifs that should be merged
if (user.isActive) {
  if (user.hasPermission('admin')) {
    showAdminPanel();
  }
}

// ✅ Collapsed condition
if (user.isActive && user.hasPermission('admin')) {
  showAdminPanel();
}
```

**`sonarjs/prefer-single-boolean-return`:**

```typescript
// ❌ Verbose boolean return
function isEligible(user: User): boolean {
  if (user.age >= 18 && user.isVerified) {
    return true;
  }
  return false;
}

// ✅ Direct expression return
const isEligible = (user: User): boolean =>
  user.age >= 18 && user.isVerified;
```

## 7.8 eslint-plugin-import-x: Module Discipline

`eslint-plugin-import-x` is the actively-maintained fork of `eslint-plugin-import`, providing TypeScript-aware import analysis with better ESM support and performance. [39]

**Why switch from `eslint-plugin-import` to `eslint-plugin-import-x`:**

- `eslint-plugin-import` has sporadic maintenance and slow ESLint v9 flat config support
- `eslint-plugin-import-x` has the same rules with active maintenance, flat config support from day one, and the newer `resolver-next` API for TypeScript path resolution
- The `e18e` project (ecosystem health) formally recommends the switch

**`import-x/no-cycle` — circular dependency prevention:**

The configuration choice of `maxDepth: Infinity` is important. A lower `maxDepth` misses transitive cycles:

```typescript
// With maxDepth: 1 — only detects direct cycles
// A → B → A — detected
// A → B → C → A — NOT detected (depth 3)

// With maxDepth: Infinity — detects all cycles
// A → B → C → D → E → A — detected

'import-x/no-cycle': ['error', {
  maxDepth: Infinity,
  ignoreExternal: true,  // don't check node_modules — too slow and not actionable
}],
```

**`import-x/no-default-export` — enforce named exports:**

Default exports create several maintenance problems:

```typescript
// ❌ Default export
export default function processUser(user: User): ProcessedUser { /* ... */ }

// Calling file can name it anything:
import doThing from './processUser';   // any name accepted
import myHelper from './processUser';  // any name accepted
// This breaks code search, rename refactors, and makes import style inconsistent

// ✅ Named export
export function processUser(user: User): ProcessedUser { /* ... */ }

// Calling file must use the canonical name:
import { processUser } from './processUser';
// Now code search, rename, and style are consistent
```

**Exceptions** — Next.js page components and configuration files conventionally use default exports. Handle these with file-specific overrides:

```typescript
{
  files: [
    'src/pages/**/*.tsx',     // Next.js pages
    'eslint.config.*',        // ESLint config
    'vite.config.*',          // Vite config
    'jest.config.*',          // Jest config
    '*.config.ts',            // Generic config files
  ],
  rules: {
    'import-x/no-default-export': 'off',
  },
},
```

**`import-x/consistent-type-specifier-style` — standardize type import syntax:**

```typescript
// With prefer-inline: every type import uses the inline 'type' keyword
import { User, type UserRole, type Permission } from './types';

// With prefer-top-level: separate import type statements
import type { UserRole, Permission } from './types';
import { User } from './types';

// Recommendation: prefer-inline with verbatimModuleSyntax: true
// produces self-documenting imports
```

**`import-x/no-extraneous-dependencies` — enforce dependency declarations:**

```typescript
'import-x/no-extraneous-dependencies': ['error', {
  devDependencies: [
    // Only these files can import devDependencies
    '**/*.test.ts',
    '**/*.test.tsx',
    '**/*.spec.ts',
    '**/*.spec.tsx',
    '**/*.stories.ts',
    '**/*.stories.tsx',
    '**/eslint.config.*',
    '**/vite.config.*',
    '**/jest.config.*',
    '**/webpack.config.*',
  ],
}],
```

This rule ensures production code doesn't accidentally import test utilities or build tools, which would bloat the production bundle.

## 7.9 eslint-plugin-promise: Async/Await Safety

The `eslint-plugin-promise` rules complement `@typescript-eslint`'s Promise rules by covering patterns that require runtime Promise API knowledge rather than TypeScript type information.

**`promise/no-multiple-resolved` — Promises must not be resolved or rejected multiple times:**

```typescript
// ❌ Promise resolved multiple times
function unstableOperation(): Promise<string> {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve('first'), 100);
    setTimeout(() => resolve('second'), 200);  // ← flagged: double resolve
  });
}

// ✅ Single resolution
function stableOperation(): Promise<string> {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve('result'), 100);
    // cleanup handled via returned promise chain, not multiple resolves
  });
}
```

**`promise/always-return` — Every then() callback must return:**

```typescript
// ❌ Inconsistent returns in then callback
fetchUser(id)
  .then(user => {
    if (user.isActive) {
      return processUser(user);
    }
    // implicit undefined return for inactive users — confusing
  });

// ✅ Consistent return
fetchUser(id)
  .then(user => {
    if (user.isActive) {
      return processUser(user);
    }
    return null; // explicit return for all paths
  });
```

**`promise/catch-or-return` — Promises must be handled:**

```typescript
// ❌ Promise without error handling
fetchUser(userId)
  .then(user => displayUser(user));
  // what happens if fetchUser rejects? silent failure

// ✅ With catch
fetchUser(userId)
  .then(user => displayUser(user))
  .catch(error => handleError(error));

// ✅ Or return (for chaining)
return fetchUser(userId)
  .then(user => displayUser(user));
// caller handles the rejection
```

## 7.10 React Plugins: Best Rule Configurations

**eslint-plugin-react:**

The `react.configs.recommended.rules` spread includes all the foundational React rules. Beyond recommended:

`react/no-unstable-nested-components` — one of the most impactful performance rules:

```typescript
// ❌ New component created on every render — causes unnecessary re-mounts
function ParentComponent({ data }: { data: DataItem[] }): React.ReactElement {
  // This creates a new function component reference on every render of ParentComponent
  function ItemComponent({ item }: { item: DataItem }): React.ReactElement {
    return <li>{item.name}</li>;
  }

  return <ul>{data.map(item => <ItemComponent key={item.id} item={item} />)}</ul>;
}

// ✅ Define outside the parent component — stable reference
interface ItemComponentProps { readonly item: DataItem; }
function ItemComponent({ item }: ItemComponentProps): React.ReactElement {
  return <li>{item.name}</li>;
}

function ParentComponent({ data }: { data: DataItem[] }): React.ReactElement {
  return <ul>{data.map(item => <ItemComponent key={item.id} item={item} />)}</ul>;
}
```

`react/jsx-key` with `checkFragmentShorthand: true`:

```typescript
// ❌ Missing key on fragment shorthand (caught with checkFragmentShorthand)
items.map(item => (
  <>                         // ← fragment without key
    <dt>{item.term}</dt>
    <dd>{item.definition}</dd>
  </>
));

// ✅ Key on the fragment
items.map(item => (
  <React.Fragment key={item.id}>
    <dt>{item.term}</dt>
    <dd>{item.definition}</dd>
  </React.Fragment>
));
```

`react/jsx-boolean-value: ['error', 'never']` — Don't pass explicit `true` to boolean props:

```typescript
// ❌ Redundant explicit true
<Component disabled={true} loading={true} />

// ✅ Boolean shorthand
<Component disabled loading />
```

`react/hook-use-state` — Enforce destructuring for `useState`:

```typescript
// ❌ Not destructured
const countState = useState(0);
const count = countState[0];
const setCount = countState[1];

// ✅ Destructured with consistent naming
const [count, setCount] = useState(0);
```

**eslint-plugin-react-hooks — Rules of Hooks:**

These rules are the foundation of correct hooks usage. They should be `error`, not `warn`:

`react-hooks/rules-of-hooks` — hooks must only be called in React function components or custom hooks, at the top level:

```typescript
// ❌ Hook inside a conditional
function UserProfile({ userId, isEditing }: Props): React.ReactElement {
  if (isEditing) {
    const [draftName, setDraftName] = useState(user?.name ?? ''); // ← inside conditional
  }
  // ...
}

// ✅ Hooks at top level, conditional UI below
function UserProfile({ userId, isEditing }: Props): React.ReactElement {
  const [draftName, setDraftName] = useState('');
  const user = useUser(userId);
  
  return isEditing
    ? <EditForm value={draftName} onChange={setDraftName} />
    : <DisplayView name={user?.name} />;
}
```

`react-hooks/exhaustive-deps` — All values used inside effects must be in the dependency array:

```typescript
// ❌ Missing dependency — stale closure bug
function SearchResults({ query }: { query: string }): React.ReactElement {
  const [results, setResults] = useState([]);
  
  useEffect(() => {
    // query is used inside but not in deps
    fetchResults(query).then(setResults);
  }, []); // ← missing query — stale closure, won't re-fetch when query changes

  return <ResultList items={results} />;
}

// ✅ Complete dependency array
function SearchResults({ query }: { query: string }): React.ReactElement {
  const [results, setResults] = useState([]);
  
  useEffect(() => {
    fetchResults(query).then(setResults);
  }, [query]); // ← re-fetches when query changes

  return <ResultList items={results} />;
}
```

This rule should be `error`. Stale closure bugs from incorrect dependency arrays are among the most subtle and hard-to-debug React production issues. `exhaustive-deps` as `warn` is insufficient — developers ignore warnings and stale closures accumulate.


---

# 8. Proposed ESLint Configuration

## 8.1 Design Rationale

The proposed configuration builds on the existing `eslint-dockerized` config with a clear design philosophy: enforce invariants that prevent real bugs at `error`, encourage better patterns at `warn`, and explicitly disable rules that conflict with the chosen paradigms.

**The four design goals:**

1. **Enforce FP discipline pragmatically.** Immutability and pure functions are `error` severity. Expression statement restrictions are `off` for React compatibility. This is the "FP preferred, OOP permitted" stance in code.

2. **Leverage the full type-aware rule set.** `strictTypeChecked` is the foundation, enhanced with additional rules that the preset doesn't enable. Every rule that requires the TypeScript type checker is used — they are the most valuable rules because they understand your code's semantics, not just its syntax.

3. **Add code quality gates.** unicorn for modernization and code quality, sonarjs for complexity and code smell detection, import-x for module discipline. These plugins together create a comprehensive quality net.

4. **Stay precise on React.** React, react-hooks, and jsx-a11y rules at their highest appropriate severity. Accessibility rules are `error` — these affect real users. Dependency array rules are `error` — stale closures are production bugs.

**Why `eslint.configs.recommended` instead of `eslint.configs.all`:**

The existing config uses `eslint.configs.all` which enables every core ESLint rule. This is aggressively strict but creates several problems:

- Rules like `no-unused-vars` conflict with `@typescript-eslint/no-unused-vars` — you get double-reporting with potentially different options
- Many rules (`init-declarations`, `no-ternary`, `prefer-destructuring`, `max-classes-per-file`) conflict with idiomatic TypeScript code
- Aggressive style rules (`max-statements`, `max-lines`, `one-var`) have defaults that virtually all real-world code violates
- The signal-to-noise ratio is poor — developers learn to ignore the output rather than fix it

`eslint.configs.recommended` gives you the essential bug-catching rules. `tseslint.configs.strictTypeChecked` adds the TypeScript-specific layer. Together they cover all the bug prevention of `all` without the noise. Rules that `all` provided but that need custom configuration (complexity limits, naming conventions) are added explicitly through sonarjs and unicorn.

**Config layering order matters:**

Config objects in flat config are applied sequentially. Later rules override earlier ones for the same file. The order:

1. `ignores` — exclude generated files first, before any rules
2. Core ESLint (`recommended`) — base bug-catching rules
3. TypeScript (`strictTypeChecked` + `stylisticTypeChecked`) — type-aware rules that supersede some core rules
4. Functional (`recommended` + `stylistic`) — FP discipline
5. Promise safety — async correctness
6. Module discipline (`import-x`) — architectural boundaries
7. Code quality (`unicorn`, `sonarjs`) — modernization and complexity
8. React ecosystem — JSX files only
9. File-specific overrides (config files, test files) — relax rules where appropriate

## 8.2 New Plugins to Add to the Dockerfile

The proposed configuration requires four new packages in the Dockerfile's `npm install -g` command:

```dockerfile
eslint-plugin-unicorn@57.0.0
```
The definitive TypeScript/JavaScript quality and modernization plugin. 100+ rules targeting modern patterns, better error messages, and code clarity.

```dockerfile
eslint-plugin-sonarjs@3.0.2
```
SonarQube rules for ESLint. Cognitive complexity gating, duplicate code detection, and code smell identification. Note: v3.x is required; v2.x duplicated rules from other plugins causing conflicts.

```dockerfile
eslint-plugin-import-x@4.16.1
```
Circular dependency detection, module boundary enforcement, and import consistency. The modern, actively-maintained fork of `eslint-plugin-import` with full ESLint 9 flat config support.

```dockerfile
eslint-import-resolver-typescript@3.10.1
```
TypeScript path resolution for `eslint-plugin-import-x`. Required for `import-x/no-cycle` and `import-x/no-unresolved` to understand TypeScript `paths` configuration.

**Updated Dockerfile install command:**

```dockerfile
RUN set -eux && npm install -g \
         @eslint/js@9.24.0 \
         typescript@5.8.3 \
         eslint-formatter-compact \
         eslint-formatter-unix \
         typescript-eslint@8.29.0 \
         jiti@2.4.2 \
         eslint@9.24.0 \
         eslint-config-hardcore@47.0.1 \
         eslint-plugin-promise@7.2.1 \
         eslint-plugin-react@7.37.2 \
         eslint-plugin-react-hooks@5.1.0 \
         eslint-plugin-jsx-a11y@6.10.2 \
         eslint-plugin-functional@9.0.1 \
         eslint-plugin-unicorn@57.0.0 \
         eslint-plugin-sonarjs@3.0.2 \
         eslint-plugin-import-x@4.16.1 \
         eslint-import-resolver-typescript@3.10.1 \
         && /usr/local/lib/node_modules/eslint/bin/eslint.js --version | grep -E '^v?[0-9]+'
```

## 8.3 Complete Proposed eslint.config.ts

The following is the complete proposed configuration with inline explanations:

```typescript
import eslint from '@eslint/js';
import functional from 'eslint-plugin-functional';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import pluginPromise from 'eslint-plugin-promise';
import unicorn from 'eslint-plugin-unicorn';
import sonarjs from 'eslint-plugin-sonarjs';
import importX from 'eslint-plugin-import-x';

export default tseslint.config(
  // ── 1. Global ignores ─────────────────────────────────────────────────────
  // These patterns are excluded from all linting. Adding them prevents false
  // positives from generated files, build output, and test fixtures.
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/*.d.ts',              // Declaration files — generated, not authored
      '**/.next/**',            // Next.js build output
      '**/out/**',              // Generic build output directory
      '**/.turbo/**',           // TurboRepo cache
      '**/.nx/**',              // Nx cache
    ],
  },

  // ── 2. Core TypeScript rules ───────────────────────────────────────────────
  // Foundation: recommended core ESLint + strict TypeScript with type checking.
  // strictTypeChecked requires the TypeScript language service (slower but
  // catches the most impactful bugs).
  // stylisticTypeChecked adds consistent style rules that also need type info.
  {
    files: ['**/*.ts', '**/*.tsx'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,      // Modern project service API (faster than project: './tsconfig.json')
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: 'detect',         // Automatically detect installed React version
      },
      'import-x/resolver-next': [
        {
          // TypeScript-aware import resolution for import-x rules
          // Required for no-cycle and no-unresolved to understand TS paths
          name: 'typescript',
          options: {
            alwaysTryTypes: true,  // Prefer @types/* packages
          },
        },
      ],
    },
    rules: {
      // ── TypeScript additions beyond strictTypeChecked ──────────────────────

      // Enforce import type for type-only imports. Works with verbatimModuleSyntax.
      // prefer-inline means: import { type User, UserService } from './module'
      // rather than separate import type { User } and import { UserService } statements.
      '@typescript-eslint/consistent-type-imports': ['error', {
        prefer: 'type-imports',
        fixStyle: 'inline-type-imports',
      }],

      // Catch conditions that are always true or always false based on TypeScript types.
      // Eliminates dead code and logic errors where the type system proves the condition
      // is unconditional.
      '@typescript-eslint/no-unnecessary-condition': 'error',

      // Prefer ?? over || for null/undefined coalescing.
      // || treats 0, '', false as falsy; ?? only coalesces null and undefined.
      // This prevents the common bug: const port = config.port || 3000 (port 0 becomes 3000).
      '@typescript-eslint/prefer-nullish-coalescing': 'error',

      // Prefer optional chaining over manual null-check chains.
      // user && user.profile && user.profile.avatar → user?.profile?.avatar
      '@typescript-eslint/prefer-optional-chain': 'error',

      // Require explicit return types on exported functions and function expressions.
      // allowExpressions: simple inline expressions don't need annotation
      // allowTypedFunctionExpressions: when the type is declared separately
      // allowHigherOrderFunctions: when the outer function's return type is inferred
      '@typescript-eslint/explicit-function-return-type': ['error', {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
        allowHigherOrderFunctions: true,
      }],

      // Prevent variable shadowing. Shadowing creates confusion about which
      // variable is being modified, especially in nested closures.
      '@typescript-eslint/no-shadow': 'error',

      // Prevent variables from being used before they're declared.
      // functions: false allows function hoisting (common and intentional).
      '@typescript-eslint/no-use-before-define': ['error', {
        functions: false,  // Allow function declarations to be hoisted
        classes: true,
        variables: true,
      }],

      // Async functions that don't await anything should not be marked async.
      // A synchronous function wrapped in async adds unnecessary Promise wrapping.
      '@typescript-eslint/require-await': 'error',

      // Ensure async functions return their awaited values correctly.
      // 'in-try-catch' requires explicit return await inside try-catch blocks
      // so errors from the awaited Promise are caught by the catch block.
      '@typescript-eslint/return-await': ['error', 'in-try-catch'],

      // Remove redundant type constituents (e.g., string | string → string).
      // Usually indicates a copy-paste error or incomplete type refactoring.
      '@typescript-eslint/no-redundant-type-constituents': 'error',

      // ── Core ESLint rules replaced by TypeScript-aware equivalents ─────────

      // Replaced by @typescript-eslint/no-unused-vars (in strictTypeChecked)
      // The TS version understands type parameters, generics, and declaration merging.
      'no-unused-vars': 'off',

      // Replaced by @typescript-eslint/no-shadow above.
      'no-shadow': 'off',

      // Replaced by @typescript-eslint/no-use-before-define above.
      'no-use-before-define': 'off',

      // Replaced by @typescript-eslint/require-await above.
      'require-await': 'off',

      // TypeScript handles duplicate declarations at the compiler level.
      'no-redeclare': 'off',

      // TypeScript handles undefined variables at the compiler level (strict mode).
      'no-undef': 'off',
    },
  },

  // ── 3. Functional programming discipline ──────────────────────────────────
  // Enforces immutability and functional patterns. The specific overrides below
  // reflect the pragmatic FP-preferred (not FP-only) stance: immutability
  // rules are errors; paradigm-restriction rules are relaxed for React/framework code.
  {
    files: ['**/*.ts', '**/*.tsx'],
    extends: [
      functional.configs.recommended,
      functional.configs.stylistic,
    ],
    rules: {
      // ── Keep as error: high-value immutability rules ───────────────────────

      // Disables all object and array mutation: obj.prop = value, arr.push(), delete obj.prop.
      // The highest-value FP rule — eliminates aliasing bugs.
      'functional/immutable-data': 'error',

      // Disables let declarations. All variables should be const.
      // A let declaration is a declaration of mutable state — each one should be justified.
      'functional/no-let': 'error',

      // Enforces property signatures (readonly by default) over method signatures.
      // interface Repo { readonly findById: (id: string) => User }  ← correct
      // interface Repo { findById(id: string): User }               ← flagged
      'functional/no-method-signature': 'error',

      // ── Keep as warn: aspirational immutability ────────────────────────────

      // Encourages readonly on function parameters and return types.
      // On warn because library types are often not readonly and the rule
      // generates false positives when integrating with third-party code.
      'functional/prefer-immutable-types': 'warn',

      // ── Off: pragmatic relaxations for React + real-world TypeScript ───────

      // Classes needed for: React error boundaries, NestJS controllers,
      // TypeORM entities, Angular services, and DDD aggregates.
      'functional/no-classes': 'off',

      // JSX rendering produces expression statements. React's useEffect,
      // useState setters, and all I/O operations are expression statements.
      'functional/no-expression-statements': 'off',

      // Zero-argument functions (() => value) and rest parameters (...args)
      // are common and legitimate in TypeScript.
      'functional/functional-parameters': 'off',

      // Throwing is accepted in React error boundaries and at system boundaries
      // (HTTP handlers, CLI entry points, validation errors).
      'functional/no-throw-statements': 'off',

      // If/switch statements are necessary in many patterns. The exhaustiveness
      // checking from switch-exhaustiveness-check provides better value without
      // banning conditional statements entirely.
      'functional/no-conditional-statements': 'off',

      // for-of loops are idiomatic TypeScript. The unicorn/no-for-loop rule
      // handles the specific case of indexed for loops that should be for-of.
      'functional/no-loop-statements': 'off',

      // Promise.reject is a valid error propagation mechanism in Promise chains.
      // The promise/catch-or-return rule ensures these rejections are handled.
      'functional/no-promise-reject': 'off',

      // try-catch is necessary at system boundaries (database access,
      // external API calls, file I/O) where the errors are from third-party code.
      'functional/no-try-statements': 'off',
    },
  },

  // ── 4. Promise safety ─────────────────────────────────────────────────────
  // Complements @typescript-eslint's Promise rules. eslint-plugin-promise catches
  // Promise API misuse that doesn't require type information (constructor patterns,
  // chain structure).
  {
    files: ['**/*.ts', '**/*.tsx'],
    extends: [pluginPromise.configs['flat/recommended']],
    rules: {
      // Callbacks in .then() must always return something for predictable chaining.
      'promise/always-return': 'error',

      // All Promises must be either caught or returned (so the caller can catch).
      // allowFinally: true allows .finally() without a .catch() when combined with return.
      'promise/catch-or-return': ['error', { allowFinally: true }],

      // Prevent calling resolve() or reject() more than once in a Promise constructor.
      // Calling either twice produces a silently discarded second call.
      'promise/no-multiple-resolved': 'error',

      // Prevent returning values from .finally() callbacks.
      // .finally() is for cleanup; its return value is ignored.
      'promise/no-return-in-finally': 'error',
    },
  },

  // ── 5. Module discipline ──────────────────────────────────────────────────
  // Architectural enforcement: circular dependency prevention, named export
  // preference, and import consistency. import-x is the modern fork of
  // eslint-plugin-import with better flat config and TypeScript support.
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      'import-x': importX,
    },
    rules: {
      // Detect circular dependencies. maxDepth: Infinity catches transitive cycles
      // (A → B → C → A) not just direct ones. ignoreExternal skips node_modules
      // (too slow and not actionable).
      'import-x/no-cycle': ['error', {
        maxDepth: Infinity,
        ignoreExternal: true,
      }],

      // Enforce named exports over default exports.
      // Named exports: searchable, renameable, consistently referenced.
      // Default exports: any name accepted, poor for tooling and code search.
      // Exceptions are handled in the config-files override block below.
      'import-x/no-default-export': 'error',

      // Prevent importing the same module twice with different symbols.
      // prefer-inline: true enforces all symbols from one module in a single import.
      'import-x/no-duplicates': ['error', { 'prefer-inline': true }],

      // Prevent importing devDependencies in production code.
      // devDependencies listed here are files that ARE allowed to import devDeps.
      'import-x/no-extraneous-dependencies': ['error', {
        devDependencies: [
          '**/*.test.ts',
          '**/*.test.tsx',
          '**/*.spec.ts',
          '**/*.spec.tsx',
          '**/*.stories.ts',
          '**/*.stories.tsx',
          '**/eslint.config.*',
          '**/vite.config.*',
          '**/jest.config.*',
          '**/webpack.config.*',
          '**/playwright.config.*',
          '**/cypress.config.*',
        ],
      }],

      // Enforce consistent inline type specifiers.
      // prefer-inline: import { type User, UserService } rather than separate import type statements.
      // Works in concert with @typescript-eslint/consistent-type-imports.
      'import-x/consistent-type-specifier-style': ['error', 'prefer-inline'],
    },
  },

  // ── 6. Code quality: Unicorn ──────────────────────────────────────────────
  // Modernization and quality rules. The full recommended preset is too aggressive;
  // we select the high-value rules and disable those that conflict with React/FP style.
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: { unicorn },
    rules: {
      // ── Node.js modernization ──────────────────────────────────────────────

      // Use node: protocol prefix for built-in modules.
      // import fs from 'node:fs' — unambiguous, future-proof.
      'unicorn/prefer-node-protocol': 'error',

      // Prefer ESM over CommonJS.
      // import/export over require/module.exports.
      'unicorn/prefer-module': 'error',

      // ── Array and iteration modernization ─────────────────────────────────

      // Replace indexed for loops with for-of.
      // for (let i = 0; i < arr.length; i++) { fn(arr[i]) }
      // → for (const item of arr) { fn(item) }
      'unicorn/no-for-loop': 'error',

      // Use Array.isArray() instead of instanceof Array.
      // instanceof fails for arrays from different realms (iframes, VMs).
      'unicorn/no-instanceof-array': 'error',

      // Use Array.prototype.flat() for flattening.
      // [].concat(...arrays) → arrays.flat()
      'unicorn/prefer-array-flat': 'error',

      // Use Array.prototype.flatMap() for map+flat combinations.
      // arr.map(fn).flat() → arr.flatMap(fn) — one pass instead of two.
      'unicorn/prefer-array-flat-map': 'error',

      // Use Array.prototype.some() instead of Array.prototype.find() !== undefined.
      // arr.find(x => x > 5) !== undefined → arr.some(x => x > 5)
      'unicorn/prefer-array-some': 'error',

      // ── String modernization ───────────────────────────────────────────────

      // Use String.prototype.includes() over indexOf() comparisons.
      // arr.indexOf(x) !== -1 → arr.includes(x)
      'unicorn/prefer-includes': 'error',

      // Use String.prototype.slice() over substring() and substr().
      // slice() supports negative indices; the others have inconsistent behavior.
      'unicorn/prefer-string-slice': 'error',

      // ── Type checking modernization ────────────────────────────────────────

      // Use === undefined instead of typeof x === 'undefined'.
      // typeof check is needed only for undeclared globals; for variables, === undefined is cleaner.
      'unicorn/no-typeof-undefined': 'error',

      // ── Code quality ──────────────────────────────────────────────────────

      // Prevent bare eslint-disable without specifying which rule to disable.
      // Forces targeted, documented suppressions.
      'unicorn/no-abusive-eslint-disable': 'error',

      // Error constructors must receive a message argument.
      // throw new Error() → throw new Error('Descriptive message')
      'unicorn/error-message': 'error',

      // Move functions to the outermost scope where they don't need closure.
      // Prevents unnecessary re-creation of functions that could be defined once.
      'unicorn/consistent-function-scoping': 'error',

      // Remove useless undefined arguments passed to functions.
      // fn(undefined) when fn accepts optional parameters is noise.
      'unicorn/no-useless-undefined': 'error',

      // Prefer ternary expressions for simple single-line if/else.
      // onlySingleLine: only enforce when both branches fit on one line.
      'unicorn/prefer-ternary': ['error', 'onlySingleLine'],

      // Prefer positive conditions over negated ones.
      // if (!isInvalid) {...} else {...} → if (isValid) {...} else {...}
      'unicorn/no-negated-condition': 'error',

      // new Error must use the throw keyword, not return.
      // throw new Error() not return new Error().
      'unicorn/throw-new-error': 'error',

      // ── Filename conventions ───────────────────────────────────────────────

      // Enforce consistent file naming across the codebase.
      // camelCase: hooks, services, utilities (useCart.ts, cartService.ts)
      // PascalCase: components, classes (CartList.tsx, UserRepository.ts)
      // kebabCase: config files, scripts (eslint.config.ts, setup-env.ts)
      'unicorn/filename-case': ['error', {
        cases: {
          camelCase: true,
          pascalCase: true,
          kebabCase: true,
        },
        ignore: [
          /^eslint\.config\./,
          /^vite\.config\./,
          /^jest\.config\./,
          /^tsconfig.*\.json$/,
          /\.test\./,
          /\.spec\./,
          /\.stories\./,
          /\.d\.ts$/,
        ],
      }],

      // ── Style with gradual adoption ────────────────────────────────────────

      // Encourage readable names over abbreviations.
      // warn (not error) to allow gradual adoption.
      // Exceptions for widely-understood abbreviations in the project.
      'unicorn/prevent-abbreviations': ['warn', {
        replacements: {
          e: { event: true },
          err: { error: true },
          cb: { callback: true },
          fn: false,       // fn is acceptable in FP contexts
          props: false,    // React convention
          ref: false,      // React ref
          ctx: false,      // Context
          req: false,      // HTTP request
          res: false,      // HTTP response
          i: false,        // Loop index (rare; unicorn/no-for-loop handles most cases)
        },
      }],

      // ── Disabled: conflicts with React or FP style ─────────────────────────

      // React components return null; null is also returned by many React libraries.
      // This rule conflicts fundamentally with React's component model.
      'unicorn/no-null': 'off',

      // FP teams use reduce deliberately for aggregations and transformations.
      // See Section 3.7 for when reduce is appropriate.
      'unicorn/no-array-reduce': 'off',

      // forEach is acceptable for side-effect chains on arrays.
      'unicorn/no-array-for-each': 'off',

      // React manages the DOM; these rules don't apply.
      'unicorn/prefer-dom-node-append': 'off',
      'unicorn/prefer-query-selector': 'off',
    },
  },

  // ── 7. Code quality: SonarJS ──────────────────────────────────────────────
  // SonarQube-style rules for cognitive complexity, duplicate code detection,
  // and code smell identification. sonarjs v3+ focuses on unique value-adds,
  // removing rules that duplicate @typescript-eslint and unicorn.
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: { sonarjs },
    rules: {
      // Detect functions with identical bodies. A duplicate threshold of 3
      // means 3+ lines of identical code across two functions triggers the rule.
      // This catches copy-paste programming before it becomes maintenance debt.
      'sonarjs/no-identical-functions': ['error', 3],

      // Cognitive complexity limit. Functions above 15 are flagged for decomposition.
      // Cognitive complexity is a measure of how hard the control flow is to understand,
      // not just how many branches exist.
      'sonarjs/cognitive-complexity': ['error', 15],

      // Detect nested if statements that could be merged with &&.
      // if (a) { if (b) { ... } } → if (a && b) { ... }
      'sonarjs/no-collapsible-if': 'error',

      // Prevent nested template literals which become hard to read.
      // `Hello ${`${name}`}` → `Hello ${name}`
      'sonarjs/no-nested-template-literals': 'error',

      // Prefer returning a boolean expression directly over wrapping in if/else.
      // if (condition) return true; return false; → return condition;
      'sonarjs/prefer-single-boolean-return': 'error',

      // Remove unnecessary jump statements (return, break, continue) that
      // don't change control flow.
      'sonarjs/no-redundant-jump': 'error',

      // Detect switch/if statements where all branches are identical.
      // Usually indicates unfinished code or copy-paste errors.
      'sonarjs/no-all-duplicated-branches': 'error',

      // Detect collection elements being overwritten without being used.
      // const arr = []; arr[0] = 1; arr[0] = 2; (first write is wasted)
      'sonarjs/no-element-overwrite': 'error',

      // Detect conditions that always evaluate to the same value.
      // Overlaps with @typescript-eslint/no-unnecessary-condition but catches
      // patterns that don't require type information.
      'sonarjs/no-gratuitous-expressions': 'error',
    },
  },

  // ── 8. React: Components, Hooks, Accessibility ────────────────────────────
  // React rules only apply to .tsx and .jsx files — files that contain JSX.
  // Applying React rules to pure .ts files is unnecessary and can produce
  // false positives.
  {
    files: ['**/*.tsx', '**/*.jsx'],
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      // ── React core rules ───────────────────────────────────────────────────

      // Spread all recommended rules as the baseline.
      ...react.configs.recommended.rules,

      // Since React 17, import React is no longer needed for JSX.
      'react/react-in-jsx-scope': 'off',

      // Prevent duplicate prop names in JSX.
      // <Comp foo="1" foo="2"> — the second foo silently overwrites the first.
      'react/jsx-no-duplicate-props': 'error',

      // Warn against using array indices as keys.
      // Array indices produce incorrect diffing when items are added/removed/reordered.
      // Warn (not error) because some use cases are legitimate (static, non-reordering lists).
      'react/no-array-index-key': 'warn',

      // Prevent defining components inside other components.
      // Nested components create new function references on every render,
      // causing unnecessary re-mounts and breaking React's optimization paths.
      'react/no-unstable-nested-components': 'error',

      // All list items need a unique, stable key prop.
      // checkFragmentShorthand: catches keys missing on fragment shorthand (<> ... </>)
      // checkKeyMustBeforeSpread: enforces key comes before {...spread}
      'react/jsx-key': ['error', {
        checkFragmentShorthand: true,
        checkKeyMustBeforeSpread: true,
      }],

      // Self-close components with no children.
      // <Spinner></Spinner> → <Spinner />
      'react/self-closing-comp': ['error', {
        component: true,
        html: true,
      }],

      // Encourage readonly props (FP discipline at the component level).
      // On warn because this requires changes to many component interfaces
      // and some third-party component types are not readonly.
      'react/prefer-read-only-props': 'warn',

      // Enforce destructuring for useState return value.
      // const state = useState(0) → const [value, setValue] = useState(0)
      'react/hook-use-state': 'error',

      // Don't pass explicit true to boolean JSX props.
      // <Component flag={true} /> → <Component flag />
      'react/jsx-boolean-value': ['error', 'never'],

      // Use the <> shorthand for fragments (not <React.Fragment>).
      // Exception: when a fragment needs a key attribute, use <React.Fragment key="...">
      'react/jsx-fragments': ['error', 'syntax'],

      // ── React Hooks — non-negotiable error severity ────────────────────────

      // Spread all recommended hooks rules as the baseline.
      ...reactHooks.configs.recommended.rules,

      // Hooks must only be called in function components or custom hooks,
      // at the top level (not in conditionals, loops, or nested functions).
      'react-hooks/rules-of-hooks': 'error',

      // All values used inside effects, callbacks, and memos must be listed
      // in their dependency arrays. This prevents stale closures — a primary
      // source of React production bugs.
      // MUST be error, not warn. Developers ignore warnings; stale closures
      // cause silent data corruption and subtle UI bugs.
      'react-hooks/exhaustive-deps': 'error',

      // ── Accessibility — all recommended rules as errors ────────────────────

      // Spread all recommended accessibility rules.
      // Accessibility issues are not style preferences — they break real users.
      // All accessibility rules should be error severity.
      ...jsxA11y.configs.recommended.rules,
    },
  },

  // ── 9. Config and script files: selective relaxation ──────────────────────
  // Configuration files (ESLint, Vite, Jest, etc.) have different conventions:
  // - They typically use default exports (e.g., export default defineConfig(...))
  // - They import devDependencies
  // - They may use dynamic requires for Node.js compatibility
  {
    files: [
      'eslint.config.*',
      'vite.config.*',
      'jest.config.*',
      'vitest.config.*',
      'webpack.config.*',
      'rollup.config.*',
      'playwright.config.*',
      '*.config.ts',
      '*.config.js',
    ],
    rules: {
      'import-x/no-default-export': 'off',           // Config files use default exports
      '@typescript-eslint/no-unsafe-assignment': 'off', // Config files have loose types
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-require-imports': 'off', // Some configs use require()
    },
  },
);
```

## 8.4 Rule-by-Rule Rationale for Changes from Existing Config

This table documents every change from the existing `eslint-dockerized` config and the rationale for each change:

| Area | Change | Rationale |
|---|---|---|
| **Core ESLint** | `eslint.configs.all` → `eslint.configs.recommended` | `all` enables rules that conflict with TypeScript patterns, duplicate `@typescript-eslint` rules, and have aggressive defaults for metrics that should be configurable (complexity, line count). `recommended` is cleaner; TypeScript-specific rules come from `strictTypeChecked`. |
| **TypeScript** | Added `tseslint.configs.stylisticTypeChecked` | Adds type-aware stylistic rules: consistent array type syntax (`Array<T>` vs `T[]`), consistent non-null assertion patterns, and consistent assertion syntax. |
| **TypeScript** | Added `@typescript-eslint/consistent-type-imports` | Enforces `type` keyword for type-only imports. Required for `verbatimModuleSyntax` in tsconfig. Critical for tree-shaking correctness and compile-time erasure of type imports. |
| **TypeScript** | Added `@typescript-eslint/no-unnecessary-condition` | Catches conditions that TypeScript's type system proves are always true or false — indicates dead code, logic errors, or types that don't match the assumptions. |
| **TypeScript** | Added `@typescript-eslint/prefer-nullish-coalescing` | `??` is semantically correct for null/undefined coalescing; `\|\|` incorrectly coalesces `0`, `''`, and `false`. This rule prevents a common class of logic bug. |
| **TypeScript** | Added `@typescript-eslint/prefer-optional-chain` | Replaces verbose manual null-check chains with idiomatic optional chaining. Reduces noise and prevents mistakes in multi-level null checks. |
| **TypeScript** | Added `@typescript-eslint/explicit-function-return-type` | Exported functions must declare their return types. Makes contracts explicit, catches implementation deviations, and prevents unintended type widening from refactoring. |
| **TypeScript** | Added `@typescript-eslint/no-shadow` | Prevents variable shadowing that creates confusion about which variable is in scope, especially in nested closures. |
| **TypeScript** | Added `@typescript-eslint/return-await` in-try-catch | Ensures that `return await` is used inside try-catch so the awaited Promise's errors are caught by the catch block. Without it, the error escapes to the caller. |
| **Functional** | Changed `prefer-immutable-types` from not configured to `'warn'` | Explicitly surfacing the aspirational `readonly` on parameters/return types. On `warn` to allow gradual adoption without breaking builds when library types aren't `readonly`. |
| **Ignores** | Added global `ignores` block | Prevents linting of generated files, build output, and cache directories. Eliminates false positives from generated `.d.ts` files and speed improvements from not linting `node_modules`. |
| **New Plugin** | Added `eslint-plugin-unicorn` | 15+ targeted rules covering Node.js modernization, array method preferences, type checking patterns, error message enforcement, and file naming conventions. |
| **New Plugin** | Added `eslint-plugin-sonarjs` | Cognitive complexity gating (`max: 15`), duplicate function detection, and code smell rules that don't overlap with existing plugins. |
| **New Plugin** | Added `eslint-plugin-import-x` | Circular dependency detection, named export enforcement, type import consistency, and dependency validation. Addresses a significant gap in the existing config. |
| **React** | `react-hooks/exhaustive-deps` explicitly to `'error'` | The default from `reactHooks.configs.recommended.rules` is `warn`. Changed to `error` because incorrect dependency arrays cause stale closure bugs — a production bug category, not a style issue. |
| **React** | Added `react/no-unstable-nested-components: 'error'` | Nested component definitions create new function references on every parent render, causing unnecessary re-mounts and breaking React.memo optimization. Common performance bug. |
| **React** | Added `react/jsx-key` with fragment shorthand check | The base recommended rule doesn't check fragment shorthands (`<>`). Added `checkFragmentShorthand: true` to catch missing keys on fragment-based list items. |
| **React** | Added `react/self-closing-comp: 'error'` | Enforces consistent self-closing syntax for components without children. Style consistency with no functional impact. |
| **React** | Added `react/hook-use-state: 'error'` | Enforces destructuring for `useState` return value. Non-destructured useState is less readable and inconsistent with all tutorial and documentation examples. |
| **React split** | Moved React rules to `files: ['**/*.tsx', '**/*.jsx']` | React and accessibility rules should only apply to JSX files. Applying them to `.ts` files produces false positives and confusing errors in non-component TypeScript. |
| **Config override** | Added config file override block | Configuration files (ESLint, Vite, etc.) use default exports and import devDependencies by convention. The override block relaxes `no-default-export` and related rules for these files. |

## 8.5 Migration Guide from Existing Config

For teams using the existing `eslint-dockerized` config who want to migrate to the proposed config, follow this process:

**Step 1: Update the Dockerfile**
Add the four new packages to the npm install command. Build the Docker image.

**Step 2: Audit the new violations**
Run the new config with `--max-warnings` set to a high number:
```bash
docker run --rm -v $(pwd):/data eslint-dockerized -c /config/eslint.config.ts --max-warnings 9999 .
```
Save the output. Count violations per rule.

**Step 3: Handle the switch from `eslint.configs.all` to `eslint.configs.recommended`**
Some rules that `all` was providing may no longer be active in `recommended`. Check your codebase for any rules you relied on from `all` that you want to keep. Add them explicitly in the rules section.

**Step 4: Fix autofixable violations first**
```bash
docker run --rm -v $(pwd):/data eslint-dockerized \
  -c /config/eslint.config.ts \
  --fix \
  --rule '{"@typescript-eslint/consistent-type-imports": "error"}' \
  --rule '{"@typescript-eslint/prefer-optional-chain": "error"}' \
  --rule '{"unicorn/no-for-loop": "error"}' \
  .
```

**Step 5: Phase in remaining rules**
Use the phased adoption strategy from Section 9.1. Promote rules to `error` as violations are fixed.

**Estimated migration effort:**

| Rule category | Violations in typical medium codebase | Effort |
|---|---|---|
| `consistent-type-imports` | 50–200 | Autofix |
| `prefer-optional-chain` | 20–100 | Autofix |
| `prefer-nullish-coalescing` | 10–50 | Autofix + review |
| `no-for-loop` (unicorn) | 5–30 | Autofix |
| `no-cycle` (import-x) | 0–20 | Manual refactoring |
| `no-default-export` (import-x) | 10–100 | Manual (with codemods) |
| `cognitive-complexity` (sonarjs) | 5–20 complex functions | Manual refactoring |
| `explicit-function-return-type` | 20–200 | Manual annotation |

The highest-effort items are `no-default-export` (if you have many existing default exports) and `explicit-function-return-type` (if function return types weren't previously annotated). Both have strong ROI: named exports improve maintainability significantly, and explicit return types prevent contract violations.


---

# 9. Team Adoption & Governance

## 9.1 Phased Adoption Strategy for Brownfield Codebases

The worst way to introduce a strict linting config to an existing codebase is to commit all rules at `error` severity simultaneously. The result is predictable and bad: hundreds of CI failures, blocked development, frustrated engineers who experience linting as an obstacle rather than a tool, and often a revert to "lint is just warnings now." The linting investment pays no dividend, and it's harder to re-introduce later.

The best way is a phased rollout that produces visible wins early, gives engineers time to internalize new patterns, and never blocks development for long. [40][41][42]

**Phase 0: Pre-work (1 day)**

Before touching any config, run a complete audit. Install the new config in report-only mode and generate metrics:

```bash
# Clone the config, set all rules to warn for the audit
ESLINT_NO_FAIL_ON_WARN=1 eslint src/ --format json > lint-audit.json

# Parse the output to count violations per rule
node -e "
  const data = require('./lint-audit.json');
  const counts = {};
  data.forEach(file => file.messages.forEach(msg => {
    counts[msg.ruleId] = (counts[msg.ruleId] ?? 0) + 1;
  }));
  Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .forEach(([rule, count]) => console.log(count.toString().padStart(6), rule));
" | head -40
```

The output gives you:
- Total violation count (the scope of work)
- Distribution by rule (which rules need the most fixes)
- Zero-violation rules (promote to `error` immediately)
- High-violation rules (plan for gradual cleanup)

**Phase 1: Zero-violation rules to `error` (Week 1–2)**

Every rule with zero existing violations should be promoted to `error` immediately. This captures all new violations without any cleanup work. Start getting value from day one.

Common zero-violation rules in a TypeScript codebase that wasn't previously using FP/strict config:
- `@typescript-eslint/consistent-type-imports` — if the codebase was previously using a TS compiler with `verbatimModuleSyntax`
- `unicorn/prefer-node-protocol` — if the codebase uses only modern Node.js imports
- `import-x/no-cycle` — if the architecture was well-designed from the start
- `sonarjs/prefer-single-boolean-return` — if the team already writes clean boolean returns

**Phase 2: Autofixable rules (Week 2–3)**

Many ESLint rules can auto-fix violations. Run with `--fix` to mechanically eliminate violations:

```bash
# Run with fix for specific rules to clean them up mechanically
npx eslint --fix \
  --rule '{"@typescript-eslint/consistent-type-imports": "error"}' \
  --rule '{"@typescript-eslint/prefer-optional-chain": "error"}' \
  --rule '{"@typescript-eslint/prefer-nullish-coalescing": "error"}' \
  --rule '{"unicorn/no-for-loop": "error"}' \
  --rule '{"unicorn/prefer-includes": "error"}' \
  src/
```

Autofixers for key rules:
- `@typescript-eslint/consistent-type-imports` — adds `type` keyword to type-only imports
- `@typescript-eslint/prefer-optional-chain` — converts `a && a.b && a.b.c` to `a?.b?.c`
- `@typescript-eslint/prefer-nullish-coalescing` — converts `a || b` to `a ?? b` where appropriate
- `unicorn/no-for-loop` — converts indexed `for` loops to `for-of`
- `unicorn/prefer-includes` — converts `.indexOf(x) !== -1` to `.includes(x)`
- `@typescript-eslint/no-unnecessary-type-assertion` — removes redundant `as` casts

After autofixing, commit with a message like: "chore: apply eslint autofix for consistent-type-imports, prefer-optional-chain" and promote those rules to `error`.

**Phase 3: Low-violation rules — fix and promote (Sprint 1–3)**

For rules with 10–100 violations, allocate dedicated cleanup time in each sprint. The goal is to reach zero violations and promote to `error`. Track progress:

```typescript
// A simple sprint tracking comment in the config
// Target: @typescript-eslint/no-explicit-any: "error"
// Current violations: 23 (down from 47 last sprint)
// Owner: @alice
'@typescript-eslint/no-explicit-any': 'warn',
```

When violations reach zero, change `warn` to `error` in the same PR as the last fix — they belong together.

**Phase 4: High-violation rules — ratchet pattern (Months 1–3)**

For rules with hundreds or thousands of violations, use the `--max-warnings` ratchet. Set the initial `maxWarnings` to the current violation count. Reduce by 10% each sprint. CI fails only if the count increases:

```bash
# Start at current count (let's say 340 violations for a rule)
npx eslint --max-warnings 340 src/

# Next sprint: reduce by ~10%
npx eslint --max-warnings 310 src/

# After 3 months, at zero:
npx eslint --max-warnings 0 src/
# Promote rule to error
```

The ratchet prevents regression (no new violations allowed) while not blocking development (existing violations are tolerated temporarily). It makes progress visible and measurable. Teams respond well to a declining number — it shows momentum.

**Phase 5: The long tail**

Some rules will have a persistent tail of violations that are legitimate exceptions: `@typescript-eslint/no-explicit-any` in third-party API integrations where the API returns untyped data, `functional/immutable-data` in test setup fixtures, `import-x/no-default-export` in Next.js pages.

For these, use targeted, documented `eslint-disable-next-line` with an explanation. Track the disable comment count as a metric (should be stable or declining) and schedule quarterly reviews to evaluate whether any can be removed.

## 9.2 CI Integration

**ESLint in the CI pipeline:**

ESLint should run in CI at the same level as type checking — before tests, because it's faster. A pipeline that doesn't run linting is not enforcing the standards it claims to have.

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - run: npm ci

      # Type checking first (fast; catches compilation errors)
      - name: Type check
        run: npx tsc --noEmit

      # Linting second (catches code quality issues)
      - name: Lint
        run: npx eslint --max-warnings 0 --cache src/

      # Tests last (slowest; most expensive)
      - name: Test
        run: npm test

      # Optional: lint warning count as a metric
      - name: Count eslint-disable comments
        run: |
          COUNT=$(grep -r 'eslint-disable' src/ --include='*.ts' --include='*.tsx' | wc -l)
          echo "::notice title=eslint-disable count::${COUNT} disable comments"
          if [ "$COUNT" -gt 50 ]; then
            echo "::warning title=Disable comment threshold::${COUNT} disable comments exceeds threshold of 50"
          fi
```

**ESLint caching:**

```bash
# --cache stores lint results; only re-lints changed files
npx eslint --cache --cache-location .eslintcache src/

# Commit the cache location to .gitignore
echo ".eslintcache" >> .gitignore
```

For large codebases, caching can reduce lint time from 30 seconds to 3 seconds on subsequent runs.

**Type-aware linting performance:**

Type-aware linting (required for `strictTypeChecked`) runs the TypeScript type checker as part of linting. In CI, optimize with:

```bash
# Build TypeScript incrementally before linting — shares the type checker work
npx tsc --build --incremental
npx eslint --cache src/
```

**Pre-commit hooks with lint-staged:**

```json
// .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"
npx lint-staged

// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix --max-warnings 0",
      "git add"
    ]
  }
}
```

Pre-commit hooks run only on staged files — much faster than running over the entire codebase. The `--fix` flag auto-fixes what it can before committing; remaining violations block the commit with clear error messages.

## 9.3 Managing eslint-disable Comments as Technical Debt

`eslint-disable` comments are the pressure relief valve of a linting system. They exist because real code sometimes has legitimate reasons to deviate from a rule — interacting with legacy APIs, third-party libraries with bad types, or deliberate engineering decisions.

They become technical debt when: they are used to avoid fixing the underlying problem, they accumulate unchecked, or they suppress rules without explanation.

**The governance framework for disable comments:**

**Rule 1: Never bare `eslint-disable`.**

```typescript
// ❌ Forbidden: disables all rules on this line
// eslint-disable-next-line

// ❌ Forbidden: disables all rules in this block
/* eslint-disable */

// ✅ Required: targeted single-rule disable
// eslint-disable-next-line @typescript-eslint/no-explicit-any
```

The `unicorn/no-abusive-eslint-disable` rule enforces this mechanically.

**Rule 2: Every disable must have a reason.**

```typescript
// ❌ Disable without explanation
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const config: any = loadConfig();

// ✅ Disable with explanation
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- loadConfig() returns untyped JSON from legacy system; typed after validation below
const config: any = loadConfig();
const typedConfig = ConfigSchema.parse(config);
```

The comment should answer: why is this exception legitimate, and what is being done about it? If there's a GitHub issue for the eventual fix, link it: `-- TODO #1234: migrate legacy config to typed schema`.

**Rule 3: Track disable comment count as a CI metric.**

A growing disable count means one of two things: (1) rules are being circumvented, which is a code quality problem; or (2) rules are too aggressive for the codebase, which means the config needs tuning.

```bash
# In CI: count and report disable comments
DISABLE_COUNT=$(grep -rn 'eslint-disable' src/ --include='*.ts' --include='*.tsx' | wc -l | tr -d ' ')
echo "ESLint disable comments: ${DISABLE_COUNT}"

# Optional: fail if count exceeds threshold
if [ "${DISABLE_COUNT}" -gt "${MAX_DISABLE_COUNT:-50}" ]; then
  echo "Error: disable comment count ${DISABLE_COUNT} exceeds limit ${MAX_DISABLE_COUNT}"
  exit 1
fi
```

**Rule 4: Quarterly disable review.**

Schedule a 30-minute quarterly review to go through all `eslint-disable` comments and ask:
- Is this still necessary? (Sometimes the underlying code was fixed but the disable wasn't removed)
- Is there a better solution? (Now that we understand the pattern, could we fix this properly?)
- Should this exception be codified in the config? (If a rule consistently needs to be disabled for test files, add a config override instead of individual disables)

**Handling brownfield suppressions at scale:**

For large existing codebases with hundreds of violations that need to be suppressed initially (to introduce a new rule without a massive cleanup sprint), `@rushstack/eslint-bulk-suppressions` provides a structured approach:

```bash
# Generate a suppression file for existing violations
npx @rushstack/eslint-bulk-suppressions --suppress-rule @typescript-eslint/no-explicit-any src/

# This creates .eslint-bulk-suppressions.json with all existing violations
# New code must comply with the rule; existing code is suppressed

# Over time, entries are removed from the suppression file as the code is fixed
```

This is cleaner than hundreds of individual `eslint-disable` comments scattered through files, and it makes the scope of the suppression explicit in a single file.

## 9.4 Plugin Versioning and Update Cadence

ESLint plugins are not immune to breaking changes. Plugin major versions may: add new rules to configurations that previously had none, change the behavior of existing rules, rename or remove rules, or change the severity of rules in named presets.

**Version pinning strategy:**

The `eslint-dockerized` Dockerfile already pins exact versions, which is correct. The rationale: "latest" in a Docker build is non-deterministic and produces irreproducible results. Exact versions ensure every run of the Docker container uses identical linting rules.

```dockerfile
# ✅ Exact version pinning
eslint-plugin-unicorn@57.0.0 \
eslint-plugin-sonarjs@3.0.2 \
```

**The update process:**

1. **Check changelogs** before updating. Every ESLint plugin has a CHANGELOG.md or GitHub releases page. Look specifically for:
   - New rules added to `recommended` or `all` configs
   - Rules with changed behavior (severity changes, new edge cases caught)
   - Deprecated rules that you rely on
   - Bug fixes for rules you depend on

2. **Update in a dedicated branch.** Create a branch specifically for the plugin update. Run the full lint suite and review all new violations:
   ```bash
   git checkout -b chore/update-eslint-plugins
   # Update versions in Dockerfile
   docker build -t eslint-test .
   docker run --rm -v $(pwd):/data eslint-test -c /config/eslint.config.ts src/ 2>&1 | tee update-report.txt
   wc -l update-report.txt
   ```

3. **Categorize new violations.** New violations from a plugin update fall into:
   - Genuine bugs caught by improved rules → fix them
   - Rules added to a preset that conflict with your code style → add targeted `off` overrides
   - Performance rules that apply to code you control → fix them or add `warn`

4. **Update one plugin family at a time.** Don't update `typescript-eslint`, `eslint-plugin-unicorn`, and `eslint-plugin-sonarjs` in the same PR. Mixing updates makes it impossible to attribute new violations to specific plugins.

**`typescript-eslint` and TypeScript version alignment:**

`typescript-eslint` parses TypeScript using the TypeScript compiler's AST. When TypeScript changes its AST (happens in minor and patch versions), the parser may need to be updated. The `typescript-eslint` releases track TypeScript releases closely.

Always update `typescript` and `typescript-eslint` in the same PR. Check the `typescript-eslint` compatibility matrix before updating TypeScript:

```
https://typescript-eslint.io/developers/versions/
```

**Recommended cadence:**

| Update type | Frequency | Notes |
|---|---|---|
| Security patches | Immediate | Check GitHub security advisories weekly |
| Patch versions | Monthly | Review changelog, update if fixes relevant bugs |
| Minor versions | Quarterly | Scheduled review sprint; may add new rules |
| Major versions | Annually | Plan a dedicated migration sprint |
| TypeScript version | With each TypeScript release | Always pair with typescript-eslint |

## 9.5 Building Team Buy-in: Principles Before Rules

The technical work of configuring ESLint is straightforward. The organizational work of getting a team to genuinely adopt strict linting is hard.

The most common failure mode: a Staff engineer adds a new config unilaterally, other engineers add `eslint-disable` comments to everything that blocks them, the disable count reaches 200, and the "strict" config is effectively hollow. The config file says `error`; the codebase says `any`.

**The principles-first approach:**

Before presenting any configuration, establish agreement on the *principles* that the rules enforce. Every `error`-severity rule in the proposed config maps to one of these principles:

| Principle | Rules that enforce it |
|---|---|
| Handle all Promises | `no-floating-promises`, `no-misused-promises`, `await-thenable`, `promise/catch-or-return` |
| No implicit `any` | `no-explicit-any`, `no-unsafe-*` family |
| Immutable by default | `functional/immutable-data`, `functional/no-let` |
| Invalid states unrepresentable | `switch-exhaustiveness-check`, discriminated union patterns |
| Module boundaries are architecture | `import-x/no-cycle`, `no-restricted-imports` per layer |
| All UI is accessible | All `jsx-a11y` rules |

Present the principles first. Show the bug each principle prevents. Get agreement on the principle. Then present the rules as the *mechanism* for enforcing the agreed principle. People accept rules they understand; they circumvent rules they don't.

**The "bug museum" technique:**

Before the principle/rule discussion, build a brief "bug museum" from your own codebase: five real production bugs or pre-production incidents that each rule would have caught. This is the most persuasive argument possible. "We had an incident in March where a Promise wasn't awaited and a payment was silently discarded. `no-floating-promises` would have caught this at lint time, before the code was deployed."

Production incidents have names and stories. Rules are abstract. The connection between them is what makes rules feel worth enforcing.

**The shared ownership model:**

When the config is "the Staff engineer's config," every friction point becomes a reason to push back. When the config is "the team's coding standard," friction points become team discussions about improving the standard.

Mechanisms for shared ownership:
- **Config review session** before finalizing — every team member can challenge any rule with a rationale. The team votes on contested rules. Majority wins.
- **Quarterly config review** — any team member can propose adding or removing rules. Proposals need a rationale (what problem does this solve? or what false-positive does this eliminate?). The team reviews proposals together.
- **Rule ownership rotation** — assign each plugin to a team member who is responsible for staying current on its changelog, proposing updates, and answering questions about it.

**Handling the "this is slowing me down" objection:**

This is the most common objection to strict linting, and it deserves a real answer rather than dismissal. Strict linting does slow you down in two scenarios:

1. *Learning new patterns* — this friction is intentional and temporary. The rule is teaching you a pattern. Once internalized, there's no friction.

2. *Dealing with false positives or excessive rules* — this friction is a signal the config needs tuning. The right response is to tune the rule, not to bypass it.

For scenario 1, the resolution is patience and documentation. Pair the error message with the section of this document that explains why the rule exists and what the correct pattern is.

For scenario 2, the resolution is to bring the false-positive example to the team config review and either tune the rule or document that it's intentional.

## 9.6 Measuring Impact: Metrics That Indicate Quality Improvement

Linting is an investment. Like any investment, you want to measure whether it's generating returns. The challenge: the returns are largely negative (bugs that didn't happen), which are inherently invisible.

**Direct linting metrics:**

*`eslint-disable` comment count* — the simplest proxy for "are we enforcing the rules?" Measure at every CI run. Plot the trend. A stable or declining count means the rules are being honored. A growing count means enforcement is being bypassed.

```bash
# A bash function for the CI script
count_disable_comments() {
  grep -rn 'eslint-disable' src/ --include='*.ts' --include='*.tsx' | wc -l | tr -d ' '
}
```

*Lint error count over time* — if you're running in phased adoption mode with `--max-warnings`, track the warning count over time. A declining count means the team is consistently fixing violations. A stagnant count means the ratchet isn't being moved.

*Time to fix per rule* — for high-violation rules during the fix-and-promote phase, track how many engineer-hours it takes to fix violations of each rule. This data informs future estimates for new rule adoption and identifies rules that are harder to fix than expected.

**Code quality proxy metrics:**

*`any` type count* — count occurrences of `: any`, `as any`, and `<any>` in the codebase. This is a direct measure of how much of the type system is being bypassed:

```bash
grep -rn ': any\|as any\|<any>' src/ --include='*.ts' --include='*.tsx' | wc -l
```

Track this weekly. It should trend toward zero with `no-explicit-any: error` in place.

*Floating Promise count before/after* — find `await` usage patterns where a function returns a Promise but the call doesn't await it. This is typically caught by `no-floating-promises`, but measuring the existing count before enforcement started and tracking it after shows the rule's impact.

*Cognitive complexity histogram* — extract the cognitive complexity metric for every function and plot a histogram. With `sonarjs/cognitive-complexity: ['error', 15]` enforced, no function should exceed 15. The histogram before enforcement shows the starting state; the histogram after enforcement shows the improvement.

**Outcome metrics (the real measure):**

*Production incident rate for linting-relevant bug classes* — categorize production incidents by type. The types that linting addresses: unhandled Promises, type mismatch errors, null/undefined access, stale closure bugs in React, accessibility regressions. Track the incident rate for these categories before and after linting enforcement.

This data is often already available in your incident management system (PagerDuty, OpsGenie, Jira). Tag incidents that would have been prevented by a specific ESLint rule. After 6 months of enforcement, the comparison is compelling.

*Code review comment reduction* — track how many code review comments are style/quality related vs. logic/architecture related. Linting should transfer style and type safety enforcement from code review (human time) to automated tooling. Over time, a well-configured linting suite should reduce code review time by eliminating a class of recurring feedback.

*Onboarding time for new engineers* — how long does it take a new team member to make their first commit that passes all checks? A codebase with consistent, enforced patterns and clear error messages from linting is faster to learn than one where everything is possible and nothing is consistent.

**The reporting structure:**

Monthly engineering review metrics dashboard:
- ESLint disable comment count (trend)
- `any` type count (trend)
- Lint rule violation count in PRs (distribution)
- Open items in the linting backlog (rules approved but not yet enforced)

Quarterly review agenda:
- Review the metrics trends
- Evaluate new rules from plugin changelogs
- Process any pending rule proposals from the team
- Retire rules that have become obsolete or that produce too many false positives
- Update plugin versions


---

# 10. Conclusion

## 10.1 The Compounding Returns of Strict Typing and Linting

Clean TypeScript code is not a cost — it is a compounding investment. The time spent establishing strict types, enforcing immutability, and configuring exhaustive linting pays back in every subsequent sprint, with interest.

The returns compound because each layer reinforces the others. Strict compiler settings (`strict: true`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`) catch errors before linting even runs. Type-aware linting (`strictTypeChecked`) catches errors that the compiler alone would miss — unhandled Promises, `any` propagation, template literal misuse, switch statements that miss new union members. Functional discipline rules catch mutation and let-variable bugs that type checking doesn't address. Import discipline rules prevent the architectural drift that makes large codebases unmaintainable over time. Code quality rules surface designs that are technically correct but cognitively opaque.

The compounding effect is most visible after 12–18 months of enforcement. In the first month, the rules feel like friction. By month six, the team has internalized the patterns and the rules are invisible — the compiler and linter catch things before a PR is even created. By month eighteen, new engineers onboard faster because the codebase is consistent, code review comments shift from style to substance, and production incident rates for the bug classes that linting addresses decline measurably.

The corollary is also true: the cost of not investing compounds in the other direction. Each `any` that's added to a codebase today produces three more `any`s next month as other code integrates with it. Each floating Promise that's not caught produces one production incident on average per 6 months in a medium-sized codebase. Each function with cognitive complexity 40 produces 8 hours of onboarding friction for every engineer who must read it.

The mathematics of technical debt are unforgiving, and TypeScript's unique power is that it lets you prevent the most expensive classes of debt at compile time, before they accumulate.

## 10.1.1 The Cost of Not Investing

The corollary of compounding returns is worth making explicit: the cost of not investing in TypeScript clean code practices also compounds.

Every `any` added today produces three more `any`s next month as other code integrates with it and makes the same assumption. Every floating Promise that goes unhandled produces, on average, one production incident every six months in a medium-sized codebase — a number that grows as the codebase does. Every function with cognitive complexity 40 produces 8 hours of onboarding friction for every engineer who must understand it, every time.

Technical debt in TypeScript codebases has a specific character: it accumulates at type boundaries. When a module's public API is loosely typed, every consumer of that API writes defensive code to protect against the unknown. When the defensive code is also loosely typed, the problem propagates downstream. A single `any`-typed API endpoint can produce defensive checks in dozens of React components that all need to guard against the same possible nulls and misshapes.

The discipline in this guide — strict types, immutability, pure functions, clean module boundaries — prevents this propagation. It is not primarily about code elegance, though the code is better-looking. It is about preventing the compounding technical debt that makes large TypeScript codebases progressively harder to extend and maintain.

## 10.1.2 The ROI Calculation

For teams evaluating whether to invest in strict TypeScript practices, the ROI calculation is straightforward:

**Investment:** One sprint of initial cleanup + 10% overhead in development as engineers learn new patterns (lasting 1–2 months) + quarterly config reviews (4 hours per quarter)

**Return:** For a team of 5 engineers working on a codebase with 50K LOC over 12 months:
- ~3 production incidents prevented (unhandled Promises, null dereferences, type mismatches): saves 8–16 hours each → **24–48 hours saved**
- ~20% reduction in code review time on type/safety comments: at 30 min/week × 5 engineers → **130 hours saved per year**
- 25% faster onboarding for new engineers (consistent patterns, self-documenting types): 2 weeks saved per hire → **varies by team turnover**
- Test suite reliability improvement (pure functions are deterministic): fewer flaky tests, fewer debugging sessions → **40–80 hours saved per year**

Total conservative estimate: **200–250 engineer-hours saved per year** for a 5-person team. The initial investment is typically 40–80 hours. ROI is positive within 2–3 months for most teams.

## 10.2 What We Covered

This guide moved through five interconnected areas, each building on the previous:

**The clean code philosophy (Section 2)** established that TypeScript changes the clean code contract fundamentally. Types are documentation. The compiler is a collaborator. `any` is a broken promise. And the single most impactful practice — parse, don't validate — eliminates defensive programming from the entire domain layer when applied consistently.

**Functional programming (Section 3)** made the case for a pragmatic FP-first default: immutability by default, pure functions preferred, classes for lifecycle-aware objects and framework integration. The fp-ts → Effect transition was documented, and `eslint-plugin-functional`'s rule hierarchy was analyzed so teams can choose the appropriate level of enforcement.

**Type system mastery (Section 4)** showed how TypeScript's type system is a design tool, not just an annotation system. Discriminated unions make invalid states unrepresentable. Branded types prevent domain semantic confusion. The `satisfies` operator resolves the tension between validation and type specificity. Template literal types and conditional types enable API designs that encode business rules at the type level.

**Modularization and architecture (Section 5)** addressed the structural questions: feature-based layouts over technical-role layouts, Clean Architecture layers in TypeScript, the barrel file problem and its solution, TypeScript `paths` for stable imports, and circular dependency prevention.

**React functional patterns (Section 6)** covered modern React: drop `React.FC`, use discriminated union props, single-responsibility custom hooks, server state vs. local state, composition patterns, effect discipline, and `jsx-a11y` for accessibility.

**The ESLint ecosystem (Section 7)** provided a detailed analysis of the flat config system, the current repo configuration's strengths and gaps, and a rule-by-rule explanation of every plugin in the proposed config.

**The proposed configuration (Section 8)** delivered the concrete artifact: a complete, production-ready `eslint.config.ts` with four new plugins (`unicorn`, `sonarjs`, `import-x`, `eslint-import-resolver-typescript`), a rationale for switching from `eslint.configs.all` to `eslint.configs.recommended`, and a changelog of every change from the existing config.

**Team adoption and governance (Section 9)** provided the change management playbook: the phased adoption strategy, CI integration, `eslint-disable` comment governance, plugin update cadence, the principles-before-rules buy-in approach, and the metrics that show linting is generating real quality returns.

## 10.3 The Pragmatic Path Forward

This guide has been consistently opinionated but not dogmatic. Every recommendation came with a rationale, and every rule has an acknowledged exception where a team's specific context might warrant a different choice.

The positions taken are grounded in the 2024–2025 TypeScript community consensus, documented production experience, and the measurable properties of functional, strictly-typed TypeScript code. They are not arbitrary preferences.

**For teams starting fresh:** Apply this guide in full. The proposed ESLint config is production-ready. Enable strict mode in tsconfig from day one. Build the feature-based module layout from the first sprint. The pain of these choices is minimal when starting fresh and maximal when retrofitting.

**For teams with existing codebases:** Use the phased adoption strategy. Identify your highest-priority principles (usually: handle all Promises, eliminate `any`, and prevent circular imports) and enforce those first. Add other rules as the team's capacity allows. Maintain momentum by showing measurable progress.

**For teams evaluating specific rules:** Every rule in the proposed config is there because it prevents a class of bugs or enforces a pattern that reduces cognitive load. Challenge any rule you don't understand — but challenge it by asking "what bug does this prevent?" rather than "this makes my life harder." The answer to the first question will usually resolve the second.

**What matters most is consistency.** A team that agrees on a modest ruleset and enforces it uniformly produces better software than a team that has a maximally strict config but routinely suppresses it. Start where your team is. Raise the bar each quarter. Enforce what you agree on.

## 10.3.1 What to Do Monday Morning

For engineers who want to act on this guide immediately:

**If you have 30 minutes:** Add `noUncheckedIndexedAccess: true` and `exactOptionalPropertyTypes: true` to your `tsconfig.json`. Run `tsc --noEmit`. Fix the violations. These settings catch index-out-of-bounds and optional property confusion bugs that `strict` mode misses. Fix time: 30–90 minutes. Protection: permanent.

**If you have half a day:** Add `@typescript-eslint/no-floating-promises: 'error'` to your ESLint config. Run the linter. Every floating Promise in your codebase surfaces. Fix each one — each fix prevents a potential production incident. The bugs exist already; this makes them visible before they bite you.

**If you have a sprint:** Follow Section 9.1's phased adoption. Run the full proposed config in warn-only mode, categorize violations by rule, promote zero-violation rules to `error`, and schedule fixes for the rest. Begin measuring the `eslint-disable` comment count as a CI metric.

**If you have a quarter:** Conduct a full migration to the proposed `eslint.config.ts`. Run workshops on the FP patterns that `functional/immutable-data` and `functional/no-let` enforce. Review the feature-based module layout and begin migrating the most-changed features to it. Track `any` type count and cognitive complexity distribution as quality metrics.

The TypeScript ecosystem in 2025 gives us better tools for code quality than have ever existed in JavaScript's history: a sophisticated structural type system with literal types, discriminated unions, and template literal types; a mature linting ecosystem with type-aware rules that understand the semantics of async code and domain models; and a community that has accumulated years of hard-won production wisdom. These tools are available to every team. Use them.

---

## References

| # | Title | URL | Perspective |
|---|---|---|---|
| 1 | TypeScript Best Practices in 2025 | https://dev.to/mitu_mariam/typescript-best-practices-in-2025-57hb | General |
| 2 | Best Practices for Clean Code in 2025 | https://www.patrickthomas.partners/blog/best-practices-for-clean-code-2025 | General |
| 3 | Effective TypeScript Principles in 2025 | https://blog.dennisokeeffe.com/blog/2025-03-16-effective-typescript-principles-in-2025 | General |
| 4 | TypeScript Best Practices for 2025 (Apil Raj Acharya) | https://www.apilacharya.com.np/blogs/typescript-best-practices | General |
| 5 | TypeScript Functional Programming Overview & Best Practices | https://svitla.com/blog/functional-programming-in-typescript/ | Functional Programming |
| 6 | fp-ts GitHub — joining the Effect-TS Ecosystem | https://github.com/gcanti/fp-ts | Functional Programming |
| 7 | Effect vs fp-ts (Effect Documentation) | https://effect.website/docs/additional-resources/effect-vs-fp-ts/ | Functional Programming |
| 8 | Exploring Effect in TypeScript (Tweag) | https://tweag.io/blog/2024-11-07-typescript-effect/ | Functional Programming |
| 9 | Practical Guide to fp-ts — fp-ts is dead, use Effect | https://rlee.dev/practical-guide-to-fp-ts-part-1 | Functional Programming |
| 10 | eslint-plugin-functional GitHub README | https://github.com/eslint-functional/eslint-plugin-functional | Functional Programming |
| 11 | eslint-plugin-functional prefer-immutable-types rule docs | https://github.com/eslint-functional/eslint-plugin-functional/blob/main/docs/rules/prefer-immutable-types.md | Functional Programming |
| 12 | Migrating from tslint-immutable to eslint-plugin-functional | https://github.com/eslint-functional/eslint-plugin-functional/blob/main/docs/user-guide/migrating-from-tslint.md | Functional Programming |
| 13 | Please Stop Using Barrel Files (TkDodo) | https://tkdodo.eu/blog/please-stop-using-barrel-files | Modularization |
| 14 | A practical guide against barrel files for library authors | https://dev.to/thepassle/a-practical-guide-against-barrel-files-for-library-authors-118c | Modularization |
| 15 | A Well-Designed JavaScript Module System is Your First Architecture Decision (CSS-Tricks) | https://css-tricks.com/the-javascript-module-system-architecture/ | Modularization |
| 16 | TypeScript Circular Dependencies: Breaking Import Cycles | https://mohammadshaker.com/en/tech/spatialx-frontend-explore-05-typescript-circular-dependencies | Modularization |
| 17 | eslint-plugin-import no-cycle rule docs | https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-cycle.md | Modularization |
| 18 | Advanced TypeScript Patterns: Branded Types, Discriminated Unions, and Exhaustive Checks | https://dev.to/whoffagents/advanced-typescript-patterns-branded-types-discriminated-unions-and-exhaustive-checks-3go5 | Type System |
| 19 | Understanding TypeScript's satisfies Operator (BetterStack) | https://betterstack.com/community/guides/scaling-nodejs/satisfies-operator/ | Type System |
| 20 | Advanced TypeScript Patterns: Discriminated Unions, Branded Types, Type Predicates (Viprasol) | https://viprasol.com/blog/typescript-patterns/ | Type System |
| 21 | Discriminated Union (TypeScript Guide by Convex) | https://www.convex.dev/typescript/advanced/type-operators-manipulation/typescript-discriminated-union | Type System |
| 22 | Discriminated Unions and Exhaustiveness Checking in TypeScript (FullStory) | https://www.fullstory.com/blog/discriminated-unions-and-exhaustiveness-checking-in-typescript/ | Type System |
| 23 | Advanced TypeScript for React developers — Discriminated Unions (Developer Way) | https://www.developerway.com/posts/advanced-typescript-for-react-developers-discriminated-unions | Type System |
| 24 | React Hooks, TypeScript 2026: Patterns That Actually Scale | https://shubhamjha.com/blog/react-hooks-typescript | React Patterns |
| 25 | Best React Design Patterns 2024-25 | https://www.perfectiongeeks.com/best-react-design-patterns | React Patterns |
| 26 | Advanced React Hooks Patterns & Best Practices | https://www.angularminds.com/blog/advanced-react-hooks-patterns-and-best-practices | React Patterns |
| 27 | React with TypeScript: Best Practices (SitePoint) | https://www.sitepoint.com/react-with-typescript-best-practices/ | React Patterns |
| 28 | React Design Patterns and Best Practices for 2025 (Telerik) | https://www.telerik.com/blogs/react-design-patterns-best-practices | React Patterns |
| 29 | React Anti-Patterns and Best Practices (Persson Dennis) | https://www.perssondennis.com/articles/react-anti-patterns-and-best-practices-dos-and-donts | React Patterns |
| 30 | 21 Fantastic React Design Patterns and When to Use Them | https://www.perssondennis.com/articles/21-fantastic-react-design-patterns-and-when-to-use-them | React Patterns |
| 31 | ESLint 9 Flat Config Tutorial | https://dev.to/aolyang/eslint-9-flat-config-tutorial-2bm5 | ESLint Ecosystem |
| 32 | Evolving flat config with extends (ESLint official blog) | https://eslint.org/blog/2025/03/flat-config-extends-define-config-global-ignores/ | ESLint Ecosystem |
| 33 | typescript-eslint packages (typescript-eslint.io) | https://typescript-eslint.io/packages/typescript-eslint | ESLint Ecosystem |
| 34 | Linting with Type Information (typescript-eslint.io) | https://typescript-eslint.io/getting-started/typed-linting/ | ESLint Ecosystem |
| 35 | Announcing typescript-eslint v8 | https://typescript-eslint.io/blog/announcing-typescript-eslint-v8 | ESLint Ecosystem |
| 36 | eslint-plugin-sonarjs npm page | https://www.npmjs.com/package/eslint-plugin-sonarjs | ESLint Ecosystem |
| 37 | Improving development productivity: unified ESLint configuration (Quadcode) | https://medium.com/quadcode-life/improving-development-productivity-the-magic-of-a-unified-eslint-configuration-e32aa71b063b | ESLint Ecosystem |
| 38 | Consistent Type Imports and Exports: Why and How (typescript-eslint blog) | https://typescript-eslint.io/blog/consistent-type-imports-and-exports-why-and-how/ | ESLint Ecosystem |
| 39 | Replacements for eslint-plugin-import (e18e.dev) | https://e18e.dev/docs/replacements/eslint-plugin-import/ | ESLint Ecosystem |
| 40 | How to Set Up ESLint in Existing TypeScript Project | https://haricnugraha.com/posts/2023-10-02-eslint-typescript/ | Team Standards |
| 41 | My favorite ESLint setup (Thomas Dekiere) | https://medium.com/@t.dekiere/my-favorite-eslint-setup-9d63ab4de470 | Team Standards |
| 42 | ESLint adoption guide: Overview, examples, and alternatives (LogRocket) | https://blog.logrocket.com/eslint-adoption-guide/ | Team Standards |


---

# 11. Testing TypeScript: Discipline and Patterns

## 11.1 Why TypeScript Changes Testing

TypeScript doesn't just change how you write production code — it changes your relationship with testing. In JavaScript, tests are the primary mechanism for catching type-related bugs: you write a test that passes a string where a number is expected, and the test tells you the function doesn't handle it. In TypeScript, the compiler catches that at write time, before the test even runs.

This has a profound implication: **TypeScript tests should focus on business logic and behavior, not on type safety.** The type system handles type safety. Tests handle correctness of the business logic given valid, type-safe inputs.

The second implication: **pure functions require the least test overhead.** A pure function is a direct mapping from inputs to outputs. Testing it is: `expect(fn(input)).toEqual(expectedOutput)`. No setup, no mocks, no state. The more functional your code, the faster and more robust your tests.

## 11.2 Testing Pure Functions

Pure functions are the easiest possible thing to test. The test structure is always:

1. Arrange: construct the input
2. Act: call the function
3. Assert: verify the output

No mocking, no database, no HTTP, no setup, no teardown.

```typescript
// The function being tested
const calculateOrderTotal = (
  items: ReadonlyArray<{ readonly price: number; readonly quantity: number }>,
  discountPercent: number
): number => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = subtotal * (discountPercent / 100);
  return subtotal - discount;
};

// The tests
describe('calculateOrderTotal', () => {
  it('calculates subtotal for single item', () => {
    const items = [{ price: 10, quantity: 3 }];
    expect(calculateOrderTotal(items, 0)).toBe(30);
  });

  it('calculates subtotal for multiple items', () => {
    const items = [
      { price: 10, quantity: 2 },
      { price: 5, quantity: 4 },
    ];
    expect(calculateOrderTotal(items, 0)).toBe(40);
  });

  it('applies discount correctly', () => {
    const items = [{ price: 100, quantity: 1 }];
    expect(calculateOrderTotal(items, 20)).toBe(80);
  });

  it('returns 0 for empty order', () => {
    expect(calculateOrderTotal([], 0)).toBe(0);
  });

  it('handles 100% discount', () => {
    const items = [{ price: 50, quantity: 2 }];
    expect(calculateOrderTotal(items, 100)).toBe(0);
  });
});
```

Each test is a sentence: "calculateOrderTotal calculates subtotal for single item." The test name describes the behavior, not the implementation. The test body is 2–4 lines. There is nothing to mock and nothing to clean up.

**Testing discriminated union handlers:**

```typescript
type Result<T, E = Error> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

const formatResult = <T>(result: Result<T>): string =>
  result.ok ? `Success: ${JSON.stringify(result.value)}` : `Error: ${result.error.message}`;

describe('formatResult', () => {
  it('formats successful result', () => {
    const result: Result<number> = { ok: true, value: 42 };
    expect(formatResult(result)).toBe('Success: 42');
  });

  it('formats error result', () => {
    const result: Result<number> = { ok: false, error: new Error('Not found') };
    expect(formatResult(result)).toBe('Error: Not found');
  });
});
```

**Testing with property-based testing for pure functions:**

Property-based testing (fast-check, quickcheck) is particularly powerful for pure functions because the property specification generalizes all individual test cases:

```typescript
import fc from 'fast-check';

describe('calculateOrderTotal — properties', () => {
  it('total is always non-negative', () => {
    fc.assert(fc.property(
      fc.array(fc.record({ price: fc.float({ min: 0 }), quantity: fc.integer({ min: 0, max: 100 }) })),
      fc.integer({ min: 0, max: 100 }),
      (items, discount) => {
        expect(calculateOrderTotal(items, discount)).toBeGreaterThanOrEqual(0);
      }
    ));
  });

  it('zero discount equals full subtotal', () => {
    fc.assert(fc.property(
      fc.array(fc.record({ price: fc.float({ min: 0 }), quantity: fc.integer({ min: 0 }) })),
      (items) => {
        const total = calculateOrderTotal(items, 0);
        const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
        expect(Math.abs(total - subtotal)).toBeLessThan(0.001); // floating point tolerance
      }
    ));
  });
});
```

## 11.3 Testing with Type-Safe Mocks

When testing functions that have dependencies (database access, external APIs, file system), you need mocks. TypeScript makes mocking type-safe:

**Interface-based mocking (no framework needed):**

```typescript
// The dependency interface
interface UserRepository {
  readonly findById: (id: UserId) => Promise<User | null>;
  readonly save: (user: User) => Promise<void>;
  readonly delete: (id: UserId) => Promise<void>;
}

// The use case being tested
class GetUserUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(id: UserId): Promise<User | null> {
    return this.userRepo.findById(id);
  }
}

// Test: plain object satisfies the interface — no framework needed
describe('GetUserUseCase', () => {
  it('returns user when found', async () => {
    const mockUser: User = { id: userId('123'), name: 'Alice', email: 'alice@example.com', role: 'user' };
    const mockRepo: UserRepository = {
      findById: async (id) => id === userId('123') ? mockUser : null,
      save: async () => void 0,
      delete: async () => void 0,
    };

    const useCase = new GetUserUseCase(mockRepo);
    const result = await useCase.execute(userId('123'));

    expect(result).toEqual(mockUser);
  });

  it('returns null when user not found', async () => {
    const mockRepo: UserRepository = {
      findById: async () => null,
      save: async () => void 0,
      delete: async () => void 0,
    };

    const useCase = new GetUserUseCase(mockRepo);
    const result = await useCase.execute(userId('999'));

    expect(result).toBeNull();
  });
});
```

**Type-safe mock factories with `Partial` mocking:**

For complex interfaces, creating complete mocks is tedious. A type-safe factory pattern:

```typescript
// Factory that creates a mock with sensible defaults
const createMockUserRepo = (overrides: Partial<UserRepository> = {}): UserRepository => ({
  findById: async () => null,
  save: async () => void 0,
  delete: async () => void 0,
  ...overrides,
});

// Tests become concise
it('calls save when user is updated', async () => {
  const savedUsers: User[] = [];
  const repo = createMockUserRepo({
    findById: async () => ({ id: userId('1'), name: 'Alice', email: 'alice@example.com', role: 'user' }),
    save: async (user) => { savedUsers.push(user); },
  });

  const useCase = new UpdateUserNameUseCase(repo);
  await useCase.execute(userId('1'), 'Alicia');

  expect(savedUsers).toHaveLength(1);
  expect(savedUsers[0]?.name).toBe('Alicia');
});
```

**Using `vi.fn()` / `jest.fn()` with TypeScript typing:**

```typescript
import { vi } from 'vitest';

// Properly typed mock function
const mockFindById = vi.fn<[UserId], Promise<User | null>>();
mockFindById.mockResolvedValueOnce(testUser);

const repo: UserRepository = {
  findById: mockFindById,
  save: vi.fn<[User], Promise<void>>().mockResolvedValue(undefined),
  delete: vi.fn<[UserId], Promise<void>>().mockResolvedValue(undefined),
};

// Verify calls
expect(mockFindById).toHaveBeenCalledWith(userId('123'));
expect(mockFindById).toHaveBeenCalledTimes(1);
```

## 11.4 Testing React Components

React component testing focuses on behavior, not implementation. Test what users see and do — not internal state, not component instance methods, not implementation details.

**The Testing Library approach:**

```typescript
import { render, screen, userEvent } from '@testing-library/react';

// Component being tested
function SearchBar({ onSearch }: { onSearch: (query: string) => void }): React.ReactElement {
  const [query, setQuery] = useState('');

  return (
    <div>
      <input
        type="search"
        placeholder="Search..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        aria-label="Search query"
      />
      <button
        type="button"
        onClick={() => onSearch(query)}
      >
        Search
      </button>
    </div>
  );
}

// Tests: behavior-focused
describe('SearchBar', () => {
  it('calls onSearch with current query when Search is clicked', async () => {
    const user = userEvent.setup();
    const handleSearch = vi.fn<[string], void>();

    render(<SearchBar onSearch={handleSearch} />);

    await user.type(screen.getByRole('searchbox'), 'TypeScript tips');
    await user.click(screen.getByRole('button', { name: 'Search' }));

    expect(handleSearch).toHaveBeenCalledWith('TypeScript tips');
    expect(handleSearch).toHaveBeenCalledTimes(1);
  });

  it('calls onSearch with empty string when query is cleared', async () => {
    const user = userEvent.setup();
    const handleSearch = vi.fn<[string], void>();

    render(<SearchBar onSearch={handleSearch} />);

    await user.click(screen.getByRole('button', { name: 'Search' }));

    expect(handleSearch).toHaveBeenCalledWith('');
  });
});
```

**Testing custom hooks:**

Custom hooks are tested in isolation using `renderHook` from `@testing-library/react`:

```typescript
import { renderHook, act } from '@testing-library/react';

const useCounter = (initialValue: number = 0) => {
  const [count, setCount] = useState(initialValue);
  const increment = useCallback(() => setCount(c => c + 1), []);
  const decrement = useCallback(() => setCount(c => c - 1), []);
  const reset = useCallback(() => setCount(initialValue), [initialValue]);
  return { count, increment, decrement, reset };
};

describe('useCounter', () => {
  it('initializes with 0 by default', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it('initializes with provided value', () => {
    const { result } = renderHook(() => useCounter(10));
    expect(result.current.count).toBe(10);
  });

  it('increments count', () => {
    const { result } = renderHook(() => useCounter());
    act(() => { result.current.increment(); });
    expect(result.current.count).toBe(1);
  });

  it('decrements count', () => {
    const { result } = renderHook(() => useCounter(5));
    act(() => { result.current.decrement(); });
    expect(result.current.count).toBe(4);
  });

  it('resets to initial value', () => {
    const { result } = renderHook(() => useCounter(5));
    act(() => { result.current.increment(); result.current.increment(); });
    act(() => { result.current.reset(); });
    expect(result.current.count).toBe(5);
  });
});
```

## 11.5 Testing Discriminated Unions and Type Guards

TypeScript's type system provides compile-time guarantees, but some runtime checks — type guards, parsing, validation — still need tests:

**Testing type guard functions:**

```typescript
const isOrder = (value: unknown): value is Order => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof (value as Record<string, unknown>).id === 'string' &&
    'items' in value &&
    Array.isArray((value as Record<string, unknown>).items)
  );
};

describe('isOrder', () => {
  it('returns true for valid Order', () => {
    const order: Order = { id: 'ord-1', items: [], status: 'pending', total: money(0, 'USD') };
    expect(isOrder(order)).toBe(true);
  });

  it('returns false for null', () => {
    expect(isOrder(null)).toBe(false);
  });

  it('returns false for missing id', () => {
    expect(isOrder({ items: [] })).toBe(false);
  });

  it('returns false for non-array items', () => {
    expect(isOrder({ id: 'ord-1', items: 'not-array' })).toBe(false);
  });

  it('returns false for primitive values', () => {
    expect(isOrder(42)).toBe(false);
    expect(isOrder('string')).toBe(false);
    expect(isOrder(undefined)).toBe(false);
  });
});
```

**Testing exhaustiveness at runtime:**

```typescript
// Testing the assertNever pattern
const assertNever = (value: never): never => {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
};

const handleStatus = (status: 'active' | 'inactive' | 'deleted'): string => {
  switch (status) {
    case 'active': return 'Active';
    case 'inactive': return 'Inactive';
    case 'deleted': return 'Deleted';
    default: return assertNever(status);
  }
};

describe('handleStatus', () => {
  it('handles all known statuses', () => {
    expect(handleStatus('active')).toBe('Active');
    expect(handleStatus('inactive')).toBe('Inactive');
    expect(handleStatus('deleted')).toBe('Deleted');
  });

  it('throws for unknown status at runtime', () => {
    // Cast to bypass TypeScript's exhaustiveness check for testing runtime behavior
    expect(() => handleStatus('unknown' as never)).toThrow('Unexpected value');
  });
});
```

## 11.6 Snapshot Testing Considerations

TypeScript snapshot testing (with Jest's `toMatchSnapshot()` or `toMatchInlineSnapshot()`) requires care. Snapshots test the *output structure* of a component or function, not its *behavior*. They are useful for:

- Preventing unexpected changes to serialized data formats (API response shapes, configuration output)
- Catching regressions in complex, deeply-nested component trees where writing explicit assertions would be prohibitive

They are misused when:
- They replace behavioral tests ("the button is clickable")
- They test implementation details ("the className is 'btn btn-primary btn-sm'")
- They are accepted without review ("snapshot update automatically accepted in CI")

**Inline snapshots for type-level output:**

```typescript
it('formats user for API response', () => {
  const user: User = {
    id: userId('abc123'),
    name: 'Alice',
    email: 'alice@example.com',
    role: 'admin',
    createdAt: new Date('2024-01-01T00:00:00Z'),
  };

  expect(formatUserForApi(user)).toMatchInlineSnapshot(`
    {
      "createdAt": "2024-01-01T00:00:00.000Z",
      "email": "alice@example.com",
      "id": "abc123",
      "name": "Alice",
      "role": "admin",
    }
  `);
});
```

Inline snapshots are preferable to file-based snapshots because they are visible in the test file and can be reviewed alongside the test code.

## 11.7 ESLint Rules for Test Code

Test files often have legitimate reasons to deviate from production code rules:

- `@typescript-eslint/no-explicit-any` — sometimes needed to test edge cases with untyped data
- `functional/immutable-data` — test fixtures are often built incrementally
- `functional/no-let` — loop-based test generation occasionally uses `let`
- `import-x/no-extraneous-dependencies` — test files import devDependencies

The `eslint.config.ts` should have a test-file override:

```typescript
// Add to the config
{
  files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',  // Loosen for test edge cases
    'functional/immutable-data': 'warn',           // Allow fixture building
    'functional/no-let': 'warn',                   // Allow test loop variables
    'sonarjs/no-identical-functions': 'off',       // Test factories can look similar
  },
},
```

The key discipline: test file overrides should be narrowly targeted. Don't disable entire plugins for test files. Override only the rules that have documented, legitimate test-specific reasons to deviate.


---

# 12. Advanced Anti-Patterns and Their Remedies

## 12.1 The `any` Propagation Chain

The most insidious TypeScript anti-pattern is not a single `any` — it is the propagation chain. One `any` in a critical path can contaminate the type system for dozens of subsequent calls.

**The propagation anatomy:**

```typescript
// The origin: an API call returns any
const fetchUserData = async (id: string): Promise<any> => {
  const response = await fetch(`/api/users/${id}`);
  return response.json(); // json() returns Promise<any>
};

// First propagation: property access on any returns any
const userData = await fetchUserData('123');
const userName = userData.name;     // type: any
const userEmail = userData.email;   // type: any

// Second propagation: function called with any parameter
function formatWelcome(name: string): string {
  return `Welcome, ${name}!`;
}
const welcome = formatWelcome(userName); // name: any — TypeScript accepts this
// But: welcome is now string — the propagation has stopped at the function boundary

// Third propagation: function that returns the any value
function processUser(data: any): any { // any returns any
  return {
    name: data.name,
    displayEmail: data.email?.toLowerCase(),
  };
}
const processed = processUser(userData); // processed: any — completely untyped
```

Each link in this chain represents a place where a bug can hide. If `userData.email` doesn't exist, the chain proceeds silently with `undefined` typed as `any`. If `userData.name` is actually a number, `formatWelcome` receives a number typed as `any` and calls `.concat()` or string interpolation on it.

**The remedy — systematic `any` elimination:**

Step 1: Find the origin (where does `any` first enter?). It's almost always at a system boundary: `response.json()`, `JSON.parse()`, `localStorage.getItem()`, untyped event handlers, third-party library return values.

Step 2: Type the origin with a schema parser:

```typescript
// ✅ Parse at the boundary — any never escapes
import { z } from 'zod';

const UserDataSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['admin', 'user', 'guest']),
});

type UserData = z.infer<typeof UserDataSchema>;

const fetchUserData = async (id: string): Promise<UserData> => {
  const response = await fetch(`/api/users/${id}`);
  const raw: unknown = await response.json();
  return UserDataSchema.parse(raw); // throws if invalid, returns UserData if valid
};

// Now the chain is fully typed
const userData = await fetchUserData('123');
const userName = userData.name;     // type: string
const userEmail = userData.email;   // type: string
```

Step 3: Audit the downstream code — many defensive checks become unnecessary once the origin is typed.

## 12.2 The God Object Type

A "god object" type is one that aggregates too many concerns. In TypeScript, this manifests as a large interface that's passed everywhere:

```typescript
// ❌ God object: carries everything
interface User {
  id: UserId;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Address information
  street: string;
  city: string;
  country: string;
  postalCode: string;
  // Payment information
  defaultPaymentMethodId: string;
  billingEmail: string;
  // Notification preferences
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  // Audit
  lastLoginAt: Date;
  loginCount: number;
  failedLoginAttempts: number;
}
```

Functions that need one piece of this aggregate must accept the entire type:

```typescript
// Only needs name and email, but gets everything
function sendWelcomeEmail(user: User): Promise<void> { /* ... */ }

// Only needs id and role, but gets everything
function getPermissions(user: User): Permission[] { /* ... */ }
```

**The remedy — narrowing with Pick:**

```typescript
// Each function declares exactly what it needs
function sendWelcomeEmail(
  recipient: Pick<User, 'name' | 'email'>
): Promise<void> { /* ... */ }

function getPermissions(
  subject: Pick<User, 'id' | 'role'>
): ReadonlyArray<Permission> { /* ... */ }

// Or decompose the type into cohesive value objects
interface UserIdentity {
  readonly id: UserId;
  readonly name: string;
  readonly email: string;
  readonly role: UserRole;
}

interface UserAddress {
  readonly street: string;
  readonly city: string;
  readonly country: string;
  readonly postalCode: string;
}

interface UserPreferences {
  readonly emailNotifications: boolean;
  readonly smsNotifications: boolean;
  readonly pushNotifications: boolean;
}

// Full user is a composition
interface User extends UserIdentity {
  readonly address: UserAddress;
  readonly preferences: UserPreferences;
  // ... etc
}
```

## 12.3 Mutable State Accumulation

This anti-pattern appears when a function builds a result by mutating an accumulator rather than by composing transformations:

```typescript
// ❌ Mutable accumulation: hard to reason about, hard to test
function buildUserReport(users: User[]): UserReport {
  const report: Partial<UserReport> = {};
  
  let totalUsers = 0;
  let activeUsers = 0;
  const roleBreakdown: Record<string, number> = {};
  
  for (const user of users) {
    totalUsers++;
    if (user.isActive) activeUsers++;
    
    const count = roleBreakdown[user.role] ?? 0;
    roleBreakdown[user.role] = count + 1;
  }
  
  report.totalUsers = totalUsers;
  report.activeUsers = activeUsers;
  report.inactiveUsers = totalUsers - activeUsers;
  report.roleBreakdown = roleBreakdown;
  
  return report as UserReport;
}
```

**The remedy — pure, declarative construction:**

```typescript
// ✅ Pure: each piece is computed independently, composed at the end
const buildUserReport = (users: ReadonlyArray<User>): UserReport => {
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.isActive).length;
  const roleBreakdown = users.reduce<Record<string, number>>(
    (acc, user) => ({ ...acc, [user.role]: (acc[user.role] ?? 0) + 1 }),
    {}
  );

  return {
    totalUsers,
    activeUsers,
    inactiveUsers: totalUsers - activeUsers,
    roleBreakdown,
  };
};
```

Each piece of the report is computed as a pure expression. None depend on mutation order. The function can be tested with a single `expect(buildUserReport(users)).toEqual(expectedReport)` call.

## 12.4 The Optional Chain Overuse Pattern

Optional chaining (`?.`) is valuable but can be overused to paper over type design problems:

```typescript
// ❌ Optional chaining as type system avoidance
const displayUserInfo = (data: UserApiResponse): string => {
  return data?.user?.profile?.displayName
    ?? data?.user?.name
    ?? data?.user?.email?.split('@')[0]
    ?? 'Anonymous';
};
```

This code is telling you something: the `UserApiResponse` type is too permissive. Every level is optional when it shouldn't all be optional in every context.

**The remedy — parse at the boundary, use definite types inside:**

```typescript
// ✅ Parse the API response into a clear type
const UserApiResponseSchema = z.object({
  user: z.object({
    name: z.string(),
    email: z.string().email(),
    profile: z.object({
      displayName: z.string().optional(),
    }).optional(),
  }),
});

type ParsedUser = z.infer<typeof UserApiResponseSchema>['user'];

// Now displayUserInfo receives a typed, validated user
const displayUserInfo = (user: ParsedUser): string =>
  user.profile?.displayName ?? user.name;
// Only one optional access — the profile is genuinely optional
```

## 12.5 The "One Massive Config Object" Pattern

A common pattern for configuring functions or services is a single large options object that grows over time:

```typescript
// ❌ Options object with unrelated, optional fields
interface ProcessOptions {
  validateBeforeProcess?: boolean;
  skipValidation?: boolean;      // Contradicts validateBeforeProcess
  useCache?: boolean;
  cacheTtl?: number;             // Only relevant when useCache is true
  retryCount?: number;
  retryDelay?: number;           // Only relevant when retryCount > 0
  onSuccess?: (result: Result) => void;
  onError?: (error: Error) => void;
  onRetry?: (attempt: number, error: Error) => void; // Only relevant with retries
  timeout?: number;
  priority?: 'high' | 'normal' | 'low';
}
```

**The remedy — discriminated unions for exclusive modes, composition for related options:**

```typescript
// ✅ Related options grouped into cohesive sub-objects
interface CacheOptions {
  readonly enabled: true;
  readonly ttl: number;
}

interface RetryOptions {
  readonly maxAttempts: number;
  readonly delayMs: number;
  readonly onRetry?: (attempt: number, error: Error) => void;
}

interface ProcessCallbacks {
  readonly onSuccess?: (result: ProcessResult) => void;
  readonly onError?: (error: Error) => void;
}

// Options compose clearly
interface ProcessOptions {
  readonly validation: 'strict' | 'lenient' | 'skip';
  readonly cache?: CacheOptions;        // Absent means no cache
  readonly retry?: RetryOptions;        // Absent means no retry
  readonly callbacks?: ProcessCallbacks;
  readonly timeoutMs?: number;
  readonly priority?: 'high' | 'normal' | 'low';
}
```

The type now expresses the domain: `cache` is either `CacheOptions` (enabled with ttl) or absent (disabled). `retry` is either `RetryOptions` (with all retry parameters) or absent. Contradictory options (`validateBeforeProcess` and `skipValidation`) are replaced by a single enum `validation`.

## 12.6 The Async/Await Pyramid

Nested async/await calls without proper error handling create code that looks clean but hides error propagation:

```typescript
// ❌ Async pyramid: no error handling, hard to follow error paths
async function processOrderWorkflow(orderId: string): Promise<void> {
  const order = await getOrder(orderId);
  const user = await getUser(order.userId);
  const payment = await processPayment(order.total, user.paymentMethodId);
  const confirmation = await sendConfirmation(user.email, payment.reference);
  await updateOrderStatus(orderId, 'confirmed');
  await logOrderCompleted(orderId, confirmation.timestamp);
}
```

If `processPayment` throws, `updateOrderStatus` and `logOrderCompleted` never run. If `sendConfirmation` throws, `updateOrderStatus` still doesn't run. The function has undefined behavior on failure.

**The remedy — explicit error boundaries with typed error handling:**

```typescript
// ✅ Explicit error handling with typed errors and compensation
type OrderWorkflowError =
  | { readonly type: 'order-not-found'; readonly orderId: string }
  | { readonly type: 'user-not-found'; readonly userId: string }
  | { readonly type: 'payment-failed'; readonly reason: string }
  | { readonly type: 'notification-failed'; readonly email: string };

const processOrderWorkflow = async (
  orderId: string
): Promise<Result<OrderConfirmation, OrderWorkflowError>> => {
  const order = await getOrder(orderId);
  if (!order) return err({ type: 'order-not-found', orderId });

  const user = await getUser(order.userId);
  if (!user) return err({ type: 'user-not-found', userId: order.userId });

  const paymentResult = await processPayment(order.total, user.paymentMethodId);
  if (!paymentResult.ok) return err({ type: 'payment-failed', reason: paymentResult.error.message });

  // Email failure is non-critical — log but don't fail
  const confirmationResult = await sendConfirmation(user.email, paymentResult.value.reference);
  if (!confirmationResult.ok) {
    await logNotificationFailure(user.email, confirmationResult.error);
  }

  // Status update must succeed
  await updateOrderStatus(orderId, 'confirmed');
  await logOrderCompleted(orderId, new Date());

  return ok({
    orderId,
    reference: paymentResult.value.reference,
    confirmedAt: new Date(),
  });
};
```

Each failure mode is handled explicitly. The caller can pattern-match on the error type to provide specific user feedback.

## 12.7 The Test-and-Cast Pattern

TypeScript's control flow analysis narrows types automatically in `if` branches. A common anti-pattern is to test for a condition and then immediately cast to the type that the condition implies:

```typescript
// ❌ Test-then-cast: TypeScript already knows the type after the check
function processShape(shape: Shape): number {
  if (shape.kind === 'circle') {
    return Math.PI * (shape as { radius: number }).radius ** 2; // ← unnecessary cast
  }
  if (shape.kind === 'rectangle') {
    const rect = shape as { width: number; height: number }; // ← unnecessary cast
    return rect.width * rect.height;
  }
  return 0;
}

// ✅ TypeScript narrows automatically after the discriminant check
function processShape(shape: Shape): number {
  if (shape.kind === 'circle') {
    return Math.PI * shape.radius ** 2; // TypeScript knows: shape is { kind: 'circle'; radius: number }
  }
  if (shape.kind === 'rectangle') {
    return shape.width * shape.height; // TypeScript knows: shape is { kind: 'rectangle'; ... }
  }
  return assertNever(shape); // Exhaustiveness check
}
```

The cast suppresses an error that doesn't exist. TypeScript's narrowing already provides the specific type. The cast is not just redundant — it bypasses the type system's narrowing and can hide the case where the discriminant check and the cast don't actually match.

## 12.8 The Promise Void Trap

Returning `void` from an async function is ambiguous and can lead to unhandled Promise rejections:

```typescript
// ❌ Returns void: calling code has no way to await or catch errors
const sendNotification = async (userId: string): void => { // ← void return type
  await emailService.send(userId, 'Notification');
};

// Calling code can't properly await it
// If sendNotification throws, the error propagates nowhere
someEvent.on('triggered', () => {
  sendNotification(userId); // Returns void — can't .catch() or await
});

// ✅ Return Promise<void> for async functions
const sendNotification = async (userId: string): Promise<void> => {
  await emailService.send(userId, 'Notification');
};

// Calling code can now handle the error
someEvent.on('triggered', () => {
  // Explicit fire-and-forget with error handling
  sendNotification(userId).catch(error => {
    logger.error('Failed to send notification', { userId, error });
  });
});
```

`void` as a return type for async functions is technically valid TypeScript but semantically incorrect — an async function always returns a Promise. Use `Promise<void>` for functions that exist for side effects and should be awaitable.

## 12.9 The Enum-Boolean Pattern

When component props use boolean flags to control mutually exclusive behaviors, the code quickly becomes unreadable:

```typescript
// ❌ Boolean flags for mutually exclusive states
interface ButtonProps {
  label: string;
  isPrimary?: boolean;
  isSecondary?: boolean;
  isDestructive?: boolean;
  isLoading?: boolean;
  isDisabled?: boolean;
  isOutlined?: boolean;     // Can it be outlined AND primary?
  isSmall?: boolean;
  isMedium?: boolean;        // Can it be both small and medium?
  isLarge?: boolean;
}

// ✅ Discriminated union for mutually exclusive behaviors
type ButtonVariant = 'primary' | 'secondary' | 'destructive';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  readonly label: string;
  readonly variant: ButtonVariant;
  readonly size?: ButtonSize;
  readonly outlined?: boolean;
  readonly isLoading?: boolean;
  readonly disabled?: boolean;
}

// Can't accidentally combine incompatible variants
<Button variant="primary" label="Save" />
<Button variant="destructive" label="Delete" size="small" />
// <Button isPrimary isSecondary /> — impossible now
```

## 12.10 The Class-for-Namespace Anti-Pattern

Using a class with only static methods as a namespace is a widespread anti-pattern inherited from Java:

```typescript
// ❌ Class as namespace: no benefits of classes, worse than a module
class StringUtils {
  static truncate(str: string, maxLength: number): string {
    return str.length > maxLength ? str.slice(0, maxLength) + '...' : str;
  }

  static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  static slugify(str: string): string {
    return str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
  }
}

// Usage: StringUtils.truncate(name, 50)
```

Problems: not tree-shakable (importing anything from the class imports all of it), can't be extended naturally, can't be used as a first-class value, requires `new StringUtils()` to satisfy interface contracts in some frameworks.

**The remedy — named module exports:**

```typescript
// ✅ Module with named exports: tree-shakable, composable, directly importable
export const truncate = (str: string, maxLength: number): string =>
  str.length > maxLength ? str.slice(0, maxLength) + '...' : str;

export const capitalize = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1);

export const slugify = (str: string): string =>
  str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

// Usage: import { truncate } from '@shared/utils/string'
// truncate(name, 50)
```

The `import-x/no-default-export` rule together with the absence of a "class as namespace" rule doesn't directly catch this, but `eslint-plugin-functional`'s `functional/no-classes` (when enabled strictly) would flag it. For teams with `no-classes: 'off'`, this is a code review discipline — the rule against it is communicated in the team standards document.

## 12.11 Anti-Pattern Summary Table

| Anti-Pattern | ESLint Rule | Remedy |
|---|---|---|
| `any` propagation | `no-explicit-any`, `no-unsafe-*` family | Parse at boundaries with Zod/Valibot |
| God object types | No rule (code review) | `Pick<T, ...>`, decompose into value objects |
| Mutable accumulation | `functional/immutable-data`, `functional/no-let` | Pure expressions, `reduce` for aggregation |
| Optional chain overuse | No rule | Design better types, parse at boundary |
| Floating Promises | `no-floating-promises` | Await all Promises; use `void` for intentional fire-and-forget |
| Test-then-cast | `@typescript-eslint/no-unnecessary-type-assertion` | Trust TypeScript's control-flow narrowing |
| `void` for async returns | `@typescript-eslint/no-misused-promises` | Use `Promise<void>` for async side effects |
| Boolean flag props | No rule (code review) | Discriminated union props |
| Class-as-namespace | `functional/no-classes` (strict) | Named module exports |
| Nested `if` | `sonarjs/no-collapsible-if` | Merge with `&&` |
| Missing `await` | `no-floating-promises`, `require-await` | Add `await` or remove `async` |
| Duplicate code | `sonarjs/no-identical-functions` | Extract shared function |
| High complexity | `sonarjs/cognitive-complexity` | Decompose into smaller functions |
| Circular imports | `import-x/no-cycle` | Restructure boundaries, extract shared types |
| Mutating array methods | `functional/immutable-data` | Use `.toSorted()`, `.toReversed()`, spread+mutate |
| Default exports | `import-x/no-default-export` | Named exports |
| Abbreviations | `unicorn/prevent-abbreviations` | Descriptive names |
| Indexed for loops | `unicorn/no-for-loop` | `for-of` or `map`/`filter` |
| `indexOf` comparisons | `unicorn/prefer-includes` | `.includes()` |


---

# 13. TypeScript Performance, Build Tooling, and Advanced Generics

## 13.1 TypeScript Compiler Performance

For large TypeScript codebases, compile time and language server performance become engineering concerns in their own right. A slow TypeScript language server makes autocomplete painful and code navigation sluggish — degrading developer experience even if the final build is fast.

**Project references for incremental builds:**

TypeScript's project references (`composite: true`) enable incremental compilation where only changed packages and their dependents are recompiled. In a monorepo with 20 packages, changing one package shouldn't require recompiling all 20.

```json
// Root tsconfig.json in a monorepo
{
  "files": [],
  "references": [
    { "path": "./packages/domain" },
    { "path": "./packages/application" },
    { "path": "./packages/infrastructure" },
    { "path": "./packages/web" }
  ]
}
```

```bash
# Build all packages in dependency order, incrementally
npx tsc --build --verbose

# Clean and rebuild
npx tsc --build --clean && npx tsc --build

# Watch mode for development
npx tsc --build --watch
```

**`skipLibCheck` and when to use it:**

`skipLibCheck: true` (in the recommended tsconfig) skips type checking of all `.d.ts` files in `node_modules`. This significantly speeds up compilation in codebases with many dependencies. The trade-off: type errors in library type declarations are not caught.

The trade-off is acceptable for applications (you're consuming libraries, not authoring them) and necessary in practice because many popular libraries have type declaration bugs that don't affect actual usage.

For library authors, consider `skipLibCheck: false` to ensure your type declarations are compatible with strict TypeScript setups.

**The `isolatedModules` requirement:**

`isolatedModules: true` ensures each file can be type-stripped (compiled to JavaScript) independently without knowledge of other files. This is required by:
- esbuild (Vite's TypeScript compiler)
- Babel's `@babel/plugin-transform-typescript`
- SWC's TypeScript transform

Without `isolatedModules`, you cannot use:
- `const enum` (requires cross-file knowledge)
- Namespace re-exports (`export * as Foo from './foo'` for namespaces)
- Some legacy TypeScript patterns

For new projects in 2025, `isolatedModules: true` is the correct setting. These limitations align with modern TypeScript patterns anyway.

**Measuring compilation performance:**

```bash
# TypeScript compiler performance diagnostics
tsc --extendedDiagnostics 2>&1 | grep -E '(IO|Bind|Check|Total)'

# Find the slowest files to type-check
tsc --generateTrace trace-output
# Then: npx @typescript/analyze-trace trace-output
```

TypeScript 5.x also provides the `--noCheck` flag for build-only (no type checking) compilation, which is useful for production builds that are preceded by a separate type-check step in CI.

## 13.2 Build Tooling Choices

The TypeScript build tool landscape has consolidated significantly. Understanding the right tool for each use case:

**Vite (recommended for web applications):**
Vite uses esbuild for development (extremely fast, no type checking) and Rollup for production builds (tree-shaking, optimized output). TypeScript types are stripped without type checking during development.

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@domain': path.resolve(__dirname, 'src/domain'),
      '@features': path.resolve(__dirname, 'src/features'),
      '@shared': path.resolve(__dirname, 'src/shared'),
    },
  },
  build: {
    target: 'es2022',
    sourcemap: true,
  },
});
```

```bash
# Development: ultra-fast (esbuild, no type checking)
npm run dev

# CI: type-check separately, then build
npx tsc --noEmit && npm run build
```

**esbuild (recommended for Node.js services and CLIs):**
esbuild is the fastest TypeScript-aware bundler. It strips types without type checking, produces CommonJS or ESM output, and supports all modern JavaScript features.

```typescript
// build.ts
import { build } from 'esbuild';

await build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'esm',
  outfile: 'dist/index.mjs',
  external: ['node:*'],    // Don't bundle Node.js built-ins
  sourcemap: true,
  minify: process.env.NODE_ENV === 'production',
});
```

**tsc (for library publishing and type checking):**
The TypeScript compiler (`tsc`) is the reference implementation and the only tool that produces type declaration files (`.d.ts`). For libraries, you need `tsc` to generate declarations. For applications, use a faster bundler and run `tsc --noEmit` separately for type checking.

```bash
# Application workflow
npx tsc --noEmit    # Type check only (no output)
npx vite build       # Build (no type checking)

# Library workflow
npx tsc --build     # Type check AND emit .d.ts files
```

## 13.3 Advanced Generic Patterns

TypeScript's generic system is powerful enough to encode complex type-level logic. These patterns appear in library code, reusable utilities, and API design.

**Recursive generics for tree structures:**

```typescript
// A type-safe tree node that works for any value type
interface TreeNode<T> {
  readonly value: T;
  readonly children: ReadonlyArray<TreeNode<T>>;
}

// Recursive tree operations that are fully type-safe
const mapTree = <T, U>(
  node: TreeNode<T>,
  transform: (value: T) => U
): TreeNode<U> => ({
  value: transform(node.value),
  children: node.children.map(child => mapTree(child, transform)),
});

const foldTree = <T, U>(
  node: TreeNode<T>,
  combine: (value: T, childResults: ReadonlyArray<U>) => U
): U =>
  combine(node.value, node.children.map(child => foldTree(child, combine)));

// Calculate total value of all nodes in a numeric tree
const totalTreeValue = (node: TreeNode<number>): number =>
  foldTree(node, (value, childTotals) =>
    value + childTotals.reduce((sum, n) => sum + n, 0)
  );
```

**Generic function overloads for conditional return types:**

```typescript
// A function that returns different types based on the options
function parseInput(input: string, options: { strict: true }): number;
function parseInput(input: string, options?: { strict?: boolean }): number | null;
function parseInput(
  input: string,
  options?: { strict?: boolean }
): number | null {
  const parsed = parseFloat(input);
  if (isNaN(parsed)) {
    if (options?.strict) throw new Error(`Invalid number: ${input}`);
    return null;
  }
  return parsed;
}

const result1 = parseInput('42', { strict: true });  // type: number (never null)
const result2 = parseInput('42');                     // type: number | null
```

**Variadic tuples for type-safe pipelines:**

TypeScript 4.0+ supports variadic tuple types, enabling type-safe function pipelines:

```typescript
// Type-safe pipe with heterogeneous types
type Pipe<T extends readonly unknown[]> =
  T extends readonly [infer Head]
    ? Head
    : T extends readonly [infer Head, ...infer Rest]
    ? Head extends (...args: never[]) => infer Out
      ? [Head, ...Pipe<readonly [Out, ...Rest]>]
      : never
    : never;

// Simpler approach with explicit overloads for common arities
function pipe<A, B>(fn1: (a: A) => B): (a: A) => B;
function pipe<A, B, C>(fn1: (a: A) => B, fn2: (b: B) => C): (a: A) => C;
function pipe<A, B, C, D>(fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D): (a: A) => D;
function pipe<A, B, C, D, E>(
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E
): (a: A) => E;
function pipe(...fns: ReadonlyArray<(x: unknown) => unknown>): (x: unknown) => unknown {
  return (x) => fns.reduce((acc, fn) => fn(acc), x);
}
```

**Builder pattern with TypeScript generics:**

```typescript
// A type-safe query builder
type SortDirection = 'asc' | 'desc';

class QueryBuilder<T extends Record<string, unknown>> {
  private readonly _filters: ReadonlyArray<(item: T) => boolean> = [];
  private readonly _sorts: ReadonlyArray<{ key: keyof T; direction: SortDirection }> = [];
  private readonly _limit: number | null = null;

  where<K extends keyof T>(key: K, value: T[K]): QueryBuilder<T> {
    return new (QueryBuilder as new (...args: unknown[]) => QueryBuilder<T>)()
      // ... with filters added
  }

  orderBy(key: keyof T, direction: SortDirection = 'asc'): QueryBuilder<T> {
    // ... returns new builder with sort added
    return this;
  }

  take(limit: number): QueryBuilder<T> {
    // ... returns new builder with limit set
    return this;
  }

  execute(data: ReadonlyArray<T>): ReadonlyArray<T> {
    let result = data.filter(item =>
      this._filters.every(filter => filter(item))
    );
    // Apply sorts
    for (const sort of [...this._sorts].reverse()) {
      result = result.toSorted((a, b) => {
        const av = a[sort.key];
        const bv = b[sort.key];
        const cmp = av < bv ? -1 : av > bv ? 1 : 0;
        return sort.direction === 'asc' ? cmp : -cmp;
      });
    }
    return this._limit !== null ? result.slice(0, this._limit) : result;
  }
}
```

## 13.4 TypeScript 5.x Features Worth Knowing

TypeScript 5.x (2023–2025) introduced several features that change how senior engineers write clean code:

**`const` type parameters (TypeScript 5.0):**

```typescript
// Without const type parameter: infers widened types
function identity<T>(value: T): T { return value; }
const x = identity(['hello', 'world']);
// x: string[] — widened, not readonly ['hello', 'world']

// With const type parameter: preserves literal types
function identityConst<const T>(value: T): T { return value; }
const y = identityConst(['hello', 'world']);
// y: readonly ['hello', 'world'] — preserved!
```

This is valuable for functions that should return the exact literal type of their input.

**Override keyword (TypeScript 4.3+, encouraged in strict mode):**

```typescript
class Animal {
  name(): string { return 'Animal'; }
}

class Dog extends Animal {
  // The override keyword ensures this is actually overriding a base class method
  // Without it (and with noImplicitOverride: true), TypeScript would error
  override name(): string { return 'Dog'; }

  // bark(): string { return 'Woof'; }  // ← fine, no override needed for new methods
}
```

**`using` and `Symbol.asyncDispose` (TypeScript 5.2):**

The `using` declaration enables automatic resource cleanup:

```typescript
class DatabaseConnection {
  // Implements Symbol.asyncDispose for automatic cleanup
  async [Symbol.asyncDispose](): Promise<void> {
    await this.close();
  }

  async query(sql: string): Promise<QueryResult> { /* ... */ }
  async close(): Promise<void> { /* ... */ }
}

// Automatic cleanup when the block exits (success or error)
async function doWork(): Promise<void> {
  await using conn = new DatabaseConnection();
  // conn is automatically closed when this function returns or throws
  const result = await conn.query('SELECT * FROM users');
  process(result);
} // conn.close() is automatically called here
```

## 13.5 TypeScript in the Fullstack Context

TypeScript's type system is most valuable when types flow across boundaries — from database schema to server types to API types to client types. This "end-to-end type safety" approach eliminates the most common integration bug: frontend and backend disagree on the shape of data.

**tRPC for type-safe API contracts:**

tRPC generates TypeScript-typed API clients from router definitions on the server:

```typescript
// Server: define the API
const userRouter = router({
  getUser: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      return await db.user.findUnique({ where: { id: input.id } });
    }),

  updateUser: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      name: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      return await db.user.update({
        where: { id: input.id },
        data: { name: input.name },
      });
    }),
});

// Client: full TypeScript types inferred from server router
// No code generation, no OpenAPI spec, no manual type duplication
const user = await trpc.user.getUser.query({ id: userId });
// user is automatically typed as the return type of getUser
```

**Zod for runtime + compile-time validation:**

Zod schemas serve dual purposes: they parse and validate at runtime AND infer TypeScript types at compile time. This eliminates the common divergence between "what the code says the type is" and "what the data actually looks like":

```typescript
const OrderSchema = z.object({
  id: z.string().uuid(),
  customerId: z.string().uuid(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().nonnegative(),
  })),
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
  createdAt: z.string().datetime(),
});

// TypeScript type derived from the schema — always in sync
type Order = z.infer<typeof OrderSchema>;
// type Order = {
//   id: string;
//   customerId: string;
//   items: { productId: string; quantity: number; unitPrice: number; }[];
//   status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
//   createdAt: string;
// }

// Validate API response at the boundary — type safety guaranteed downstream
const order = OrderSchema.parse(apiResponse);
// From here: order is fully typed, no defensive checks needed
```

## 13.6 Type-Safe Error Handling Patterns

Error handling is one of the most undertested and most inconsistent areas in TypeScript codebases. Three patterns have emerged as community standards:

**Pattern 1: Result type (simple, no library)**

```typescript
type Result<T, E = Error> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: E };

const ok = <T>(data: T): Result<T, never> => ({ success: true, data });
const fail = <E>(error: E): Result<never, E> => ({ success: false, error });

// Function that can fail returns Result instead of throwing
const parseUserId = (raw: string): Result<UserId, string> => {
  if (!raw.match(/^user-[a-z0-9]+$/)) {
    return fail(`Invalid user ID format: ${raw}`);
  }
  return ok(raw as UserId);
};

// Caller handles both cases explicitly
const result = parseUserId(userInput);
if (result.success) {
  processUser(result.data);
} else {
  showError(result.error);
}
```

**Pattern 2: Effect's typed error channels**

```typescript
import { Effect } from 'effect';

class UserNotFoundError extends Error {
  readonly _tag = 'UserNotFoundError';
  constructor(readonly userId: string) {
    super(`User not found: ${userId}`);
  }
}

class DatabaseError extends Error {
  readonly _tag = 'DatabaseError';
}

// The type signature makes failure modes explicit
const getUser = (id: string): Effect.Effect<User, UserNotFoundError | DatabaseError> =>
  Effect.tryPromise({
    try: () => db.user.findUnique({ where: { id } }),
    catch: (e) => new DatabaseError(`Database error: ${String(e)}`),
  }).pipe(
    Effect.flatMap(user =>
      user ? Effect.succeed(user) : Effect.fail(new UserNotFoundError(id))
    )
  );

// The caller knows exactly what errors to handle — typed exhaustiveness
const program = getUser('123').pipe(
  Effect.catchTag('UserNotFoundError', (e) => Effect.succeed(defaultUser)),
  Effect.catchTag('DatabaseError', (e) => Effect.fail(e)), // re-throws as critical
);
```

**Pattern 3: Custom error hierarchy with discriminated unions**

```typescript
// Base error type with discriminant
type AppError =
  | { readonly type: 'validation'; readonly field: string; readonly message: string }
  | { readonly type: 'not-found'; readonly resource: string; readonly id: string }
  | { readonly type: 'unauthorized'; readonly requiredRole: string }
  | { readonly type: 'rate-limited'; readonly retryAfter: Date }
  | { readonly type: 'internal'; readonly cause: Error };

// Map to HTTP status codes exhaustively
const toHttpStatus = (error: AppError): number => {
  switch (error.type) {
    case 'validation':   return 400;
    case 'not-found':    return 404;
    case 'unauthorized': return 403;
    case 'rate-limited': return 429;
    case 'internal':     return 500;
  }
};
```

## 13.7 TypeScript Strict Mode: The Road to Full Compliance

Many brownfield TypeScript projects have `strict: false` or enable only some strict-mode flags. Migrating to full strict mode is one of the highest-ROI investments a codebase can make, but it requires a systematic approach.

**The migration path:**

Step 1 — Enable `strictNullChecks` first. This is the most impactful individual flag. It will produce the most violations but catch the most bugs. Fix all violations before enabling the next flag.

Step 2 — Enable `noImplicitAny`. This forces explicit types where TypeScript cannot infer them. Most violations are function parameters that need type annotations.

Step 3 — Enable `strictFunctionTypes`. This catches function type compatibility issues — typically rare in modern TypeScript code.

Step 4 — Enable `strictPropertyInitialization`. This catches class properties that are declared but not initialized in the constructor. Fix with definite assignment assertions (`!`) where truly safe, or by restructuring initialization logic.

Step 5 — Enable all remaining strict flags: `noImplicitThis`, `alwaysStrict`, `strictBindCallApply`.

Step 6 — Enable the non-strict-bundle flags: `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitReturns`.

**Tracking progress:**

```bash
# Count strict violations at each step
tsc --noEmit --strict 2>&1 | wc -l

# Run with specific flags to isolate violation counts
tsc --noEmit --strictNullChecks 2>&1 | wc -l
tsc --noEmit --noImplicitAny 2>&1 | wc -l
```

For teams with thousands of violations, the approach is the same as linting adoption: phased, file-by-file, with ownership assigned per module. TypeScript's `// @ts-expect-error` directive can temporarily suppress errors in files being migrated, providing a clear marker for "this still needs work" that is better than leaving violations unfixed.

## 13.8 Configuration File Best Practices

The `eslint.config.ts` itself benefits from the same clean code principles applied to application code:

**Modular config composition:**

```typescript
// Shared base config for the organization
// packages/eslint-config/src/base.ts
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export const baseConfig = tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
);

// Project-specific config extends the base
// eslint.config.ts
import { baseConfig } from '@myorg/eslint-config';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  ...baseConfig,
  {
    rules: {
      // Project-specific overrides
    },
  },
);
```

**Config validation with TypeScript:**

The `tseslint.config()` helper provides full TypeScript typing for the config object. Use this to catch config mistakes at write time:

```typescript
// TypeScript will flag invalid rule names, invalid option values, etc.
export default tseslint.config({
  rules: {
    '@typescript-eslint/no-floating-promises': 'eroor',  // ❌ Typo caught at write time
    '@typescript-eslint/no-explicit-any': ['error', { unexpected: 'option' }], // ❌ Invalid option
  },
});
```

**Comments as documentation:**

Every non-obvious rule configuration in `eslint.config.ts` should have a comment explaining why it's set as it is:

```typescript
rules: {
  // ── Why warn not error: library types are often not readonly, producing
  // false positives when integrating with third-party code like React's
  // event types or DOM APIs. Treat as a guideline, not an absolute.
  'functional/prefer-immutable-types': 'warn',

  // ── Why off: React components return null (not undefined) to render nothing.
  // The unicorn/no-null rule conflicts with the fundamental React pattern.
  'unicorn/no-null': 'off',

  // ── Why error not warn: incorrect dependency arrays cause stale closures
  // — a production bug category, not a style issue. Must be error.
  'react-hooks/exhaustive-deps': 'error',
}
```

A well-documented config file is a living record of the team's reasoning. Future engineers (and future you) will thank you for the explanations.


---

# 14. Comprehensive Rule Reference and Rationale

This section provides a complete annotated reference for every rule category in the proposed ESLint configuration. It is designed to be a quick reference for teams adopting the config, a training resource for engineers new to strict TypeScript linting, and a governance document for quarterly config reviews.

## 14.1 Core ESLint Rules (from `eslint.configs.recommended`)

The `recommended` preset enables a curated set of rules that catch bugs. These rules apply to all JavaScript/TypeScript files.

**Error prevention rules (from `recommended`):**

`no-const-assign` — Prevents reassigning `const` variables. TypeScript's compiler already catches this, but the ESLint rule provides faster feedback.

`no-unreachable` — Flags code after `return`, `throw`, `break`, or `continue` statements. Indicates dead code or a misunderstanding of control flow.

```typescript
function processOrder(order: Order): void {
  if (order.status === 'cancelled') {
    return;
  }
  doWork(order);
  return; // ← first return
  cleanup(); // ← unreachable: eslint flags this
}
```

`no-unsafe-finally` — Prevents `return`, `throw`, `break`, or `continue` in `finally` blocks that override the exception from the `try` block. A very subtle bug class that silently swallows exceptions.

```typescript
// ❌ The error from the try block is silently discarded
function riskyOperation(): string {
  try {
    throw new Error('Something went wrong');
  } finally {
    return 'success'; // ← finally return overrides the thrown error!
  }
}
```

`no-dupe-keys` — Prevents duplicate keys in object literals. The second key silently overwrites the first:

```typescript
const config = {
  timeout: 5000,
  retries: 3,
  timeout: 10000, // ← silently overwrites; eslint flags this
};
```

`no-duplicate-case` — Prevents duplicate cases in switch statements. The second case is unreachable.

`no-fallthrough` — Prevents accidental fallthrough in switch cases (missing `break` or `return`). TypeScript's `noFallthroughCasesInSwitch` does this at the compiler level, but the ESLint rule adds the linting layer.

`prefer-const` — Requires `const` for variables that are never reassigned. Every `let` should be a declaration of intent to mutate; non-mutating `let` is misleading.

`no-irregular-whitespace` — Catches Unicode whitespace characters that look like regular spaces but behave differently. A rare but extremely confusing source of bugs.

## 14.2 TypeScript ESLint Rules (from `strictTypeChecked`)

These rules require the TypeScript type checker to run. They are the most powerful rules because they understand your code's semantics.

**The Promise safety cluster:**

`@typescript-eslint/no-floating-promises` — Every Promise that is created must be either awaited or explicitly handled with `.catch()`. Unhandled Promises produce silent failures.

Configuration options:
- `ignoreVoid: true` — allows `void somePromise()` as an explicit fire-and-forget pattern
- `ignoreIIFE: true` — allows immediately invoked async functions

```typescript
// Correct patterns:
await doAsyncWork();               // awaited
void doAsyncWork();                // explicit fire-and-forget (with ignoreVoid: true)
doAsyncWork().catch(handleError);  // explicitly caught
return doAsyncWork();              // returned to caller
```

`@typescript-eslint/no-misused-promises` — Prevents Promises from being used in positions that expect synchronous values. The most common instance: passing an `async` function as an `onClick` handler.

`@typescript-eslint/await-thenable` — Prevents `await`ing non-Promise values. `await synchronousValue` adds an unnecessary microtask tick and signals a misunderstanding.

**The `any` safety cluster:**

`@typescript-eslint/no-explicit-any` — Prevents explicitly writing `any` in type positions. Enforces using `unknown` for data whose type is genuinely unknown.

`@typescript-eslint/no-unsafe-assignment` — Prevents assigning `any`-typed values to typed variables. Catches the first link in the `any` propagation chain.

`@typescript-eslint/no-unsafe-call` — Prevents calling `any`-typed values as functions.

`@typescript-eslint/no-unsafe-member-access` — Prevents accessing properties on `any`-typed values.

`@typescript-eslint/no-unsafe-return` — Prevents returning `any`-typed values from typed functions.

`@typescript-eslint/no-unsafe-argument` — Prevents passing `any`-typed values to typed function parameters.

Together these six rules form a comprehensive `any` firewall. Each catches a different way that `any` can propagate through typed code.

**Type correctness rules:**

`@typescript-eslint/switch-exhaustiveness-check` — Requires that switch statements over discriminated unions handle all cases. Add `assertNever` in the default branch for runtime safety:

```typescript
type Action =
  | { readonly type: 'INCREMENT' }
  | { readonly type: 'DECREMENT' }
  | { readonly type: 'RESET'; readonly value: number };

const reducer = (state: number, action: Action): number => {
  switch (action.type) {
    case 'INCREMENT': return state + 1;
    case 'DECREMENT': return state - 1;
    case 'RESET':     return action.value;
    // No default needed — switch-exhaustiveness-check verified all cases
  }
};
```

`@typescript-eslint/restrict-template-expressions` — Prevents non-string, non-number values from being used in template literals without explicit conversion:

```typescript
const user = { name: 'Alice' };
const msg = `Hello ${user}`;   // ❌ Produces "Hello [object Object]"
const msg = `Hello ${user.name}`;  // ✅ Correct
```

`@typescript-eslint/unbound-method` — Prevents method references without `this` binding:

```typescript
class Timer {
  private count = 0;
  increment(): void { this.count++; }
}

const timer = new Timer();
const fn = timer.increment;  // ❌ Method detached from this — will throw
fn();                         // TypeError: Cannot read property 'count' of undefined

// ✅ Bound reference
const fn = timer.increment.bind(timer);
// OR
const fn = () => timer.increment();
```

**Stylistic type rules (from `stylisticTypeChecked`):**

`@typescript-eslint/consistent-type-assertions` — Enforces `as Type` syntax over `<Type>` for type assertions (the angle bracket syntax conflicts with JSX).

`@typescript-eslint/array-type` — Enforces consistent array type notation. `T[]` vs `Array<T>`. Choose one and enforce it consistently:

```typescript
// With array-type: ['error', { default: 'array' }]
const users: User[] = [];       // ✅
const users: Array<User> = [];  // ❌ prefer array shorthand
```

`@typescript-eslint/prefer-function-type` — Enforces function type expressions over interfaces with single call signatures:

```typescript
// ❌ Interface with single call signature
interface Formatter { (value: string): string; }

// ✅ Function type alias
type Formatter = (value: string) => string;
```

## 14.3 Functional Programming Rules (from `eslint-plugin-functional`)

**Mutation prevention:**

`functional/immutable-data` — The cornerstone immutability rule. Flags all forms of mutation:
- Object property assignment: `obj.prop = value`
- Array push/pop/splice/sort/reverse: `arr.push(item)`
- Index assignment: `arr[0] = item`
- Property deletion: `delete obj.prop`

Auto-fixable alternatives for each:
- Object mutation → spread: `const updated = { ...obj, prop: value }`
- Array mutation → immutable methods: `arr.toSorted()`, `arr.toReversed()`
- Array extension → spread: `[...arr, newItem]`
- Property deletion → Omit: `const { prop, ...rest } = obj; return rest;`

`functional/no-let` — Forces all variable declarations to be `const`. The disciplined position: every `let` is a declaration of intent to mutate. If you're not going to reassign it, don't signal mutability.

`functional/prefer-immutable-types` — Encourages `readonly` on function parameters. The enforcement levels:
- `ReadonlyShallow` — first-level properties must be `readonly`
- `ReadonlyDeep` — recursively all properties must be `readonly`
- `Immutable` — the entire value must be immutable (including no mutable methods)

The recommended setting for pragmatic FP is `ReadonlyShallow` on `warn` — you want to see the opportunities to add `readonly`, but you don't want to block builds when library types aren't cooperative.

**Paradigm rules:**

`functional/no-method-signature` — Enforces property signatures over method signatures in interfaces. Property signatures are `readonly` by default in TypeScript's structural type system; method signatures are not.

```typescript
// ❌ Method signature: mutable, can be overridden
interface UserService {
  findById(id: string): Promise<User>;
}

// ✅ Property signature: readonly by default
interface UserService {
  readonly findById: (id: string) => Promise<User>;
}
```

`functional/no-classes` (set to `off`) — When set to `error`, requires all code to use functions and plain objects instead of classes. Too restrictive for teams with framework integration needs.

`functional/no-this-expressions` (set to `off` via `no-classes: off`) — Prevents use of `this` keyword outside of class methods. Meaningful only when classes are also banned.

## 14.4 Unicorn Rules Reference

**Modernization rules:**

`unicorn/prefer-node-protocol` — Requires `node:` prefix for built-in modules. The Node.js documentation has recommended this since Node.js 14.18.0 (2021). It prevents accidental shadowing by npm packages with the same name (e.g., `fs`, `path`, `stream` packages exist on npm).

`unicorn/no-for-loop` — Replaces indexed `for` loops with `for-of`. The indexed pattern is error-prone:
- Off-by-one errors: `i <= arr.length` vs `i < arr.length`
- Incorrect index arithmetic in the loop body
- Modifying the array while iterating (produces unpredictable behavior)
`for-of` eliminates all three problems.

`unicorn/prefer-module` — Enforces ESM (`import`/`export`) over CommonJS (`require`/`module.exports`). ESM is the standard for all JavaScript environments in 2025. CommonJS is legacy.

**String rules:**

`unicorn/prefer-string-slice` — `slice()` is the correct method for string/array extraction. `substr()` is deprecated. `substring()` has counterintuitive behavior with negative indices. `slice()` is consistent, standard, and supports negative indices.

`unicorn/prefer-includes` — `.includes()` is more readable than `.indexOf() !== -1`. Expresses intent (does this array contain x?) rather than mechanism (is the index of x not -1?).

**Code quality rules:**

`unicorn/consistent-function-scoping` — Moves functions to the outermost scope where they don't need closure variables. A function defined inside another function and not using any of its outer scope's variables unnecessarily re-creates itself on every outer function call.

```typescript
// ❌ isEven defined inside processNumbers — recreated on every call
const processNumbers = (numbers: number[]): number[] => {
  const isEven = (n: number): boolean => n % 2 === 0; // unnecessary closure
  return numbers.filter(isEven);
};

// ✅ isEven at module scope — created once
const isEven = (n: number): boolean => n % 2 === 0;
const processNumbers = (numbers: number[]): number[] => numbers.filter(isEven);
```

`unicorn/no-negated-condition` — Prefers positive conditions over negated ones for readability:

```typescript
// ❌ Negated condition with else
if (!isValid) {
  handleInvalid();
} else {
  handleValid();
}

// ✅ Positive condition
if (isValid) {
  handleValid();
} else {
  handleInvalid();
}
```

`unicorn/throw-new-error` — Requires `throw` to use `new Error(...)` not `throw 'message'` (throwing primitives) and not `return new Error(...)` (returning instead of throwing).

**Filename rules:**

`unicorn/filename-case` — The most impactful unicorn rule for team consistency. Without filename casing enforcement, you get:
- `UserProfile.tsx` vs `userProfile.tsx` vs `user-profile.tsx`
- All three are valid on case-insensitive file systems (macOS) but different on case-sensitive ones (Linux, CI)
- The inconsistency makes code search unreliable

The recommended configuration: PascalCase for components, camelCase for hooks/utilities/services, kebabCase for config files. Exceptions for test, story, and declaration files.

## 14.5 SonarJS Rules Reference

**Cognitive complexity:**

`sonarjs/cognitive-complexity` with threshold 15 — Cognitive complexity was developed by SonarSource as an improvement over cyclomatic complexity. The key differences:

- *Cyclomatic complexity* counts distinct execution paths. `if (a && b && c)` counts as 4 paths.
- *Cognitive complexity* measures the mental effort to understand the code. `if (a && b && c)` is still one condition to understand.

The formula adds:
- +1 for each structural break (if, else, for, while, switch, catch, ternary)
- +1 for each nesting level when inside a structural break
- +1 for each logical operator sequence (`&&` or `||` groups)

A function with cognitive complexity 30 is approximately twice as hard to understand as one with complexity 15. The threshold of 15 is a practical balance — strict enough to flag genuinely complex functions while lenient enough to allow moderately complex business logic.

Common cases that trigger the rule and their remedies:

```typescript
// ❌ Cognitive complexity: ~20 (multiple nested conditions + loops)
function processOrder(order: Order, user: User, config: Config): Result {
  if (order.status === 'pending') {                    // +1
    if (user.isVerified) {                             // +2 (nested)
      for (const item of order.items) {               // +3 (nested further)
        if (item.quantity > config.maxQuantity) {      // +4 (even deeper)
          if (user.role === 'admin') {                 // +5 (deepest)
            return handleAdminOverride(order, item);
          } else {                                     // +1
            return createError('quantity-exceeded');
          }
        }
      }
    } else if (user.isPending) {                      // +1
      return createError('user-not-verified');
    }
  }
  return defaultProcess(order);
}

// ✅ Decomposed: each function is well below the threshold
const processAdminItem = (order: Order, item: OrderItem): Result =>
  item.quantity > config.maxQuantity
    ? handleAdminOverride(order, item)
    : processStandardItem(order, item);

const processVerifiedOrder = (order: Order, user: User): Result => {
  for (const item of order.items) {
    const result = user.role === 'admin'
      ? processAdminItem(order, item)
      : processStandardItem(order, item);
    if (!result.ok) return result;
  }
  return defaultProcess(order);
};

const processOrder = (order: Order, user: User): Result => {
  if (order.status !== 'pending') return defaultProcess(order);
  if (user.isPending) return createError('user-not-verified');
  if (!user.isVerified) return createError('verification-required');
  return processVerifiedOrder(order, user);
};
```

**Duplicate detection:**

`sonarjs/no-identical-functions` with threshold 3 — Two functions whose bodies are 3+ lines of identical code are flagged. The threshold of 3 balances sensitivity (catching meaningful duplication) with specificity (not flagging every pair of simple getters).

The fix is always: extract the common logic into a shared function. If the two functions are in different modules, the extracted function belongs in `shared/`.

**Code smell rules:**

`sonarjs/no-all-duplicated-branches` — Flags if/switch statements where all branches execute identical code:

```typescript
// ❌ All branches are the same — the condition is meaningless
if (type === 'A') {
  process(data);
} else {
  process(data); // same as the if branch
}

// ✅ Remove the unnecessary condition
process(data);
```

`sonarjs/no-element-overwrite` — Catches collection element overwrites without use:

```typescript
// ❌ result[0] is written but never read before being overwritten
const result: string[] = [];
result[0] = computeFirst();   // written
result[0] = computeSecond();  // overwrites without using first value — flagged

// ✅ Intentional pattern is clearer
const first = computeFirst();
const final = shouldUseSecond ? computeSecond() : first;
result[0] = final;
```

## 14.6 eslint-plugin-import-x Rules Reference

**Circular dependency:**

`import-x/no-cycle` — TypeScript's compiler does not detect circular imports as errors (they often work due to module loading semantics). This rule detects them statically.

The `maxDepth: Infinity` setting is critical. With `maxDepth: 1`, only direct cycles (A → A) are caught. With `Infinity`, all transitive cycles are caught: A → B → C → D → A. A large application can have cycles of depth 10+ that never manifest in testing but cause production initialization failures.

`ignoreExternal: true` — Don't check `node_modules`. Circular dependencies in third-party code are not actionable, and checking them significantly slows the rule.

**Import quality:**

`import-x/no-default-export` — The no-default-export rule enforcement eliminates an entire category of inconsistency. Named exports are:

- **Searchable**: `grep -r 'processUser'` finds all uses
- **Renameable**: IDE rename refactors work across all import sites
- **Consistent**: the name is defined at the export site, not at each import site
- **Tree-shakable**: bundlers can reliably determine which exports are used

Default exports allow: `import doThing from './processUser'`, `import myHelper from './processUser'`, `import x from './processUser'` — three different names for the same function in three different files.

`import-x/no-extraneous-dependencies` — Enforces that production code only imports from dependencies listed in `package.json`'s `dependencies`, not `devDependencies`. This prevents test utilities from entering the production bundle.

The `devDependencies` array in the rule configuration lists files that ARE allowed to import devDependencies (test files, config files, Storybook files).

`import-x/no-duplicates` — Prevents the same module from being imported twice:

```typescript
// ❌ Two imports from the same module
import { User } from './types';
import { Order } from './types';  // should be merged

// ✅ Single merged import
import { type User, type Order } from './types';
```

With `'prefer-inline': true`, the auto-fixer also adds `type` to type-only imports as it merges them.

## 14.7 React Plugin Rules Reference

**Component rules:**

`react/no-unstable-nested-components` — This rule addresses one of the most common React performance anti-patterns. When a component is defined inside another component's render function, React sees a new component type on every render and fully re-mounts all children:

```typescript
// ❌ React sees a new "ItemComponent" type on every ParentComponent render
function Parent({ items }: { items: Item[] }): React.ReactElement {
  function Item({ item }: { item: Item }): React.ReactElement {
    return <li>{item.name}</li>;
  }
  return <ul>{items.map(item => <Item key={item.id} item={item} />)}</ul>;
}

// All Item children are unmounted and remounted on every Parent render
// This destroys any state held by Item (focus, scroll position, etc.)
```

The fix: define the child component at module scope. It becomes a stable component type and React's reconciler can update it without remounting.

`react/jsx-key` with exhaustive checking — The base recommended rule catches missing keys on array items. The extended version with `checkFragmentShorthand: true` also catches missing keys on array items using fragment shorthand (`<>...</>` instead of `<React.Fragment key="...">...</React.Fragment>`).

`react/hook-use-state` — Enforces destructuring for `useState`. Non-destructured `useState` is:
- Less readable: `const emailState = useState(''); const email = emailState[0];` vs `const [email, setEmail] = useState('')`
- Inconsistent with all documentation, tutorials, and examples
- Prone to incorrect index access: `emailState[2]` doesn't exist but TypeScript won't catch it without destructuring

**Hook rules:**

`react-hooks/rules-of-hooks: 'error'` — The fundamental contract of React hooks: they must be called at the top level of a functional component or a custom hook. Not inside conditionals, loops, or nested functions. React's reconciler relies on hooks being called in the same order on every render.

When this rule is `error`, TypeScript's strict mode and the hooks rules together create a system where:
- You cannot call hooks conditionally
- You cannot call hooks in loops
- You cannot call hooks in event handlers or callbacks
- You get compile-time + lint-time enforcement of the invariants React needs

`react-hooks/exhaustive-deps: 'error'` — The most important performance and correctness rule for React. Incorrect dependency arrays produce stale closures: the effect, callback, or memo captures an outdated version of the value from a previous render and never updates.

The exhaustive-deps rule analyzes the effect/callback body and identifies all reactive values referenced inside it (state, props, context values, function parameters). Every identified value must appear in the dependency array.

Common pattern that the rule catches:

```typescript
// ❌ userId is used inside but not in deps — stale closure
function UserProfile({ userId }: { userId: string }): React.ReactElement {
  useEffect(() => {
    loadUser(userId).then(setUser);
    // If userId changes, the effect doesn't re-run — shows old user!
  }, []); // ← missing userId
}

// ✅ userId in deps — re-runs when userId changes
useEffect(() => {
  loadUser(userId).then(setUser);
}, [userId]);
```

## 14.8 Configuration Decision Matrix

When configuring the ESLint config for your specific context, use this decision matrix:

**For greenfield projects:**
- Start with all rules at their documented severity (as proposed)
- Fix violations before the first feature PR
- Budget 4–8 hours for initial cleanup

**For brownfield projects (< 50K LOC):**
- Follow the phased adoption from Section 9.1
- Start with zero-violation rules at `error`, all others at `warn`
- Budget 2–3 sprints for full adoption

**For brownfield projects (50K–500K LOC):**
- Use `@rushstack/eslint-bulk-suppressions` for initial suppression
- Phased adoption with `--max-warnings` ratchet
- Budget 6–12 months for full adoption

**For teams new to FP discipline:**
- Start with `functional/immutable-data: 'warn'` and `functional/no-let: 'warn'`
- Promote to `error` after 2 sprints of team practice
- Run a workshop on FP patterns before enforcing the rules

**For React-heavy codebases:**
- `react-hooks/exhaustive-deps: 'error'` from day one — stale closures compound quickly
- `react/no-unstable-nested-components: 'error'` — prevents performance regressions silently
- `jsx-a11y` all rules at `error` — accessibility debt is expensive to pay later

**For library authors:**
- Enable `functional/prefer-immutable-types: 'error'` (not `warn`) — library APIs should be maximally typed
- Enable `import-x/no-cycle: 'error'` — library circular deps affect all consumers
- Consider `unicorn/prefer-node-protocol` with care if supporting older Node.js versions

This reference should be updated quarterly as plugins release new rules and as the team's patterns evolve. The configuration is a living document — not a set-and-forget artifact.


---

# 15. Appendix: Quick-Start Guide and Cheat Sheets

## 15.1 The 15-Minute Setup Checklist

For teams adopting the practices in this guide, this checklist covers the minimum viable setup:

**`tsconfig.json` — mandatory settings:**

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true,
    "forceConsistentCasingInFileNames": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "skipLibCheck": true
  }
}
```

**ESLint installation (non-Dockerized setup):**

```bash
npm install -D eslint typescript-eslint @eslint/js \
  eslint-plugin-functional \
  eslint-plugin-promise \
  eslint-plugin-unicorn \
  eslint-plugin-sonarjs \
  eslint-plugin-import-x \
  eslint-import-resolver-typescript \
  eslint-plugin-react \
  eslint-plugin-react-hooks \
  eslint-plugin-jsx-a11y
```

**ESLint scripts in `package.json`:**

```json
{
  "scripts": {
    "lint": "eslint src/ --max-warnings 0",
    "lint:fix": "eslint src/ --fix",
    "typecheck": "tsc --noEmit",
    "validate": "npm run typecheck && npm run lint"
  }
}
```

**Pre-commit hooks with Husky + lint-staged:**

```bash
npm install -D husky lint-staged
npx husky init
echo 'npx lint-staged' > .husky/pre-commit
```

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix --max-warnings 0"]
  }
}
```

**`.gitignore` additions:**

```gitignore
.eslintcache
.storm/
```

## 15.2 TypeScript Clean Code Quick Reference

**The `any` alternatives:**

| Situation | Instead of `any` | Use |
|---|---|---|
| Unknown external data | `any` | `unknown` + type guard or Zod schema |
| Multiple possible types | `any` | Union type: `string \| number \| boolean` |
| JSON parse result | `any` | `unknown` with schema parse |
| Library with poor types | `any` | `@types/library-name` or `unknown` + assertion |
| Type you'll add later | `any` | `// TODO: add proper type` + `unknown` |

**Immutability quick guide:**

```typescript
// Variable level
const x = 5;                     // const — no reassignment

// Object level
interface Config {
  readonly host: string;          // readonly — no property assignment
}

// Array level
const items: ReadonlyArray<string> = ['a', 'b'];

// Deep level
type DeepReadonly<T> = { readonly [K in keyof T]: DeepReadonly<T[K]> };

// Runtime level
const frozen = Object.freeze({ key: 'value' });

// Immutable mutations (return new value)
const next = { ...current, count: current.count + 1 };  // new object
const nextArr = [...arr, newItem];                         // new array
const sorted = arr.toSorted();                             // new sorted array
```

**Discriminated union template:**

```typescript
// For async state
type AsyncState<T> =
  | { readonly status: 'idle' }
  | { readonly status: 'loading' }
  | { readonly status: 'success'; readonly data: T }
  | { readonly status: 'error'; readonly error: Error };

// For domain states
type OrderStatus =
  | { readonly kind: 'draft'; readonly items: ReadonlyArray<OrderItem> }
  | { readonly kind: 'submitted'; readonly submittedAt: Date }
  | { readonly kind: 'fulfilled'; readonly fulfilledAt: Date; readonly trackingId: string }
  | { readonly kind: 'cancelled'; readonly reason: string };

// Exhaustiveness check
const assertNever = (value: never): never => {
  throw new Error(`Unhandled: ${JSON.stringify(value)}`);
};
```

**Branded type template:**

```typescript
declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

type UserId = Brand<string, 'UserId'>;
type Email = Brand<string, 'Email'>;

const userId = (id: string): UserId => id as UserId;
const email = (addr: string): Email => {
  if (!addr.includes('@')) throw new Error(`Invalid email: ${addr}`);
  return addr as Email;
};
```

## 15.3 React Component Template

**Standard functional component:**

```typescript
interface ComponentProps {
  // Always readonly
  readonly prop1: string;
  readonly prop2?: number;
  readonly onAction: () => void;
}

// Never React.FC — explicit signature
function MyComponent({ prop1, prop2 = 0, onAction }: ComponentProps): React.ReactElement {
  // Hooks at top level — never in conditionals
  const [state, setState] = useState<StateType>({ /* ... */ });

  // Callbacks memoized when: (a) used in useEffect deps, (b) passed to React.memo children
  const handleClick = useCallback((): void => {
    onAction();
  }, [onAction]); // complete dependency array — no cheating

  return (
    <div>
      {/* accessible JSX */}
    </div>
  );
}
```

**Custom hook template:**

```typescript
// Return type explicitly declared
interface UseFeatureResult {
  readonly data: FeatureData | null;
  readonly isLoading: boolean;
  readonly error: Error | null;
  readonly refresh: () => void;
}

function useFeature(featureId: string): UseFeatureResult {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['feature', featureId],
    queryFn: () => fetchFeature(featureId),
  });

  return {
    data: data ?? null,
    isLoading,
    error: error as Error | null,
    refresh: refetch,
  };
}
```

## 15.4 ESLint Rule Severity Reference Card

**Always `error` (never lower):**

| Rule | Why |
|---|---|
| `@typescript-eslint/no-floating-promises` | Unhandled Promises → silent failures |
| `@typescript-eslint/no-misused-promises` | Promise in sync position → hidden bugs |
| `@typescript-eslint/no-unsafe-*` family | `any` propagation → runtime type errors |
| `@typescript-eslint/switch-exhaustiveness-check` | Missed union cases → runtime errors |
| `functional/immutable-data` | Mutation bugs → aliasing, race conditions |
| `functional/no-let` | Mutable variables → mutation accumulation |
| `import-x/no-cycle` | Circular imports → initialization failures |
| `react-hooks/rules-of-hooks` | Rules of Hooks violations → runtime crashes |
| `react-hooks/exhaustive-deps` | Stale closures → silent data corruption |
| All `jsx-a11y` recommended rules | Accessibility regressions affect real users |
| `sonarjs/cognitive-complexity` | Unmaintainable code accumulation |
| `unicorn/no-abusive-eslint-disable` | Uncontrolled suppression defeats linting |

**Always `warn` (aspirational, not blocking):**

| Rule | Why warn instead of error |
|---|---|
| `functional/prefer-immutable-types` | Library types aren't always readonly |
| `unicorn/prevent-abbreviations` | Style change requiring gradual adoption |
| `react/no-array-index-key` | Exceptions exist for static lists |
| `react/prefer-read-only-props` | Third-party component types |

**Always `off` for React/FP code:**

| Rule | Why off |
|---|---|
| `functional/no-classes` | Framework integration requires classes |
| `functional/no-expression-statements` | JSX and effects need expression statements |
| `functional/functional-parameters` | Zero-arity and rest params are idiomatic |
| `unicorn/no-null` | React component pattern returns null |
| `unicorn/no-array-reduce` | FP code uses reduce deliberately |

## 15.5 Common ESLint Error Messages and Their Fixes

**`@typescript-eslint/no-floating-promises`:**
```
Promises must be awaited, end with a call to .catch, end with a call to .then with a rejection handler or be explicitly marked as ignored with the `void` operator.
```

Fix options:
1. `await fn()` — await the Promise
2. `void fn()` — explicit fire-and-forget (acknowledged, not awaited)
3. `fn().catch(handleError)` — catch the error
4. `return fn()` — return to the caller for them to handle

**`@typescript-eslint/no-unsafe-assignment`:**
```
Unsafe assignment of an `any` value.
```

Fix: Parse the value with a schema (Zod) or narrow with a type guard before assignment.

**`functional/immutable-data`:**
```
Modifying an existing object/array is not allowed.
```

Fix: Return a new object/array with the modification:
- `{ ...obj, prop: newValue }` for object property change
- `[...arr, newItem]` for array append
- `arr.toSorted()` for sorted copy

**`import-x/no-cycle`:**
```
Dependency cycle detected.
```

Fix: Extract shared types to a neutral module, or restructure so one module depends on the other (not both on each other).

**`sonarjs/cognitive-complexity`:**
```
Refactor this function to reduce its Cognitive Complexity from X to the 15 allowed.
```

Fix: Decompose into smaller functions. Extract named helper functions for each branch. Convert nested if/else into early returns.

**`react-hooks/exhaustive-deps`:**
```
React Hook useEffect has a missing dependency: 'someValue'. Either include it or remove the dependency array.
```

Fix: Add `someValue` to the dependency array. If this causes infinite loops, restructure the value to be stable (useCallback, useMemo, move outside the component, or use useRef).

## 15.5.1 The Lifecycle of an eslint-disable Comment

A well-governed `eslint-disable` comment has this lifecycle:

1. **Creation** — engineer encounters a rule violation that cannot be fixed immediately (third-party API type, migration in progress, legitimate exception). They add a targeted, documented disable:
   ```typescript
   // eslint-disable-next-line @typescript-eslint/no-explicit-any -- External payment API v1 returns untyped JSON before our adapter transforms it. Tracked in #4521
   const rawPayment: any = await paymentApi.getTransaction(id);
   ```

2. **Review** — in code review, the reviewer verifies: (a) the rule name is specific, (b) the reason is documented, (c) there isn't a better alternative that avoids the disable.

3. **Tracking** — the CI pipeline counts all disable comments. The count appears in the PR metrics. If the count increased, the PR author explains why.

4. **Quarterly review** — the team reviews all existing disables. Each is evaluated: is it still necessary? Has the underlying issue (tracked in #4521) been fixed? Can it be removed?

5. **Removal** — when the underlying problem is resolved (the payment API is updated, the migration completes), the disable comment is removed.

This lifecycle transforms `eslint-disable` from technical debt accumulator into a tracked, time-limited exception with accountability.

## 15.5.2 Reading ESLint Output

ESLint output in the terminal follows a predictable format. Understanding it speeds up debugging:

```
src/features/cart/hooks/useCart.ts
  45:12  error  Promises must be awaited, end with a call to .catch...  @typescript-eslint/no-floating-promises
  67:5   error  Do not use mutable variables. Use 'const' instead.      functional/no-let
  89:1   warn   Refactor to reduce Cognitive Complexity from 18 to 15.  sonarjs/cognitive-complexity

✖ 2 errors, 1 warning (3 problems)
```

Each line: `file:line:column  severity  message  rule-id`

The rule-id (last field) is what you use in `eslint-disable-next-line`. The severity (`error`/`warn`) tells you whether this blocks CI. The message tells you what needs to change.

For the full documentation on any rule, use:
```bash
# Open rule docs in browser
open "https://typescript-eslint.io/rules/no-floating-promises/"
open "https://eslint.org/docs/rules/no-let"
open "https://sonarsource.github.io/rspec/#/rspec/S3776"
```

## 15.6 Principles Summary

Ten principles that underpin all the specific rules in this guide:

1. **The compiler is a collaborator.** When TypeScript raises an error, the question is "what is the compiler seeing?" not "how do I silence this?"

2. **Types are documentation.** A well-typed function signature is more reliable than a JSDoc comment because the compiler enforces it.

3. **Invalid states are unrepresentable.** Design types to make impossible states impossible to express, not merely handled.

4. **Parse, don't validate.** Transform untyped external data into typed data at system boundaries. Work with typed data inside the system.

5. **Immutability by default.** `const` and `readonly` are the defaults. `let` and mutation are justified exceptions.

6. **Pure functions are the unit of testability.** The more pure functions, the faster and more reliable the test suite.

7. **Handle all Promises.** An unhandled Promise is a silent failure. `await` or `.catch()` — never neither.

8. **Explicit contracts.** Exported function return types, discriminated unions, branded types — explicit is better than inferred for public APIs.

9. **Features, not files.** Module structure should reflect domain structure. Code that changes together belongs together.

10. **Rules enforce agreements, not preferences.** Every ESLint rule should correspond to a principle the team has agreed on. Mechanical enforcement of agreed principles, not arbitrary gatekeeping.

---

## 15.7 Repository Changes Made by This Guide

Beyond the `eslint.config.ts` update in Section 8, this guide prompted two repository changes:

**`.gitignore` — added `.storm` directory:**

The STORM research artifacts live in `.storm/modern-typescript-clean-code/` and should not be tracked in version control. The following line was added to `.gitignore`:

```gitignore
.storm
```

This prevents the research materials, intermediate drafts, conversation transcripts, and source JSON files from appearing in the repository's history or status output.

**`config/eslint.config.ts` — proposed replacement:**

The proposed configuration in Section 8.3 is a drop-in replacement for the existing `config/eslint.config.ts`. The key changes:

1. Imports four new plugins: `eslint-plugin-unicorn`, `eslint-plugin-sonarjs`, `eslint-plugin-import-x`, `eslint-import-resolver-typescript`
2. Switches from `eslint.configs.all` to `eslint.configs.recommended` as the core ESLint base
3. Adds `tseslint.configs.stylisticTypeChecked` alongside `strictTypeChecked`
4. Introduces a global `ignores` block for generated files and build output
5. Separates React rules into a `**/*.tsx` and `**/*.jsx` files-only config block
6. Adds explicit rule configurations for all new plugins with inline rationale comments

The Dockerfile change (adding four new npm packages) in Section 8.2 must accompany the `eslint.config.ts` change for the Docker-based linting workflow to work correctly.

Both files benefit from being updated in a single commit so that the config and the available plugins are always in sync. A config that references an uninstalled plugin fails at parse time before any linting occurs.

---

*This document was produced using the STORM deep research methodology — structured, multi-perspective research followed by section-by-section writing from a closed reference set. All 42 sources cited in the References section (Section 10) were consulted during the research phase; none were consulted during the writing phase. The resulting article reflects the 2024–2025 TypeScript community consensus as documented in those sources, combined with analysis of the `eslint-dockerized` repository's existing configuration.*

---

## 15.8 Glossary

**`any`** — TypeScript's escape hatch type. Disables all type checking for a value. Should be avoided; use `unknown` for data whose type is genuinely unknown and narrow with type guards or schema parsers.

**Barrel file** — An `index.ts` file that re-exports from multiple other files in the same directory. Helpful at deliberate public API boundaries; harmful when used for convenience throughout a codebase (breaks tree-shaking, creates circular dependency risk).

**Branded type** — A TypeScript pattern that adds a phantom type discriminant to a primitive type, creating nominal (name-based) typing on top of TypeScript's structural type system. Used to prevent semantic confusion (UserId vs OrderId, both strings).

**Cognitive complexity** — A metric for how hard a function is to understand. Unlike cyclomatic complexity (which counts paths), cognitive complexity weighs nesting depth and sequential structure breaks. Enforced by `sonarjs/cognitive-complexity`.

**Discriminated union** — A union type where each member has a shared "discriminant" property with a unique literal value. TypeScript narrows the type based on the discriminant, enabling exhaustive checking and making invalid states unrepresentable.

**ESM (ECMAScript Modules)** — The standard JavaScript module system using `import`/`export`. Replaces CommonJS (`require`/`module.exports`). Required by `verbatimModuleSyntax` and enforced by `unicorn/prefer-module`.

**Flat config** — ESLint's configuration format introduced as default in v9. Uses `eslint.config.ts` (or `.js`/`.mjs`) instead of `.eslintrc`. An explicit array of config objects with no cascading.

**FP (Functional Programming)** — A programming paradigm that treats computation as the evaluation of mathematical functions, emphasizing immutability, pure functions, and function composition.

**Immutability** — The property of data that cannot be changed after creation. In TypeScript: `const` for bindings, `readonly` for properties, `ReadonlyArray<T>` for arrays, `.toSorted()`/`.toReversed()` for immutable mutations.

**Parse, don't validate** — A design principle: transform untyped external data into typed data at system boundaries using schema parsers (Zod, Valibot), then work with typed data inside the system without repeated validation.

**Project references** — TypeScript's feature for monorepo builds where packages declare explicit dependencies on other packages, enabling incremental compilation and build-time architectural boundary enforcement.

**Pure function** — A function that (1) always returns the same value for the same arguments and (2) produces no observable side effects. Pure functions are trivially testable and can be reasoned about in isolation.

**`satisfies` operator** — TypeScript 4.9+ operator that validates a value against a type while preserving the most specific inferred type. Preferred over type annotations for configuration objects and similar structures.

**Type guard** — A function or expression that narrows a TypeScript type at a specific location in code. Example: `if (typeof x === 'string')` narrows `x` from `string | number` to `string`.

**Vertical slice** — A module organization approach where code is grouped by feature/domain rather than by technical role. All code for the "cart" feature lives in one directory; all code for "checkout" in another.

**`verbatimModuleSyntax`** — TypeScript 5.0 compiler option that requires `import type` for type-only imports and `import` for value imports. Ensures correct behavior with bundlers that strip types independently of the TypeScript compiler.
