import type { AvatarStyle } from "@/types/finova";

const PALETTES: Record<AvatarStyle, { hair: string; bow: string; shirt: string; skin: string }> = {
  valeria: { hair: "#4c1d95", bow: "#f59e0b", shirt: "#10b981", skin: "#fed7aa" },
  sofia: { hair: "#7c2d12", bow: "#ec4899", shirt: "#0ea5e9", skin: "#fde68a" },
  camila: { hair: "#1e293b", bow: "#a855f7", shirt: "#f59e0b", skin: "#fed7aa" },
  mariana: { hair: "#9a3412", bow: "#10b981", shirt: "#ec4899", skin: "#ffedd5" },
};

export function StudentAvatar({ style = "valeria", size = 76 }: { style?: AvatarStyle | string; size?: number }) {
  const p = PALETTES[style as AvatarStyle] || PALETTES.valeria;
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="88" height="88" rx="24" fill="#064e3b" stroke="#fbbf24" strokeWidth="3.5" />
      <circle cx="48" cy="46" r="27" fill={p.hair} />
      <circle cx="26" cy="54" r="11" fill={p.hair} />
      <circle cx="70" cy="54" r="11" fill={p.hair} />
      <path d="M24 84C24 71 34 65 48 65C62 65 72 71 72 84" fill={p.shirt} />
      <circle cx="48" cy="73" r="4" fill="#fde047" />
      <rect x="43" y="55" width="10" height="12" rx="5" fill={p.skin} />
      <circle cx="48" cy="44" r="20" fill={p.skin} />
      <path d="M28 40C30 27 42 23 48 23C54 23 66 27 68 40C62 34 55 33 48 35C41 33 34 34 28 40Z" fill={p.hair} />
      <path d="M48 22L40 16V26L48 22ZM48 22L56 16V26L48 22Z" fill={p.bow} />
      <circle cx="48" cy="22" r="3" fill="#fef08a" />
      <circle cx="41" cy="44" r="2.7" fill="#1e293b" />
      <circle cx="55" cy="44" r="2.7" fill="#1e293b" />
      <circle cx="42" cy="43" r="1" fill="#ffffff" />
      <circle cx="56" cy="43" r="1" fill="#ffffff" />
      <ellipse cx="36" cy="49" rx="3.2" ry="1.8" fill="#fb7185" fillOpacity="0.55" />
      <ellipse cx="60" cy="49" rx="3.2" ry="1.8" fill="#fb7185" fillOpacity="0.55" />
      <path d="M43 51C45 54 51 54 53 51" stroke="#be123c" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}
