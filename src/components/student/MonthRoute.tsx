import { Hand } from "@/components/brand/Hand";
import { MONTHS_CATALOG } from "@/data/catalog";
import { curMonth } from "@/services/rules";
import { openMonthMissionModal } from "@/store/appStore";
import type { Course, NextTodo, Student } from "@/types/finova";

/** "Tu Ruta Mensual del Año" — Villa FINOVA's 12 months, unlocked by the teacher. */
export function MonthRoute({ student, course, next }: { student: Student; course: Course; next: NextTodo | null }) {
  const completedCount = student.completedMonths.length;
  return (
    <div className="lg:col-span-7 card-soft p-5 sm:p-7">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">📅 Tu Ruta Mensual del Año</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Tu profesor(a) habilita los meses del curso <strong>{course.name}</strong>. ¡Cumple cada mes para ganar recompensas!
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold shrink-0">
          ✅ Cumplidos: {completedCount} / 12
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        {MONTHS_CATALOG.map((m) => {
          const isCompleted = student.completedMonths.includes(m.id);
          const isUnlocked = course.unlockedMonths.includes(m.id);
          if (isCompleted) {
            return (
              <button
                key={m.id}
                onClick={() => openMonthMissionModal(m.id)}
                className="group relative rounded-2xl p-3.5 text-center bg-emerald-50/90 border-2 border-emerald-400 hover:bg-emerald-100/80 transition-all btn-3d"
              >
                <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center shadow-sm">
                  ✓
                </span>
                <div className="text-2xl mb-1">🏅</div>
                <p className="font-extrabold text-sm text-slate-900">Mes {m.id}</p>
                <p className="text-xs font-semibold text-slate-600">{m.name}</p>
                <p className="text-[11px] font-extrabold text-emerald-700 mt-1.5">¡Cumplido!</p>
              </button>
            );
          }
          if (isUnlocked) {
            return (
              <button
                key={m.id}
                onClick={() => openMonthMissionModal(m.id)}
                className="group relative rounded-2xl p-3.5 text-center bg-amber-50/90 border-2 border-amber-400 glow-gold hover:bg-amber-100/80 transition-all btn-3d"
              >
                {next?.key === "mission" && m.id === curMonth(course) ? <Hand variant="up cardh2" /> : null}
                <div className="text-2xl mb-1">⭐</div>
                <p className="font-extrabold text-sm text-slate-900">Mes {m.id}</p>
                <p className="text-xs font-semibold text-slate-600">{m.name}</p>
                <p className="text-[11px] font-extrabold text-amber-600 mt-1.5">¡Jugar hoy!</p>
              </button>
            );
          }
          return (
            <button
              key={m.id}
              onClick={() => openMonthMissionModal(m.id)}
              className="rounded-2xl p-3.5 text-center bg-slate-50/90 border border-slate-200/90 opacity-75 hover:opacity-95 transition-all"
            >
              <div className="text-xl mb-1 text-amber-500">🔒</div>
              <p className="font-extrabold text-sm text-slate-700">Mes {m.id}</p>
              <p className="text-xs font-medium text-slate-400">{m.name}</p>
              <p className="text-[11px] font-semibold text-slate-400 mt-1.5">Próximo mes</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
