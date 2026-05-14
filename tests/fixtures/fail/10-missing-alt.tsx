/**
 * FAIL fixture — target rule: jsx-a11y/alt-text
 *
 * Screen readers announce image elements to visually impaired users by reading
 * the `alt` attribute. Without it, the screen reader either reads the file
 * path (meaningless noise) or skips the image entirely (missing content).
 *
 * The rule requires:
 *   - Informative images: alt text that describes the content or function
 *   - Decorative images: alt="" (empty string) so screen readers skip them
 *   - Icon buttons: aria-label on the button, or alt on the img inside
 *
 * The rule fires on <img> elements without any alt prop, regardless of whether
 * the image is purely decorative. The developer must make the explicit choice.
 *
 * Other jsx-a11y rules in the config that complement this one:
 *   - anchor-has-content: links must have accessible text
 *   - button-has-type: explicit type prevents accidental form submission
 *   - click-events-have-key-events: clicks need keyboard equivalents
 */

interface AvatarProps {
  readonly src: string;
  readonly username: string;
}

// ❌ img without any alt prop — jsx-a11y/alt-text fires
export function UserAvatar({ src }: AvatarProps): JSX.Element {
  return <img src={src} width={64} height={64} />;  // ← missing alt
}

// ❌ Decorative separator without alt="" — screen readers read the src path
export function Divider(): JSX.Element {
  return <img src="/images/divider.svg" />;  // ← missing alt (should be alt="")
}
