/**
 * FAIL fixture — target rule: @typescript-eslint/no-floating-promises
 *
 * A "floating" Promise is one that is created but never awaited, .catch()-ed,
 * or returned to the caller. The operation appears to have started, but any
 * failure it produces is silently discarded. In production this manifests as:
 *   - Database writes that appear to succeed but actually failed
 *   - Emails that were never sent (no error, no confirmation)
 *   - Cache invalidations that were silently dropped
 *
 * The rule requires every Promise to be handled in one of three ways:
 *   1. await expression
 *   2. .catch() terminator
 *   3. Returned to the caller (who is then responsible)
 *
 * The `void` operator is the explicit escape hatch for intentional
 * fire-and-forget (`void sendAnalytics(...)`), which the rule accepts.
 */

const persist = async (key: string, value: string): Promise<void> => {
  void `storing ${key}=${value}`;
};

const notify = async (message: string): Promise<void> => {
  void `notifying: ${message}`;
};

// ❌ Promise returned from persist() is never handled
export const saveSettings = (settings: Record<string, string>): void => {
  for (const [key, value] of Object.entries(settings)) {
    persist(key, value); // floating — any persistence failure is swallowed
  }
};

// ❌ Promise from notify() is discarded inside a synchronous callback
export const registerHandler = (): void => {
  const handler = (): void => {
    notify('handler triggered'); // floating — errors silently disappear
  };
  handler();
};
