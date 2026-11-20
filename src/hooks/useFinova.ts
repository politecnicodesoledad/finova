import { useSyncExternalStore } from "react";
import { useAppStore } from "@/store/appStore";
import { getActiveStudent, getStudentCourse } from "@/services/rules";
import { SoundFX } from "@/services/sound";

export function useActiveStudent() {
  return useAppStore((s) => getActiveStudent(s));
}

/** Active student + their course + full state (for rule helpers). */
export function useStudentContext() {
  const state = useAppStore((s) => s);
  const student = getActiveStudent(state);
  const course = getStudentCourse(state, student);
  return { state, student, course };
}

export function useSoundEnabled() {
  return useSyncExternalStore(SoundFX.subscribe, SoundFX.isEnabled, () => true);
}
