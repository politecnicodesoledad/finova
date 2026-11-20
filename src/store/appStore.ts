/**
 * Global FINOVA state + actions. Every action mirrors a function of the original
 * prototype (same rewards, sounds, toasts and validations). Persistence goes
 * through services/storage (localStorage demo mode).
 */
import { create } from "zustand";
import { MONTHS_CATALOG } from "@/data/catalog";
import { DIFFICULTY_CONFIGS, type DifficultyId } from "@/data/arcade";
import { formatCOP } from "@/lib/format";
import { launchConfetti } from "@/services/effects";
import {
  checkPrizeClaim,
  curMonth,
  getActiveStudent,
  getStudentCourse,
  marketRewardFor,
  playsLeft,
  rankList,
} from "@/services/rules";
import { SoundFX } from "@/services/sound";
import { clearSavedState, loadState, saveState } from "@/services/storage";
import { showToast } from "@/store/toastStore";
import { closeModal, openMissionModalState, openOdsModalState, useUiStore } from "@/store/uiStore";
import type { AppState, AvatarStyle, GameId, MiniCourseId, Student, TabId } from "@/types/finova";

export const useAppStore = create<AppState>(() => loadState());

const getState = () => useAppStore.getState();

/** Apply a mutation to a deep copy of the state, then persist it. */
function mutate(recipe: (draft: AppState) => void) {
  const draft = structuredClone(getState());
  recipe(draft);
  useAppStore.setState(draft, true);
  saveState(draft);
}

function withActiveStudent(draft: AppState, fn: (s: Student) => void) {
  const s = getActiveStudent(draft);
  if (s) fn(s);
}

function award(s: Student, coins: number, xp: number, reason?: string) {
  s.pp = (s.pp || 0) + xp;
  s.coins += coins;
  s.xp += xp;
  if (reason) {
    s.transactions.unshift({ id: "tx-" + Date.now(), title: reason, amount: coins, type: "in", date: "Hoy" });
  }
}

/* ---------------- Navigation & session ---------------- */

export function switchTab(tabId: TabId) {
  SoundFX.tab();
  mutate((d) => {
    d.activeTab = tabId;
  });
}

export function logoutUser() {
  SoundFX.click();
  mutate((d) => {
    d.currentUser = null;
  });
}

export function loginAsStudent(studentId: string) {
  SoundFX.success();
  mutate((d) => {
    d.currentUser = { role: "student", id: studentId };
    d.activeTab = "panel";
  });
}

export function loginAsTeacher() {
  SoundFX.success();
  mutate((d) => {
    d.currentUser = { role: "teacher", id: "teacher-1" };
  });
}

export function registerNewStudent(nameRaw: string, codeRaw: string, avatarStyle: AvatarStyle) {
  const name = nameRaw.trim();
  const code = codeRaw.trim().toUpperCase();
  if (!name || !code) {
    showToast("Faltan datos", "Ingresa tu nombre y el código de tu curso (ej: FIN4A).", "warn");
    return;
  }
  const course = getState().courses.find((c) => c.code.toUpperCase() === code);
  if (!course) {
    showToast("Código de curso no encontrado", "Prueba con FIN4A, FIN4B o FIN5A.", "warn");
    return;
  }
  const now = Date.now();
  const newStudent: Student = {
    id: "st-" + now,
    name: name.split(" ")[0] ?? name,
    fullName: name,
    courseId: course.id,
    avatarStyle,
    coins: 15000,
    xp: 100,
    pp: Math.round(100 / 3),
    completedMonths: [],
    completedCourses: [],
    challenges: { monthlyMission: false, minicourse: false, savingsDeposit: false },
    goals: [{ id: "g-" + now, title: "Mi Primera Gran Meta", icon: "🚲", target: 40000, saved: 5000, color: "emerald" }],
    transactions: [{ id: "t-" + now, title: "Bono de Bienvenida Club FINOVA", amount: 15000, type: "in", date: "Hoy" }],
    bestSpeedTime: 25.0,
    highScoreArcade: 0,
    plays: {},
  };
  mutate((d) => {
    d.students.push(newStudent);
  });
  loginAsStudent(newStudent.id);
  showToast(
    `¡Bienvenida al Club FINOVA, ${newStudent.name}! 🎉`,
    `Te uniste a ${course.name} con $15.000 iniciales.`,
    "gold",
  );
}

export function resetDemoData() {
  clearSavedState();
  useAppStore.setState(loadState(), true);
  showToast("Datos restaurados", "Se reinició la plataforma demo.", "info");
}

/* ---------------- Monthly missions ---------------- */

export function completeMonthForStudent(monthId: number) {
  const monthObj = MONTHS_CATALOG.find((m) => m.id === monthId);
  const student = getActiveStudent(getState());
  if (!monthObj || !student) return;

  if (!student.completedMonths.includes(monthId)) {
    mutate((d) =>
      withActiveStudent(d, (s) => {
        s.completedMonths.push(monthId);
        s.completedMonths.sort((a, b) => a - b);
        s.challenges.monthlyMission = true;
        award(s, monthObj.rewardCoins, monthObj.rewardXP, `Mes ${monthId} (${monthObj.name}) Completado`);
      }),
    );
    SoundFX.levelUp();
    launchConfetti();
    showToast(
      `¡Mes ${monthId} (${monthObj.name}) Cumplido! 🎉`,
      `Ganaste +${formatCOP(monthObj.rewardCoins)} y +${monthObj.rewardXP} XP.`,
      "gold",
    );
  } else {
    const bonus = 800;
    mutate((d) => withActiveStudent(d, (s) => award(s, bonus, 25, `Repaso Mes ${monthId} (${monthObj.name})`)));
    SoundFX.coin();
    showToast(`¡Repaso Completado!`, `Ganaste un bono de +${formatCOP(bonus)} y +25 XP.`, "success");
  }
}

export function recordBestSpeed(elapsed: number) {
  mutate((d) =>
    withActiveStudent(d, (s) => {
      if (elapsed < (s.bestSpeedTime || 999)) s.bestSpeedTime = elapsed;
    }),
  );
}

/* ---------------- Games (2 plays per month) ---------------- */

/** Registers one play of a game for the active month. Returns false when the monthly limit is reached. */
export function registerPlay(game: GameId): boolean {
  const st = getState();
  const s = getActiveStudent(st);
  if (!s) return true;
  const m = curMonth(getStudentCourse(st, s));
  if (playsLeft(s, game, m) <= 0) return false;
  mutate((d) =>
    withActiveStudent(d, (ds) => {
      ds.plays = ds.plays || {};
      const g = (ds.plays[game] = ds.plays[game] || {});
      g[m] = (g[m] || 0) + 1;
    }),
  );
  return true;
}

export function finishArcadeGame(scoreCoins: number, xpEarned: number, difficulty: DifficultyId): boolean {
  const s = getActiveStudent(getState());
  if (!s || scoreCoins <= 0) return false;
  const diff = DIFFICULTY_CONFIGS[difficulty];
  mutate((d) =>
    withActiveStudent(d, (ds) => {
      if (scoreCoins > (ds.highScoreArcade || 0)) ds.highScoreArcade = scoreCoins;
      award(ds, scoreCoins, xpEarned, `Caza-Monedas (${diff.label} ${diff.multiplier}x)`);
    }),
  );
  SoundFX.levelUp();
  launchConfetti();
  return true;
}

export function marketReward(stars: number, correct: number, score: number) {
  const rw = marketRewardFor(stars, correct);
  mutate((d) =>
    withActiveStudent(d, (s) => {
      award(s, rw.c, rw.x, "Mercadito de la Alcancía");
      s.mkBest = Math.max(s.mkBest || 0, score);
    }),
  );
  return rw;
}

/* ---------------- Minicursos (paid once) ---------------- */

export function completeMiniCourse(courseKey: MiniCourseId, title: string, rewardCoins: number, rewardXP: number) {
  const student = getActiveStudent(getState());
  if (!student) return;
  if (!student.completedCourses.includes(courseKey)) {
    mutate((d) =>
      withActiveStudent(d, (s) => {
        s.completedCourses.push(courseKey);
        s.challenges.minicourse = true;
        award(s, rewardCoins, rewardXP, `Minicurso: ${title}`);
      }),
    );
    SoundFX.levelUp();
    launchConfetti();
    showToast(`¡Minicurso Completado! 🎓`, `Ganaste +${formatCOP(rewardCoins)} y +${rewardXP} XP.`, "gold");
  } else {
    showToast("Ya reclamado", "Este minicurso ya te dio su premio. ¡Sigue con lo que te falta!", "info");
  }
}

/* ---------------- Premios del colegio ---------------- */

export function claimPrize(prizeId: string) {
  const st = getState();
  const s = getActiveStudent(st);
  const p = st.prizes.find((x) => x.id == prizeId);
  if (!s || !p) return;
  const check = checkPrizeClaim(st, s, p);
  if (!check.ok) {
    showToast("Todavía no", "Completa tu mes y reúne las monedas antes de reclamar.", "info");
    return;
  }
  const c = getStudentCourse(st, s);
  mutate((d) => {
    d.claims.push({ id: "cl" + Date.now(), prizeId, studentId: s.id, courseId: c.id, period: c.period });
    withActiveStudent(d, (ds) =>
      ds.transactions.unshift({ id: "tx-" + Date.now(), title: "Premio reclamado: " + p.name, amount: 0, type: "prize", date: "Hoy" }),
    );
  });
  launchConfetti();
  showToast("¡Premio reclamado!", p.name + ". Avísale a tu profe.", "success");
}

/* ---------------- Teacher ---------------- */

export function toggleCourseMonth(courseId: string, monthId: number) {
  const course = getState().courses.find((c) => c.id === courseId);
  if (!course) return;
  const open = course.unlockedMonths.includes(monthId);
  mutate((d) => {
    const c = d.courses.find((x) => x.id === courseId)!;
    if (open) c.unlockedMonths = c.unlockedMonths.filter((m) => m !== monthId);
    else {
      c.unlockedMonths.push(monthId);
      c.unlockedMonths.sort((a, b) => a - b);
    }
  });
  if (open) {
    SoundFX.click();
    showToast(`Mes ${monthId} Bloqueado`, `Se cerró para ${course.name}.`, "info");
  } else {
    SoundFX.success();
    showToast(`¡Mes ${monthId} Habilitado!`, `Los estudiantes de ${course.name} ya pueden jugarlo.`, "success");
  }
}

export function unlockNextMonthForCourse(courseId: string) {
  const course = getState().courses.find((c) => c.id === courseId);
  if (!course) return;
  const next = MONTHS_CATALOG.find((m) => !course.unlockedMonths.includes(m.id));
  if (next) {
    mutate((d) => {
      const c = d.courses.find((x) => x.id === courseId)!;
      c.unlockedMonths.push(next.id);
      c.unlockedMonths.sort((a, b) => a - b);
    });
    SoundFX.levelUp();
    showToast(`¡Mes ${next.id} (${next.name}) Habilitado!`, `Ahora está disponible para ${course.name}.`, "gold");
  } else {
    showToast("Todos los meses ya están habilitados", "¡El año completo está abierto!", "info");
  }
}

export function createNewCourse(grade: string, sectionRaw: string) {
  const section = sectionRaw.trim().toUpperCase();
  if (!section) return;
  const name = `${grade} ${section}`;
  const code = `FIN${grade.replace("°", "")}${section}`;
  const id = "c-" + Date.now();
  mutate((d) => {
    d.courses.push({ id, grade, section, name, code, unlockedMonths: [1], period: 1, podium: [], podiumHistory: [] });
  });
  useUiStore.setState({ teacherSelectedCourseId: id });
  SoundFX.success();
  showToast(`Curso ${name} Creado`, `Código de acceso para estudiantes: ${code}`, "success");
}

export function deleteStudentAccount(studentId: string) {
  const st = getState().students.find((s) => s.id === studentId);
  if (!st) return;
  mutate((d) => {
    d.students = d.students.filter((s) => s.id !== studentId);
  });
  SoundFX.hit();
  showToast("Cuenta eliminada", `Se eliminó el perfil de ${st.fullName}.`, "info");
}

export function addTeacherQuestion(input: {
  monthId: number;
  question: string;
  options: [string, string, string];
  explanation: string;
}): boolean {
  const question = input.question.trim();
  const opts = input.options.map((o) => o.trim());
  const explanation = input.explanation.trim() || "¡Excelente decisión financiera!";
  if (!question || opts.some((o) => !o)) {
    showToast("Completa todos los campos", "Escribe la pregunta y las 3 opciones.", "warn");
    return false;
  }
  mutate((d) => {
    d.questions.push({ id: "q-" + Date.now(), monthId: input.monthId || 1, question, options: opts, correctIndex: 0, explanation });
  });
  SoundFX.success();
  showToast("Pregunta agregada", `Añadida al banco del Mes ${input.monthId || 1}.`, "success");
  return true;
}

export function deleteQuestion(qId: string) {
  if (getState().questions.length <= 3) {
    showToast("Mínimo 3 preguntas", "Debe haber al menos 3 preguntas en el banco.", "warn");
    return;
  }
  mutate((d) => {
    d.questions = d.questions.filter((q) => q.id !== qId);
  });
  SoundFX.click();
}

export function setPodiumPlace(courseId: string, place: number, studentId: string) {
  mutate((d) => {
    const c = d.courses.find((x) => x.id == courseId);
    if (c) c.podium[place] = studentId;
  });
}

export function suggestPodium(courseId: string) {
  mutate((d) => {
    const c = d.courses.find((x) => x.id == courseId);
    if (c) c.podium = rankList(d, c).slice(0, 3).map((s) => s.id);
  });
}

/** Archives the podium, resets period points to 0 (level and XP are kept) and advances the period. */
export function closePeriod(courseId: string, confirmFn: (msg: string) => boolean = (m) => window.confirm(m)) {
  const c0 = getState().courses.find((x) => x.id == courseId);
  if (!c0) return;
  if (!confirmFn("¿Cerrar el periodo " + c0.period + "? Se archiva el podio y los puntos del periodo vuelven a cero.")) return;
  mutate((d) => {
    const c = d.courses.find((x) => x.id == courseId)!;
    c.podiumHistory.push({
      period: c.period,
      names: c.podium
        .map((id) => {
          const s = d.students.find((x) => x.id == id);
          return s ? s.name : "";
        })
        .filter(Boolean),
    });
    c.podium = [];
    d.students.filter((s) => s.courseId == c.id).forEach((s) => (s.pp = 0));
    if (c.period < 4) c.period++;
  });
  if (c0.period >= 4) showToast("Año completo", "Ya cerraste el periodo 4.", "info");
}

export function updatePrize(id: string, key: "name" | "cost" | "slots", value: string) {
  mutate((d) => {
    const p = d.prizes.find((x) => x.id == id);
    if (!p) return;
    if (key === "name") p.name = value;
    else p[key] = Math.max(0, +value || 0);
  });
}

export function addPrize() {
  mutate((d) => {
    d.prizes.push({ id: "p" + Date.now(), name: "Nuevo premio", cost: 25000, slots: 10 });
  });
}

export function deletePrize(id: string) {
  mutate((d) => {
    d.prizes = d.prizes.filter((x) => x.id != id);
  });
}

/* ---------------- Modals ---------------- */
export { closeModal };

/** Opens the monthly mission (only if the teacher unlocked that month). */
export function openMonthMissionModal(monthId: number) {
  const st = getState();
  const student = getActiveStudent(st);
  const course = getStudentCourse(st, student);
  const monthObj = MONTHS_CATALOG.find((m) => m.id === monthId);
  if (!monthObj) return;
  if (!course.unlockedMonths.includes(monthId)) {
    SoundFX.hit();
    showToast(
      `Mes ${monthId} (${monthObj.name}) Bloqueado`,
      `Tu profesor(a) aún no ha habilitado este mes para ${course.name}.`,
      "warn",
    );
    return;
  }
  SoundFX.tab();
  openMissionModalState(monthId);
}

export function openOdsModal() {
  SoundFX.tab();
  openOdsModalState();
}
