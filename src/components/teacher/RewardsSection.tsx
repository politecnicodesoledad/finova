import { rankList } from "@/services/rules";
import { addPrize, closePeriod, deletePrize, setPodiumPlace, suggestPodium, updatePrize } from "@/store/appStore";
import type { AppState, Course, Student } from "@/types/finova";

const INP = "w-full p-2.5 rounded-xl border border-slate-200 font-bold text-sm bg-white";

/** "Podio y Premios": suggested ranking, choose top 3, close period, edit prizes. */
export function RewardsSection({ state, course: c, students }: { state: AppState; course: Course; students: Student[] }) {
  const rl = rankList(state, c);
  const claims = state.claims.filter((x) => x.courseId == c.id && x.period == c.period);
  return (
    <div className="grid lg:grid-cols-2 gap-6 animate-pop">
      <div className="card-soft p-5 sm:p-6">
        <h3 className="text-lg font-extrabold">
          Podio · {c.name} · Periodo {c.period} de 4
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Elige las 3 que van ganando; verán la nota 100 en su panel. Al cerrar el periodo el podio se archiva y los puntos del periodo vuelven a cero (nivel y XP
          se conservan).
        </p>
        <div className="space-y-3 mb-4">
          {[0, 1, 2].map((i) => (
            <div key={i}>
              <p className="text-xs font-extrabold text-slate-500 mb-1">{i + 1}.º lugar</p>
              <select value={c.podium[i] ?? ""} onChange={(e) => setPodiumPlace(c.id, i, e.target.value)} className={INP}>
                <option value="">Elegir estudiante</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName || s.name}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mb-5">
          <button onClick={() => suggestPodium(c.id)} className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-extrabold text-sm btn-3d">
            Usar ranking sugerido
          </button>
          <button onClick={() => closePeriod(c.id)} className="px-4 py-2.5 rounded-xl bg-amber-500 text-white font-extrabold text-sm btn-3d">
            Cerrar periodo y reiniciar
          </button>
        </div>
        <h4 className="font-extrabold text-sm mb-2">Ranking sugerido</h4>
        <ol className="space-y-1.5 text-sm">
          {rl.length ? (
            rl.slice(0, 5).map((s, i) => (
              <li key={s.id} className="flex justify-between bg-slate-50 rounded-xl px-3 py-2 font-bold">
                <span>
                  {i + 1}. {s.fullName || s.name}
                </span>
                <span className="text-emerald-700">{s.pp || 0} pts</span>
              </li>
            ))
          ) : (
            <li className="text-slate-500">Sin estudiantes.</li>
          )}
        </ol>
        {c.podiumHistory.length ? (
          <>
            <h4 className="font-extrabold text-sm mt-5 mb-2">Podios anteriores</h4>
            {c.podiumHistory.map((h, i) => (
              <p key={i} className="text-xs font-bold text-slate-600">
                Periodo {h.period}: {h.names.join(", ") || "sin podio"}
              </p>
            ))}
          </>
        ) : null}
      </div>

      <div className="card-soft p-5 sm:p-6">
        <h3 className="text-lg font-extrabold">Premios del colegio</h3>
        <p className="text-xs text-slate-500 mb-4">Edita nombre, monedas requeridas y cupos por curso. Ganan las primeras que cumplan todo el mes.</p>
        {state.prizes.map((p) => (
          <div key={p.id} className="grid grid-cols-12 gap-2 mb-2">
            <input defaultValue={p.name} onBlur={(e) => updatePrize(p.id, "name", e.target.value)} className={`col-span-12 sm:col-span-6 ${INP}`} />
            <input type="number" defaultValue={p.cost} onBlur={(e) => updatePrize(p.id, "cost", e.target.value)} className={`col-span-5 sm:col-span-3 ${INP}`} />
            <input type="number" defaultValue={p.slots} onBlur={(e) => updatePrize(p.id, "slots", e.target.value)} className={`col-span-4 sm:col-span-2 ${INP}`} />
            <button onClick={() => deletePrize(p.id)} className="col-span-3 sm:col-span-1 rounded-xl bg-rose-50 text-rose-600 font-black">
              X
            </button>
          </div>
        ))}
        <p className="text-[11px] text-slate-400 mb-3">Orden: nombre · monedas · cupos</p>
        <button onClick={addPrize} className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-extrabold text-sm btn-3d">
          + Agregar premio
        </button>
        <h4 className="font-extrabold text-sm mt-5 mb-2">Reclamos del periodo</h4>
        {claims.length ? (
          claims.map((x) => {
            const st = state.students.find((s) => s.id == x.studentId);
            const pr = state.prizes.find((p) => p.id == x.prizeId);
            return (
              <p key={x.id} className="text-xs font-bold text-slate-600">
                {st ? st.name : "?"} · {pr ? pr.name : ""}
              </p>
            );
          })
        ) : (
          <p className="text-xs text-slate-500">Aún no hay reclamos.</p>
        )}
      </div>
    </div>
  );
}
