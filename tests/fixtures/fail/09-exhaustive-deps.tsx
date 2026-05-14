/**
 * FAIL fixture — target rule: react-hooks/exhaustive-deps
 *
 * The `exhaustive-deps` rule verifies that every reactive value used inside a
 * useEffect, useCallback, or useMemo is listed in its dependency array.
 *
 * A missing dependency creates a STALE CLOSURE: the effect captures the value
 * from the render in which it was created, and never re-runs when the value
 * changes. The component then shows stale data while appearing to work
 * correctly — one of the most difficult React bugs to diagnose.
 *
 * The rule also flags:
 *   - Object/array literals in dep arrays (new reference every render → infinite loop)
 *   - Functions defined inline in the component (same issue as above)
 *   - Unnecessary deps that are not used inside the effect
 *
 * The fix is always:
 *   a) Add the missing dep to the array (most common)
 *   b) Move the value outside the component if it never changes
 *   c) Wrap with useCallback/useMemo if the value must be stable
 */

import { useState, useEffect } from 'react';

interface Post {
  readonly id: string;
  readonly title: string;
  readonly body: string;
}

// ❌ userId and postId are used inside the effect but missing from the dep array
export function PostDetail({
  userId,
  postId,
}: {
  readonly userId: string;
  readonly postId: string;
}): JSX.Element {
  const [post, setPost] = useState<Post | null>(null);

  useEffect(() => {
    // This closure captures userId and postId from the current render.
    // If either prop changes, the effect will NOT re-run — it will keep
    // showing data for the OLD userId/postId combination.
    void fetch(`/api/users/${userId}/posts/${postId}`)
      .then((res) => res.json() as Promise<Post>)
      .then(setPost);
  }, []); // ← exhaustive-deps: missing 'userId' and 'postId'

  if (post === null) return <div>Loading…</div>;
  return (
    <article>
      <h2>{post.title}</h2>
      <p>{post.body}</p>
    </article>
  );
}
