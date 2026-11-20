import { getInitialState } from "@/data/initialState";
import type { AppState } from "@/types/finova";

export const STORAGE_KEY = "FINOVA_EDU_V3";

/** Fills fields added in later versions (periods, podium, prizes, monthly plays). */
export function normalizeState(raw: AppState): AppState {
  const A = raw;
  A.prizes = A.prizes || getInitialState().prizes;
  A.claims = A.claims || [];
  A.courses.forEach((c) => {
    c.period = c.period || 1;
    c.podium = c.podium || [];
    c.podiumHistory = c.podiumHistory || [];
  });
  A.students.forEach((s) => {
    s.plays = s.plays || {};
    if (s.pp == null) s.pp = Math.round((s.xp || 0) / 3);
    s.transactions = s.transactions || [];
  });
  return A;
}

export function loadState(): AppState {
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AppState;
        if (parsed && parsed.courses && parsed.students) return normalizeState(parsed);
      }
    } catch (e) {
      console.warn("Error loading state:", e);
    }
  }
  const initial = getInitialState();
  // Auto-login Valeria by default so the rich dashboard shows immediately.
  initial.currentUser = { role: "student", id: "st-valeria" };
  return initial;
}

export function saveState(state: AppState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Error saving state:", e);
  }
}

export function clearSavedState() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
