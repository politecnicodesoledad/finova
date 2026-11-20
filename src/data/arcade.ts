export type DifficultyId = "exploradora" | "estratega" | "maestra";

export interface DifficultyConfig {
  id: DifficultyId;
  label: string;
  badge: string;
  multiplier: number;
  spawnInterval: number;
  speedScale: number;
  hazardChance: number;
  color: string;
  desc: string;
}

export const DIFFICULTY_CONFIGS: Record<DifficultyId, DifficultyConfig> = {
  exploradora: {
    id: "exploradora",
    label: "Exploradora",
    badge: "Fácil • x1 Monedas",
    multiplier: 1.0,
    spawnInterval: 0.82,
    speedScale: 0.85,
    hazardChance: 0.22,
    color: "emerald",
    desc: "Ritmo suave ideal para practicar y atrapar monedas sin afán.",
  },
  estratega: {
    id: "estratega",
    label: "Estratega",
    badge: "Normal • x1.5 Monedas",
    multiplier: 1.5,
    spawnInterval: 0.62,
    speedScale: 1.15,
    hazardChance: 0.3,
    color: "amber",
    desc: "Más velocidad, diamantes brillantes y +50% de monedas extra.",
  },
  maestra: {
    id: "maestra",
    label: "Maestra FINOVA",
    badge: "Difícil • x2 Monedas",
    multiplier: 2.0,
    spawnInterval: 0.44,
    speedScale: 1.48,
    hazardChance: 0.38,
    color: "rose",
    desc: "¡Lluvia turbo de tesoros y gastos hormiga con DOBLE recompensa!",
  },
};
