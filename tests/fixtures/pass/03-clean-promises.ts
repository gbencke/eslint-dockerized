/**
 * PASS fixture: Clean async / Promise patterns
 *
 * Demonstrates the async discipline enforced by the config:
 *
 *  - Every Promise is awaited, caught, or explicitly returned
 *    (@typescript-eslint/no-floating-promises)
 *  - async functions always contain at least one await
 *    (@typescript-eslint/require-await)
 *  - return await is used inside try-catch so errors are caught locally
 *    (@typescript-eslint/return-await)
 *  - .then() chains always end with .catch() or are returned
 *    (promise/catch-or-return)
 *  - Promises used in Promise.all / Promise.allSettled are fully handled
 *  - No misuse of async in positions that expect synchronous callbacks
 *    (@typescript-eslint/no-misused-promises)
 */

// ── Domain types ──────────────────────────────────────────────────────────

interface User {
  readonly id: string;
  readonly name: string;
  readonly email: string;
}

interface Order {
  readonly id: string;
  readonly userId: string;
  readonly total: number;
}

// ── Simulated async service (pure stubs — no real I/O) ────────────────────

const fetchUser = async (id: string): Promise<User> =>
  Promise.resolve({ id, name: 'Alice', email: 'alice@example.com' });

const fetchOrders = async (userId: string): Promise<readonly Order[]> =>
  Promise.resolve([{ id: 'ord-1', userId, total: 99.99 }]);

const sendNotification = (email: string, message: string): Promise<void> => {
  // Side effect isolated here; callers await this function.
  void `sending ${message} to ${email}`;
  return Promise.resolve();
};

// ── Properly awaited async operations ────────────────────────────────────

/**
 * All Promises are awaited. Return type is explicit.
 * return await inside try-catch: if fetchUser rejects, the error is caught
 * locally rather than propagating as an unhandled rejection to the caller.
 */
const getUserSafe = async (id: string): Promise<User | null> => {
  try {
    return await fetchUser(id);
  } catch {
    return null;
  }
};

/**
 * Parallel fetching with Promise.all — fully awaited.
 * The resulting tuple is typed precisely from the resolved values.
 */
const getUserWithOrders = async (
  userId: string
): Promise<{ readonly user: User; readonly orders: readonly Order[] }> => {
  const [user, orders] = await Promise.all([
    fetchUser(userId),
    fetchOrders(userId),
  ]);
  return { user, orders };
};

/**
 * Void operator used deliberately for fire-and-forget.
 * The `void` prefix makes the intent explicit — the Promise is discarded on
 * purpose, not by accident. This satisfies no-floating-promises with the
 * ignoreVoid option.
 */
const notifyAsync = (userId: string): undefined => {
  void sendNotification(`user-${userId}@example.com`, 'Welcome!');
  return undefined;
};

/**
 * Promise chain with .catch() — satisfies promise/catch-or-return.
 */
const fetchUserWithFallback = (id: string): Promise<User> =>
  fetchUser(id).catch((): User => ({
    id,
    name: 'Unknown',
    email: 'unknown@example.com',
  }));

// ── Named exports ─────────────────────────────────────────────────────────

export {
  getUserSafe,
  getUserWithOrders,
  notifyAsync,
  fetchUserWithFallback,
};

export type { User, Order };
