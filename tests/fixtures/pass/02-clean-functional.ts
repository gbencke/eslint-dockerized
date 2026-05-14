/**
 * PASS fixture: Clean functional programming patterns
 *
 * Demonstrates the FP discipline enforced by eslint-plugin-functional:
 *
 *  - const everywhere, no let (functional/no-let)
 *  - readonly on all type properties (functional/prefer-immutable-types)
 *  - No object or array mutation — spread + immutable array methods instead
 *    (functional/immutable-data)
 *  - Property signatures in interfaces, not method signatures
 *    (functional/prefer-property-signatures)
 *  - Pure functions: same input → same output, no side effects
 *  - for-of instead of indexed loops (unicorn/no-for-loop)
 *  - Array.prototype.includes() instead of indexOf !== -1 (unicorn/prefer-includes)
 *  - Modern immutable array methods: toSorted(), toReversed(), with()
 */

// ── Pure data types ───────────────────────────────────────────────────────

interface Product {
  readonly id: string;
  readonly name: string;
  readonly price: number;
  readonly category: string;
}

interface Cart {
  readonly items: readonly CartItem[];
  readonly discountPercent: number;
}

interface CartItem {
  readonly product: Product;
  readonly quantity: number;
}

// ── Pure transformation functions ─────────────────────────────────────────

/**
 * Returns a new CartItem with an updated quantity.
 * Does NOT mutate the input — returns a new object via spread.
 */
const withQuantity = (item: CartItem, quantity: number): CartItem => ({
  ...item,
  quantity,
});

/**
 * Calculates the subtotal for a single cart item.
 * Pure: depends only on inputs, produces no side effects.
 */
const itemSubtotal = (item: CartItem): number =>
  item.product.price * item.quantity;

/**
 * Calculates the total price of the cart after applying the discount.
 * Uses Array.prototype.reduce for aggregation (functional/no-array-reduce: off).
 */
const cartTotal = (cart: Cart): number => {
  const subtotal = cart.items.reduce((sum, item) => sum + itemSubtotal(item), 0);
  return subtotal * (1 - cart.discountPercent / 100);
};

/**
 * Returns a new cart with the given item appended.
 * Spread creates a new array — no push() mutation.
 */
const addItem = (cart: Cart, item: CartItem): Cart => ({
  ...cart,
  items: [...cart.items, item] as readonly CartItem[],
});

/**
 * Returns a new cart with the item at the given index removed.
 * toSpliced() is the ES2023 immutable equivalent of splice().
 */
const removeItem = (cart: Cart, index: number): Cart => ({
  ...cart,
  items: (cart.items as CartItem[]).toSpliced(index, 1),
});

/**
 * Returns the cart items sorted by price ascending.
 * toSorted() is the ES2023 immutable equivalent of sort().
 */
const sortedByPrice = (cart: Cart): readonly CartItem[] =>
  (cart.items as CartItem[]).toSorted((a, b) => a.product.price - b.product.price);

/**
 * Returns only items in the specified category.
 * for-of used for iteration; Array.includes() for membership check.
 */
const filterByCategories = (
  items: readonly CartItem[],
  categories: readonly string[]
): readonly CartItem[] =>
  items.filter(item => categories.includes(item.product.category));

// ── Interface with property signatures (not method signatures) ────────────

interface CartRepository {
  readonly findById:   (id: string) => Promise<Cart | null>;
  readonly save:       (cart: Cart) => Promise<void>;
  readonly deleteById: (id: string) => Promise<void>;
}

// ── Named exports ─────────────────────────────────────────────────────────

export {
  withQuantity,
  itemSubtotal,
  cartTotal,
  addItem,
  removeItem,
  sortedByPrice,
  filterByCategories,
};

export type { Product, Cart, CartItem, CartRepository };
