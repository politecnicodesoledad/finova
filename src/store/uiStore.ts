/**
 * Ephemeral UI state that is NOT persisted (same lifetime as the module-level
 * variables of the original prototype: survives tab switches, resets on reload).
 */
import { create } from "zustand";
import type { MiniCourseId } from "@/types/finova";
import type { DifficultyId } from "@/data/arcade";

export type ModalState = { kind: "mission"; monthId: number; nonce: number } | { kind: "ods" } | null;
export type TeacherSection = "months" | "students" | "questions" | "rewards";

export interface PairsState {
  sel: number | null;
  done: number[];
  bad: number | null;
}
export interface DetectiveState {
  index: number;
  score: number;
  feedback: { ok: boolean; text: string } | null;
  finished: boolean;
}
export interface FrascosState {
  n: number;
  w: number;
  s: number;
  msg: string;
}

interface UiStore {
  modal: ModalState;
  teacherSelectedCourseId: string;
  teacherSectionTab: TeacherSection;
  activeCourseId: MiniCourseId;
  arcadeDifficulty: DifficultyId;
  mm: PairsState;
  mc2: DetectiveState;
  fr: FrascosState;
}

export const initialPairs = (): PairsState => ({ sel: null, done: [], bad: null });
export const initialDetective = (): DetectiveState => ({ index: 0, score: 0, feedback: null, finished: false });
export const initialFrascos = (): FrascosState => ({ n: 0, w: 0, s: 0, msg: "" });

export const useUiStore = create<UiStore>(() => ({
  modal: null,
  teacherSelectedCourseId: "c-4a",
  teacherSectionTab: "months",
  activeCourseId: "mc1",
  arcadeDifficulty: "estratega",
  mm: initialPairs(),
  mc2: initialDetective(),
  fr: initialFrascos(),
}));

let nonce = 0;
export const openMissionModalState = (monthId: number) =>
  useUiStore.setState({ modal: { kind: "mission", monthId, nonce: ++nonce } });
export const openOdsModalState = () => useUiStore.setState({ modal: { kind: "ods" } });
export const closeModal = () => useUiStore.setState({ modal: null });
