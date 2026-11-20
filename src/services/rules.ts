/**
 * FINOVA business rules (pure functions, no side effects).
 * The same rules are enforced server-side by the Postgres functions in
 * database/finova_schema.sql once Supabase is connected.
 */
import type {
  AppState,
  Course,
  GameId,
  MonthTask,
  NextTodo,
  Prize,
  PrizeClaim,
  Student,
} from "@/types/finova";

export const MAX_PLAYS_PER_MONTH = 2;
export const MINICOURSE_COUNT = 3;

/** Active month = highest month the teacher has unlocked for the course. */
export const curMonth = (c: Course | null | undefined): number =>
  Math.max(1, ...((c && c.unlockedMonths) || [1]));

export const playsUsed = (s: Student, g: GameId, m: number): number => s.plays?.[g]?.[m] ?? 0;

export const playsLeft = (s: Student, g: GameId, m: number): number =>
  MAX_PLAYS_PER_MONTH - playsUsed(s, g, m);

export function getStudentCourse(state: AppState, student: Student | null | undefined): Course {
  const first = state.courses[0]!;
  if (!student) return first;
  return state.courses.find((c) => c.id === student.courseId) || first;
}

export function getActiveStudent(state: AppState): Student | null {
  if (!state.currentUser || state.currentUser.role !== "student") return null;
  const id = state.currentUser.id;
  return state.students.find((s) => s.id === id) || null;
}

/** Suggested ranking: period points desc, then best speed asc. */
export const rankList = (state: AppState, c: Course): Student[] =>
  state.students
    .filter((s) => s.courseId == c.id)
    .sort((a, b) => (b.pp || 0) - (a.pp || 0) || (a.bestSpeedTime || 99) - (b.bestSpeedTime || 99));

export function monthTasks(state: AppState, s: Student): MonthTask[] {
  const c = getStudentCourse(state, s);
  const m = curMonth(c);
  return [
    [`Misión del mes ${m}`, s.completedMonths.includes(m)],
    [`Los 3 minicursos (${Math.min(3, s.completedCourses.length)}/3)`, s.completedCourses.length >= 3],
    [`Caza-Monedas (${2 - playsLeft(s, "arcade", m)}/2 partidas)`, playsLeft(s, "arcade", m) <= 0],
    [`Mercadito (${2 - playsLeft(s, "market", m)}/2 partidas)`, playsLeft(s, "market", m) <= 0],
  ];
}

export const monthComplete = (state: AppState, s: Student): boolean =>
  monthTasks(state, s).every((x) => x[1]);

export const prizeClaimsFor = (state: AppState, prizeId: string, c: Course): PrizeClaim[] =>
  state.claims.filter((x) => x.prizeId == prizeId && x.courseId == c.id && x.period == c.period);

export type ClaimCheck =
  | { ok: true }
  | { ok: false; reason: "no_slots" | "month_incomplete" | "not_enough_coins" | "already_claimed" };

/** A prize can be claimed when the month list is complete, coins are enough (not deducted) and slots remain. */
export function checkPrizeClaim(state: AppState, s: Student, p: Prize): ClaimCheck {
  const c = getStudentCourse(state, s);
  const cl = prizeClaimsFor(state, p.id, c);
  if (cl.some((x) => x.studentId == s.id)) return { ok: false, reason: "already_claimed" };
  if (cl.length >= p.slots) return { ok: false, reason: "no_slots" };
  if (!monthComplete(state, s)) return { ok: false, reason: "month_incomplete" };
  if (s.coins < p.cost) return { ok: false, reason: "not_enough_coins" };
  return { ok: true };
}

/** What the student should do next (drives the animated hand). */
export function nextTodo(state: AppState, s: Student): NextTodo | null {
  const c = getStudentCourse(state, s);
  const m = curMonth(c);
  if (!s.completedMonths.includes(m)) return { tab: "panel", key: "mission" };
  if (s.completedCourses.length < 3) return { tab: "courses", key: "courses" };
  if (playsLeft(s, "arcade", m) > 0) return { tab: "arcade", key: "arcade" };
  if (playsLeft(s, "market", m) > 0) return { tab: "market", key: "market" };
  const cl = (p: Prize) => prizeClaimsFor(state, p.id, c);
  return state.prizes.some(
    (p) => s.coins >= p.cost && cl(p).length < p.slots && !cl(p).some((x) => x.studentId == s.id),
  )
    ? { tab: "goals", key: "prizes" }
    : null;
}

/** Mercadito reward formula. */
export function marketRewardFor(stars: number, correct: number) {
  return { c: Math.round((300 + correct * 160 + stars * 600) / 100) * 100, x: 10 + stars * 25 + correct * 3 };
}
