export function formatCOP(num: number): string {
  return "$ " + Math.round(num).toLocaleString("es-CO");
}

const LEVEL_TITLES = [
  "Aprendiz del Ahorro",
  "Exploradora Financiera",
  "Estratega Inteligente",
  "Capitana del Presupuesto",
  "Maestra FINOVA",
];

export function getLevelInfo(xp: number) {
  const level = Math.floor(xp / 250) + 1;
  const currentLevelXP = xp % 250;
  const nextLevelXP = 250;
  return {
    level,
    currentLevelXP,
    nextLevelXP,
    percent: Math.min(100, Math.round((currentLevelXP / nextLevelXP) * 100)),
    title: LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)] ?? LEVEL_TITLES[0]!,
  };
}

/** Fisher-Yates shuffle (returns a new array). */
export function fisherYatesShuffle<T>(arr: readonly T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}
