/**
 * PASS fixture: Clean React functional component patterns
 *
 * Demonstrates the React discipline enforced by the config:
 *
 *  - Explicit function signature instead of React.FC
 *    (drops the implicit children prop anti-pattern)
 *  - Explicit JSX.Element return type
 *  - Discriminated union props for mutually exclusive variants
 *  - readonly on all prop interfaces (functional/prefer-immutable-types)
 *  - useState destructured (react/hook-use-state)
 *  - Complete useEffect dependency array (react-hooks/exhaustive-deps)
 *  - useCallback only where it stabilises a dep for another hook
 *  - Self-closing elements (react/self-closing-comp)
 *  - img with descriptive alt text (jsx-a11y/alt-text)
 *  - button has explicit type attribute (jsx-a11y/button-has-type)
 *  - Named export, not default (import-x/no-default-export)
 */

import { useState, useEffect, useCallback } from 'react';

// ── Discriminated union props ─────────────────────────────────────────────

type AlertVariant =
  | { readonly variant: 'info';    readonly message: string }
  | { readonly variant: 'success'; readonly message: string }
  | { readonly variant: 'error';   readonly message: string; readonly onRetry?: () => void };

// ── Simple presentational component ──────────────────────────────────────

function Alert(props: AlertVariant): JSX.Element {
  return (
    <div className={`alert alert-${props.variant}`} role="alert">
      <p>{props.message}</p>
      {props.variant === 'error' && props.onRetry !== undefined && (
        <button type="button" onClick={props.onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

// ── Component with hooks ──────────────────────────────────────────────────

interface UserCardProps {
  readonly userId: string;
  readonly onSelect: (id: string) => void;
}

interface UserData {
  readonly name: string;
  readonly avatarUrl: string;
}

// Simulated fetch — not a real side effect in tests
const fetchUserData = async (id: string): Promise<UserData> =>
  Promise.resolve({ name: `User ${id}`, avatarUrl: `/avatars/${id}.png` });

function UserCard({ userId, onSelect }: UserCardProps): JSX.Element {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // useEffect with complete dependency array — no stale closure.
  // async/await inside useEffect via an inner async function avoids the
  // promise/always-return issue that arises with .then() callbacks.
  useEffect(() => {
    const load = async (): Promise<void> => {
      const data = await fetchUserData(userId);
      setUserData(data);
      setIsLoading(false);
    };
    void load();
  }, [userId]); // userId is the only reactive value used inside

  // useCallback stabilises the handler so it can be a useEffect dependency
  const handleClick = useCallback((): void => {
    onSelect(userId);
  }, [onSelect, userId]);

  if (isLoading) {
    return <div aria-busy="true">Loading…</div>;
  }

  if (userData === null) {
    return <div>User not found</div>;
  }

  return (
    <div className="user-card">
      {/* img has descriptive alt text — jsx-a11y/alt-text satisfied */}
      <img
        src={userData.avatarUrl}
        alt={`${userData.name}'s avatar`}
        width={64}
        height={64}
      />
      <p>{userData.name}</p>
      {/* button has explicit type — jsx-a11y/button-has-type satisfied */}
      <button type="button" onClick={handleClick}>
        Select
      </button>
    </div>
  );
}

// ── Named exports ─────────────────────────────────────────────────────────

export { Alert, UserCard };
export type { AlertVariant, UserCardProps };
