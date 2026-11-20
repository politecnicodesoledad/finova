import { beforeEach, describe, expect, it } from "vitest";
import { getInitialState } from "@/data/initialState";
import { checkPrizeClaim, curMonth, marketRewardFor, monthComplete, playsLeft } from "@/services/rules";
import {
  claimPrize,
  closePeriod,
  completeMiniCourse,
  completeMonthForStudent,
  registerPlay,
  useAppStore,
} from "@/store/appStore";
import type { AppState, Student } from "@/types/finova";

const VALERIA = "st-valeria";

function resetAs(studentId = VALERIA) {
  const s = getInitialState();
  s.currentUser = { role: "student", id: studentId };
  useAppStore.setState(s, true);
}
const state = (): AppState => useAppStore.getState();
const student = (id = VALERIA): Student => state().students.find((s) => s.id === id)!;

/** Puts a student in "month fully completed" state for the active month. */
function completeWholeMonth(id: string) {
  const st = structuredClone(state());
  const s = st.students.find((x) => x.id === id)!;
  const m = curMonth(st.courses.find((c) => c.id === s.courseId));
  s.completedMonths.push(m);
  s.completedCourses = ["mc1", "mc2", "mc3"];
  s.plays = { arcade: { [m]: 2 }, market: { [m]: 2 } };
  useAppStore.setState(st, true);
}

beforeEach(() => {
  localStorage.clear();
  resetAs();
});

describe("Monthly game limit", () => {
  it("allows exactly 2 Caza-Monedas plays per month", () => {
    expect(registerPlay("arcade")).toBe(true);
    expect(registerPlay("arcade")).toBe(true);
    expect(registerPlay("arcade")).toBe(false);
    expect(playsLeft(student(), "arcade", 3)).toBe(0);
  });

  it("counts Mercadito plays separately from Caza-Monedas", () => {
    registerPlay("arcade");
    registerPlay("arcade");
    expect(registerPlay("market")).toBe(true);
    expect(playsLeft(student(), "market", 3)).toBe(1);
  });

  it("uses the highest month unlocked by the teacher as the active month", () => {
    expect(curMonth(state().courses.find((c) => c.id === "c-4a"))).toBe(3);
  });
});

describe("Minicourses pay once", () => {
  it("gives $2.500 and 65 XP only the first time", () => {
    const before = student();
    completeMiniCourse("mc2", "Detective de Gastos", 2500, 65);
    completeMiniCourse("mc2", "Detective de Gastos", 2500, 65);
    const after = student();
    expect(after.coins).toBe(before.coins + 2500);
    expect(after.xp).toBe(before.xp + 65);
    expect(after.pp).toBe(before.pp + 65);
  });
});

describe("Monthly mission", () => {
  it("first completion of March pays $3.500 and 90 XP", () => {
    const before = student();
    completeMonthForStudent(3);
    expect(student().coins).toBe(before.coins + 3500);
    expect(student().xp).toBe(before.xp + 90);
  });
});

describe("School prizes", () => {
  it("cannot be claimed until the whole month list is complete", () => {
    const prize = state().prizes[0]!;
    expect(checkPrizeClaim(state(), student(), prize)).toEqual({ ok: false, reason: "month_incomplete" });
  });

  it("requires mission + 3 minicourses + 2 plays of each game", () => {
    completeWholeMonth(VALERIA);
    expect(monthComplete(state(), student())).toBe(true);
  });

  it("does not deduct coins when claimed", () => {
    completeWholeMonth(VALERIA);
    const coins = student().coins; // 24.500 → can claim "Lápiz gratis" (22.000)
    claimPrize("p2");
    expect(state().claims).toHaveLength(1);
    expect(student().coins).toBe(coins);
  });

  it("blocks claiming when coins are not enough", () => {
    completeWholeMonth(VALERIA);
    claimPrize("p3"); // costs 34.000
    expect(state().claims).toHaveLength(0);
  });

  it("first come, first served: no claim after slots run out", () => {
    const st = structuredClone(state());
    st.prizes.find((p) => p.id === "p2")!.slots = 1;
    useAppStore.setState(st, true);
    completeWholeMonth(VALERIA);
    completeWholeMonth("st-sofia");
    claimPrize("p2");
    resetUser("st-sofia");
    claimPrize("p2");
    expect(state().claims.map((c) => c.studentId)).toEqual([VALERIA]);
  });
});

function resetUser(id: string) {
  useAppStore.setState({ ...state(), currentUser: { role: "student", id } }, true);
}

describe("Closing a period", () => {
  it("archives the podium, resets period points to 0 and keeps level/XP", () => {
    const st = structuredClone(state());
    st.courses.find((c) => c.id === "c-4a")!.podium = ["st-sofia", VALERIA, "st-camila"];
    useAppStore.setState(st, true);
    const xpBefore = student().xp;

    closePeriod("c-4a", () => true);

    const course = state().courses.find((c) => c.id === "c-4a")!;
    expect(course.period).toBe(2);
    expect(course.podium).toEqual([]);
    expect(course.podiumHistory).toEqual([{ period: 1, names: ["Sofía", "Valeria", "Camila"] }]);
    expect(student().pp).toBe(0);
    expect(student().xp).toBe(xpBefore);
    // Other courses are untouched
    expect(student("st-mariana").pp).toBeGreaterThan(0);
  });

  it("does not go past period 4", () => {
    const st = structuredClone(state());
    st.courses.find((c) => c.id === "c-4a")!.period = 4;
    useAppStore.setState(st, true);
    closePeriod("c-4a", () => true);
    expect(state().courses.find((c) => c.id === "c-4a")!.period).toBe(4);
  });
});

describe("Mercadito reward", () => {
  it("3 stars with 24 correct cards pays $5.900 and 157 XP", () => {
    expect(marketRewardFor(3, 24)).toEqual({ c: 5900, x: 157 });
  });
});
