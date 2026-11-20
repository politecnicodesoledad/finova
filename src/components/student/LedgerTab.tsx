import { formatCOP } from "@/lib/format";
import { getStudentCourse, monthTasks, rankList } from "@/services/rules";
import type { AppState, Student } from "@/types/finova";

/** "Control del Dinero": month checklist, road to the podium and transaction history. */
export function LedgerTab({ state, student: s }: { state: AppState; student: Student }) {
  const c = getStudentCourse(state, s);
  const t = monthTasks(state, s);
  const d = t.filter((x) => x[1]).length;
  const rl = rankList(state, c);
  const pos = rl.findIndex((x) => x.id == s.id) + 1;
  const th = rl[2];
  const gap = th ? Math.max(0, (th.pp || 0) - (s.pp || 0) + 1) : 0;
  const mx = Math.max(1, (rl[0] && rl[0].pp) || 1);
  const totalSavedInGoals = s.goals.reduce((acc, g) => acc + g.saved, 0);

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card-soft p-5 sm:p-6">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-slate-900 text-lg">Lo que falta este mes</h3>
            <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
              {d}/{t.length}
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden my-3">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.round((d / t.length) * 100)}%` }} />
          </div>
          <ul className="space-y-2.5">
            {t.map((x) => (
              <li key={x[0]} className={`flex items-center gap-3 text-sm font-bold ${x[1] ? "text-slate-400" : "text-slate-800"}`}>
                <span className={`w-6 h-6 rounded-full grid place-items-center text-xs shrink-0 ${x[1] ? "bg-emerald-500 text-white" : "bg-amber-100 text-amber-700"}`}>
                  {x[1] ? "✓" : "•"}
                </span>
                {x[0]}
              </li>
            ))}
          </ul>
        </div>
        <div className="card-soft p-5 sm:p-6">
          <h3 className="font-extrabold text-slate-900 text-lg">Tu camino al podio</h3>
          <p className="text-xs text-slate-500">
            Periodo {c.period} · {c.name}
          </p>
          <div className="flex items-end gap-3 my-3">
            <span className="text-5xl font-black text-emerald-600 leading-none">{pos}.º</span>
            <span className="text-sm font-bold text-slate-600 pb-1">de {rl.length} en tu curso</span>
          </div>
          <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${Math.min(100, Math.round(((s.pp || 0) / mx) * 100))}%` }} />
          </div>
          <p className="text-sm font-bold text-slate-700 mt-3">
            {pos && pos <= 3 ? "Estás en el podio. ¡Defiende tu lugar!" : `Te faltan ${gap} puntos para el 3.er lugar.`}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Puntos del periodo: {s.pp || 0}. Se ganan jugando, completando misiones y respondiendo rápido.
          </p>
        </div>
      </div>

      <div className="space-y-6 animate-pop">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card-soft p-5 border-l-4 border-amber-400">
            <p className="text-xs font-bold text-slate-500">Disponible en Alcancía</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{formatCOP(s.coins)}</p>
          </div>
          <div className="card-soft p-5 border-l-4 border-emerald-500">
            <p className="text-xs font-bold text-slate-500">Invertido en Metas</p>
            <p className="text-2xl font-black text-emerald-700 mt-1">{formatCOP(totalSavedInGoals)}</p>
          </div>
          <div className="card-soft p-5 border-l-4 border-sky-500">
            <p className="text-xs font-bold text-slate-500">Patrimonio Total Escolar</p>
            <p className="text-2xl font-black text-sky-700 mt-1">{formatCOP(s.coins + totalSavedInGoals)}</p>
          </div>
        </div>

        <div className="card-soft p-6">
          <h3 className="text-lg font-extrabold text-slate-900 mb-4">📊 Historial de Movimientos Financieros</h3>
          <div className="divide-y divide-slate-100">
            {s.transactions.length ? (
              s.transactions.map((tx, i) => (
                <div key={tx.id + i} className="py-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg ${
                        tx.type === "in" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {tx.type === "prize" ? "🎁" : tx.type === "in" ? "🪙" : "🐷"}
                    </span>
                    <div>
                      <p className="font-bold text-sm text-slate-800">{tx.title}</p>
                      <p className="text-xs text-slate-400">{tx.date}</p>
                    </div>
                  </div>
                  <span className={`font-extrabold text-sm ${tx.type === "in" ? "text-emerald-600" : "text-amber-600"}`}>
                    {tx.type === "prize" ? "Premio" : (tx.type === "in" ? "+" : "→ ") + formatCOP(tx.amount)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 py-4">Aún no hay movimientos registrados.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
