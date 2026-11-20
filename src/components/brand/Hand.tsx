/** Animated pointing hand (pokeY / pokeX animations live in styles.css). */
export function HandSvg() {
  return (
    <svg viewBox="0 0 44 56">
      <g fill="#ffe0b8" stroke="#0f172a" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round">
        <rect x="15" y="3" width="10" height="30" rx="5" />
        <rect x="9" y="24" width="30" height="28" rx="12" />
        <rect x="2" y="29" width="12" height="13" rx="6" transform="rotate(-18 8 35)" />
      </g>
      <path d="M27 34v8M33 34v8" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <rect x="16" y="22" width="8" height="8" fill="#ffe0b8" />
    </svg>
  );
}

/** variant: "up cardh2" | "rt" | "up navh" | "dn" … (same class names as the original). */
export function Hand({ variant }: { variant: string }) {
  return (
    <span className={`hand ${variant}`}>
      <HandSvg />
    </span>
  );
}

/** Same markup as the original HAND_SVG string, for imperative (non-React) game code. */
export const HAND_SVG =
  '<svg viewBox="0 0 44 56"><g fill="#ffe0b8" stroke="#0f172a" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><rect x="15" y="3" width="10" height="30" rx="5"/><rect x="9" y="24" width="30" height="28" rx="12"/><rect x="2" y="29" width="12" height="13" rx="6" transform="rotate(-18 8 35)"/></g><path d="M27 34v8M33 34v8" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round" fill="none"/><rect x="16" y="22" width="8" height="8" fill="#ffe0b8"/></svg>';
