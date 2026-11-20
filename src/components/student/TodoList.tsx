import { Hand } from "@/components/brand/Hand";
import { curMonth, playsLeft } from "@/services/rules";
import { openMonthMissionModal, switchTab } from "@/store/appStore";
import type { Course, NextTodo, Student } from "@/types/finova";

/** "Tus pendientes": ordered checklist; the hand points at the next pending item. */
export function TodoList({ student: s, course, next: nx }: { student: Student; course: Course; next: NextTodo | null }) {
  const m = curMonth(course);
  const pl = (g: "arcade" | "market") => 2 - playsLeft(s, g, m);
  const rows: [NextTodo["key"], string, string, boolean, () => void][] = [
    ["mission", "Misión del mes " + m, "Responde las preguntas en Villa FINOVA", s.completedMonths.includes(m), () => openMonthMissionModal(m)],
    ["courses", "Minicursos (" + Math.min(3, s.completedCourses.length) + "/3)", "Resuelve los 3 minijuegos", s.completedCourses.length >= 3, () => switchTab("courses")],
    ["arcade", "Caza-Monedas (" + pl("arcade") + "/2 partidas)", "Atrapa monedas y esquiva gastos hormiga", playsLeft(s, "arcade", m) <= 0, () => switchTab("arcade")],
    ["market", "Mercadito (" + pl("market") + "/2 partidas)", "Clasifica y ahorra para tu bicicleta", playsLeft(s, "market", m) <= 0, () => switchTab("market")],
    ["prizes", "Premios del colegio", "Resérvalos si estás entre las primeras", false, () => switchTab("goals")],
  ];
  return (
    <>
      {rows.map((r, i) => {
        const on = !!nx && nx.key === r[0];
        return (
          <div
            key={r[0]}
            onClick={r[4]}
            className={`relative cursor-pointer rounded-2xl p-3.5 border-2 flex items-center gap-3 transition-all ${
              r[3] ? "bg-emerald-50 border-emerald-200" : on ? "bg-amber-50 border-amber-400 glow-gold" : "bg-white border-slate-200"
            }`}
          >
            <span className={`w-9 h-9 rounded-full grid place-items-center font-black text-sm shrink-0 ${r[3] ? "bg-emerald-500 text-white" : "bg-slate-900 text-white"}`}>
              {r[3] ? "✓" : i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-extrabold text-sm text-slate-900 leading-tight">{r[1]}</p>
              <p className="text-xs font-semibold text-slate-500">{r[2]}</p>
            </div>
            {on ? <Hand variant="rt" /> : null}
            <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full shrink-0 ${r[3] ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>
              {r[3] ? "Listo" : "Ir"}
            </span>
          </div>
        );
      })}
    </>
  );
}
