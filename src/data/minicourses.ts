import type { MiniCourseId } from "@/types/finova";

export const MINICOURSES_META: { id: MiniCourseId; title: string; icon: string; reward: number; xp: number; tag: string }[] = [
  { id: "mc1", title: "1. Une las Parejas", icon: "🧩", reward: 2500, xp: 65, tag: "Juego de Unir" },
  { id: "mc2", title: "2. Detective de Gastos", icon: "🕵️‍♀️", reward: 2500, xp: 65, tag: "Juego Necesidad vs. Deseo" },
  { id: "mc3", title: "3. Los 3 Frascos", icon: "🐷", reward: 3000, xp: 80, tag: "Reparte tu Mesada" },
];

/** mc1 — Une las Parejas */
export const MM_ORD = [3, 0, 5, 2, 1, 4];
export const MM_COL = ["#10b981", "#f59e0b", "#3b82f6", "#ec4899", "#8b5cf6", "#14b8a6"];
export const MM_P: [string, string][] = [
  ["Ingreso", "El dinero que recibes, como tu mesada"],
  ["Gasto", "El dinero que pagas por algo, como un cuaderno"],
  ["Ahorro", "La parte que guardas para después"],
  ["Meta", "Lo que quieres lograr, como una bicicleta"],
  ["Necesidad", "Algo que no puede faltar, como la comida"],
  ["Deseo", "Algo que quieres, pero puede esperar"],
];

/** mc2 — Detective de Gastos */
export const MC2_ITEMS: { id: number; name: string; emoji: string; type: "need" | "want"; tip: string }[] = [
  { id: 1, name: "Cuadernos y lápices para clase", emoji: "📚", type: "need", tip: "¡Bien! Son herramientas esenciales para tu educación." },
  { id: 2, name: "Videojuego de moda con micro-pagos", emoji: "🕹️", type: "want", tip: "¡Correcto! Es un deseo divertido, no una necesidad urgente." },
  { id: 3, name: "Almuerzo saludable y frutas", emoji: "🥗", type: "need", tip: "¡Exacto! La buena alimentación es vital para tu salud." },
  { id: 4, name: "3 bolsas de dulces extra al salir", emoji: "🍭", type: "want", tip: "¡Muy bien! Es un gasto hormiga / deseo." },
  { id: 5, name: "Zapatos escolares porque se rompieron", emoji: "👟", type: "need", tip: "¡Así es! Reemplazar calzado dañado es una necesidad real." },
  { id: 6, name: "Sticker brillante coleccionable", emoji: "✨", type: "want", tip: "¡Genial! Es un gusto opcional que puedes planear después." },
];

/** mc3 — Los 3 Frascos: 10 coins of $1.000 split 50/30/20 */
export const FRASCOS_TOTAL = 10;

export function checkFrascos(fr: { n: number; w: number; s: number }): string {
  const pocket = FRASCOS_TOTAL - fr.n - fr.w - fr.s;
  return pocket > 0
    ? "Todavía tienes monedas en tu bolsillo. Repártelas todas."
    : fr.n < 5
      ? "Primero cubre lo que necesitas: la mitad de tu mesada."
      : fr.w > 3
        ? "Tus deseos pasan de 3 monedas. Deja más para ahorrar."
        : fr.s < 2
          ? "Guarda al menos 2 monedas para tu meta."
          : "ok";
}
