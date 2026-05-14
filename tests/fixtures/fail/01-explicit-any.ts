/**
 * FAIL fixture — target rule: @typescript-eslint/no-explicit-any
 *
 * Using `any` disables TypeScript's type checking for a value. It is the
 * single most common way to accidentally introduce runtime bugs in a TypeScript
 * codebase. Once a value is typed as `any`, every operation on it — property
 * access, function call, assignment to typed variables — silently bypasses all
 * type checks, and errors only surface at runtime.
 *
 * The rule fires on every explicit `any` annotation in the source.
 *
 * Correct alternatives:
 *   - `unknown` for data whose type is genuinely unknown, narrowed via guards
 *   - Union types when multiple known types are possible
 *   - Generics when the type is polymorphic but still constrained
 *   - Zod / Valibot for validating and typing external data at boundaries
 */

// ❌ Function parameter typed as any — all callers bypass type checking
export const processData = (data: any): string => {  // any
  // Accessing any properties on `data` produces more `any` values
  return String(data.value);
};

// ❌ Return type any — callers receive untyped values
export const parseResponse = (raw: string): any => {  // any
  return JSON.parse(raw);
};

// ❌ Variable annotation as any — defeats the type system entirely
export const runPipeline = (): void => {
  const config: any = { timeout: 5000 };  // any
  console.log(config.timeout);
};
