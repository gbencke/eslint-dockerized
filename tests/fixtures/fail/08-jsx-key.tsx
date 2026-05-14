/**
 * FAIL fixture — target rule: react/jsx-key
 *
 * React's reconciler uses the `key` prop to identify which items in a list
 * have changed, been added, or been removed. Without keys, React re-renders
 * every list item on every change — at best a performance problem, at worst
 * subtle state bugs where the wrong component instance retains state after
 * a reorder.
 *
 * The rule requires a `key` prop on every element produced inside:
 *   - Array.prototype.map() calls
 *   - Array literals of JSX elements
 *   - Fragment shorthand (<>...</>) when used in arrays
 *
 * The key must be:
 *   - Stable: derived from the item's identity (its id), not its array index
 *   - Unique among siblings in the list
 *   - NOT the array index (react/no-array-index-key warns on this separately)
 */

interface Product {
  readonly id: string;
  readonly name: string;
  readonly price: number;
}

// ❌ No key prop on the <li> element inside map() — react/jsx-key fires
export function ProductList({ products }: { readonly products: readonly Product[] }): JSX.Element {
  return (
    <ul>
      {products.map((product) => (
        <li>{product.name} — ${product.price}</li>  // ← missing key
      ))}
    </ul>
  );
}

// ❌ No key on array literal of JSX elements
export function CategoryBadges({ categories }: { readonly categories: readonly string[] }): JSX.Element {
  const badges = categories.map((cat) => <span className="badge">{cat}</span>); // ← missing key
  return <div>{badges}</div>;
}
