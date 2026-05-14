/**
 * FAIL fixture — target rule: promise/catch-or-return
 *
 * A `.then()` callback that is neither followed by `.catch()` nor returned to
 * the caller leaves rejections unhandled. The Promise chain produces no
 * observable failure signal — errors are silently swallowed, and the side
 * effect (the `.then()` callback) may or may not have run.
 *
 * The rule requires that every Promise chain ends with one of:
 *   1. .catch(handler)   — handles the rejection locally
 *   2. return promise    — delegates handling to the caller
 *   3. await             — surfaced to the async function's error channel
 *
 * Correct patterns:
 *   fetchUser(id).then(process).catch(handleError);        // caught
 *   return fetchUser(id).then(process);                    // returned
 *   const user = await fetchUser(id); process(user);       // awaited
 */

const fetchUser = (id: string): Promise<{ readonly name: string }> =>
  Promise.resolve({ name: `User-${id}` });

const processUser = (user: { readonly name: string }): void => {
  void `processed ${user.name}`;
};

// ❌ .then() chain with no .catch() and not returned — promise/catch-or-return
export const loadAndProcess = (userId: string): void => {
  fetchUser(userId).then(processUser); // rejection silently discarded
};

// ❌ Chained .then() without terminal .catch() or return
export const loadAndTransform = (userId: string): void => {
  fetchUser(userId)
    .then((user) => user.name.toUpperCase())
    .then((name) => void `transformed: ${name}`); // no .catch() at the end
};
