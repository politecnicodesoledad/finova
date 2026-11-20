import type { AppState, Prize, Student } from "@/types/finova";
import { DEFAULT_QUESTIONS } from "./catalog";

export const DEFAULT_PRIZES: Prize[] = [
  { id: "p1", name: "Gaseosa con 50% de descuento", cost: 26000, slots: 10 },
  { id: "p2", name: "Lápiz gratis", cost: 22000, slots: 10 },
  { id: "p3", name: "Caja de colores gratis", cost: 34000, slots: 10 },
  { id: "p4", name: "Borrador y sacapuntas", cost: 20000, slots: 10 },
];

type SeedStudent = Omit<Student, "pp" | "plays">;

const SEED_STUDENTS: SeedStudent[] = [
  {
    id: "st-valeria",
    name: "Valeria",
    fullName: "Valeria Gómez",
    courseId: "c-4a",
    avatarStyle: "valeria",
    coins: 24500,
    xp: 400,
    completedMonths: [1, 2],
    completedCourses: ["mc1"],
    challenges: { monthlyMission: true, minicourse: true, savingsDeposit: true },
    goals: [
      { id: "g1", title: "Bicicleta Exploradora", icon: "🚲", target: 50000, saved: 32000, color: "emerald" },
      { id: "g2", title: "Kit Profesional de Arte", icon: "🎨", target: 25000, saved: 15000, color: "amber" },
      { id: "g3", title: "Fondo de Emergencia", icon: "🛡️", target: 20000, saved: 12000, color: "sky" },
    ],
    transactions: [
      { id: "t1", title: "Misión Mes 2 (Febrero) Cumplida", amount: 3200, type: "in", date: "Hace 2 días" },
      { id: "t2", title: "Minicurso: Une las Parejas", amount: 2500, type: "in", date: "Hace 3 días" },
      { id: "t3", title: "Abono a Bicicleta Exploradora", amount: 4000, type: "save", date: "Hace 4 días" },
      { id: "t4", title: "Caza-Monedas Arcade (Estratega)", amount: 4800, type: "in", date: "Hace 5 días" },
    ],
    bestSpeedTime: 18.4,
    highScoreArcade: 6400,
  },
  {
    id: "st-sofia",
    name: "Sofía",
    fullName: "Sofía Martínez",
    courseId: "c-4a",
    avatarStyle: "sofia",
    coins: 27800,
    xp: 460,
    completedMonths: [1, 2, 3],
    completedCourses: ["mc1", "mc2"],
    challenges: { monthlyMission: true, minicourse: true, savingsDeposit: true },
    goals: [{ id: "g1", title: "Telescopio Espacial", icon: "🔭", target: 60000, saved: 41000, color: "emerald" }],
    transactions: [],
    bestSpeedTime: 16.2,
    highScoreArcade: 7800,
  },
  {
    id: "st-camila",
    name: "Camila",
    fullName: "Camila Rojas",
    courseId: "c-4a",
    avatarStyle: "camila",
    coins: 21200,
    xp: 340,
    completedMonths: [1, 2],
    completedCourses: ["mc1"],
    challenges: { monthlyMission: true, minicourse: false, savingsDeposit: true },
    goals: [{ id: "g1", title: "Patines de Neón", icon: "🛼", target: 45000, saved: 22000, color: "amber" }],
    transactions: [],
    bestSpeedTime: 21.0,
    highScoreArcade: 5100,
  },
  {
    id: "st-mariana",
    name: "Mariana",
    fullName: "Mariana Torres",
    courseId: "c-4b",
    avatarStyle: "mariana",
    coins: 19500,
    xp: 290,
    completedMonths: [1],
    completedCourses: [],
    challenges: { monthlyMission: true, minicourse: false, savingsDeposit: false },
    goals: [{ id: "g1", title: "Guitarra Acústica", icon: "🎸", target: 55000, saved: 18000, color: "emerald" }],
    transactions: [],
    bestSpeedTime: 22.5,
    highScoreArcade: 4300,
  },
];

/** Demo data of the original prototype (also used as the database seed). */
export function getInitialState(): AppState {
  return {
    currentUser: null,
    activeTab: "panel",
    courses: [
      { id: "c-4a", grade: "4°", section: "A", name: "4° A", code: "FIN4A", unlockedMonths: [1, 2, 3], period: 1, podium: [], podiumHistory: [] },
      { id: "c-4b", grade: "4°", section: "B", name: "4° B", code: "FIN4B", unlockedMonths: [1, 2], period: 1, podium: [], podiumHistory: [] },
      { id: "c-5a", grade: "5°", section: "A", name: "5° A", code: "FIN5A", unlockedMonths: [1, 2, 3, 4], period: 1, podium: [], podiumHistory: [] },
    ],
    students: SEED_STUDENTS.map((s) => ({ ...s, pp: Math.round(s.xp / 3), plays: {} })),
    questions: DEFAULT_QUESTIONS.map((q) => ({ ...q, options: [...q.options] })),
    teacher: { name: "Prof. Laura Mendoza", school: "Colegio Nueva Esperanza" },
    prizes: DEFAULT_PRIZES.map((p) => ({ ...p })),
    claims: [],
  };
}
