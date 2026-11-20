/** Pink piggy mascot (identical vector to the original). */
export function PiggyMascot({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-float">
      <rect x="25" y="10" width="14" height="4" rx="2" fill="#f59e0b" />
      <path d="M16 22L12 11L24 16Z" fill="#f472b6" />
      <path d="M48 22L52 11L40 16Z" fill="#f472b6" />
      <ellipse cx="32" cy="35" rx="22" ry="19" fill="#f9a8d4" stroke="#ec4899" strokeWidth="2" />
      <ellipse cx="32" cy="39" rx="9" ry="6.5" fill="#fbcfe8" stroke="#ec4899" strokeWidth="1.8" />
      <circle cx="29" cy="39" r="1.8" fill="#be185d" />
      <circle cx="35" cy="39" r="1.8" fill="#be185d" />
      <circle cx="22" cy="30" r="2.5" fill="#1e293b" />
      <circle cx="42" cy="30" r="2.5" fill="#1e293b" />
      <circle cx="22.8" cy="29.2" r="0.9" fill="#ffffff" />
      <circle cx="42.8" cy="29.2" r="0.9" fill="#ffffff" />
      <rect x="19" y="51" width="7" height="6" rx="3" fill="#ec4899" />
      <rect x="38" y="51" width="7" height="6" rx="3" fill="#ec4899" />
    </svg>
  );
}
