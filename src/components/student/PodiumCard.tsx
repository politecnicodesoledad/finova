import type { AppState, Course, Student } from "@/types/finova";

const COLORS = ["#f59e0b", "#94a3b8", "#c2410c"];
const LABELS = ["1.er lugar", "2.º lugar", "3.er lugar"];

/** Podium published by the teacher (only the top 3 are visible to students). */
export function PodiumCard({ state, student, course }: { state: AppState; student: Student; course: Course }) {
  const winners = (course.podium || []).map((id) => state.students.find((s) => s.id == id)).filter((s): s is Student => !!s);
  return (
    <div className="card-soft p-5 sm:p-6">
      <div className="flex items-center justify-between gap-2 mb-1">
        <h3 className="text-base font-extrabold text-slate-900">Podio · Periodo {course.period} de 4</h3>
        <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 shrink-0">{course.name}</span>
      </div>
      <p className="text-xs text-slate-500 mb-4">
        Las 3 que van ganando reciben nota 100 al cerrar el periodo. El podio se reinicia cada periodo; tu nivel y tu XP se conservan.
      </p>
      {winners.length ? (
        <div className="space-y-2.5">
          {winners.map((s, i) => (
            <div key={s.id + i} className={`flex items-center gap-3 p-3 rounded-2xl ${s.id == student.id ? "bg-emerald-50 border border-emerald-200" : "bg-slate-50"}`}>
              <span className="w-9 h-9 rounded-full grid place-items-center text-white font-black shrink-0" style={{ background: COLORS[i] }}>
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-sm text-slate-900 truncate">
                  {s.name}
                  {s.id == student.id ? " (Tú)" : ""}
                </p>
                <p className="text-[11px] font-semibold text-slate-500">{LABELS[i]}</p>
              </div>
              <span className="text-xs font-black px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 shrink-0">Nota 100</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-slate-50 text-sm font-semibold text-slate-500 text-center">
          Tu profe aún no publica el podio. ¡Suma puntos jugando y respondiendo rápido!
        </div>
      )}
    </div>
  );
}
