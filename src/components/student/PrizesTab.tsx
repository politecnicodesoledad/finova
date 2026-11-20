import { Hand } from "@/components/brand/Hand";
import { formatCOP } from "@/lib/format";
import { getStudentCourse, monthTasks, prizeClaimsFor } from "@/services/rules";
import { claimPrize } from "@/store/appStore";
import type { AppState, Student } from "@/types/finova";

/** "Premios del Colegio" — only for claiming school prizes. */
export function PrizesTab({ state, student: s }: { state: AppState; student: Student }) {
  const c = getStudentCourse(state, s);
  const tasks = monthTasks(state, s);
  const ok = tasks.every((x) => x[1]);
  return (
    <div className="space-y-6 animate-pop">
      <div className="card-soft p-5 sm:p-6">
        <h3 className="text-lg font-extrabold text-slate-900">Premios del colegio</h3>
        <div className="flex flex-wrap gap-1.5 my-2">
          {tasks.map((x) => (
            <span key={x[0]} className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full ${x[1] ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
              {x[1] ? "✓ " : ""}
              {x[0]}
            </span>
          ))}
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mb-4">
          Solo para las primeras de cada curso que completan todo el mes y reúnen las monedas.{" "}
          {ok ? "Ya cumpliste tu lista del mes." : "Aún te falta completar tu lista del mes (mírala en Control del Dinero)."}
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {state.prizes.map((p) => {
            const cl = prizeClaimsFor(state, p.id, c);
            const n = cl.length;
            const mine = cl.some((x) => x.studentId == s.id);
            const full = n >= p.slots;
            const can = ok && !full && !mine && s.coins >= p.cost;
            return (
              <div
                key={p.id}
                className={`relative rounded-2xl border-2 p-4 ${can ? "border-amber-400 bg-amber-50 " : ""}${mine ? "border-emerald-500 bg-emerald-50" : "border-slate-200"}`}
              >
                <div className="flex justify-between gap-2">
                  <p className="font-extrabold text-sm text-slate-900">{p.name}</p>
                  <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-slate-100 shrink-0 h-fit">{Math.max(0, p.slots - n)} cupos</span>
                </div>
                <p className="text-xs font-bold text-amber-700 mt-1">Requiere {formatCOP(p.cost)} en tu alcancía</p>
                {can ? <Hand variant="up cardh2" /> : null}
                <button
                  disabled={!can}
                  onClick={() => claimPrize(p.id)}
                  className={`mt-3 w-full py-2.5 rounded-xl font-extrabold text-sm ${
                    mine ? "bg-emerald-600 text-white" : can ? "bg-slate-900 text-white btn-3d" : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {mine
                    ? "Reclamado: avísale a tu profe"
                    : full
                      ? "Cupos agotados"
                      : !ok
                        ? "Completa el mes primero"
                        : s.coins < p.cost
                          ? `Te faltan ${formatCOP(p.cost - s.coins)}`
                          : "Reclamar premio"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
