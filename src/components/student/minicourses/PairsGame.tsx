import { Hand } from "@/components/brand/Hand";
import { MM_COL, MM_ORD, MM_P } from "@/data/minicourses";
import { formatCOP } from "@/lib/format";
import { SoundFX } from "@/services/sound";
import { completeMiniCourse } from "@/store/appStore";
import { initialPairs, useUiStore } from "@/store/uiStore";
import type { Student } from "@/types/finova";

/** mc1 — Une las Parejas */
export function PairsGame({ student }: { student: Student }) {
  const mm = useUiStore((s) => s.mm);
  const set = (next: typeof mm) => useUiStore.setState({ mm: next });
  const done = student.completedCourses.includes("mc1");
  const all = mm.done.length == 6;
  // v3 "space-y" pushed every child after the (absolute) hand down; keep that offset.
  const showHand = !mm.done.length && mm.sel == null;

  const pick = (i: number) => {
    if (mm.done.includes(i)) return;
    set({ ...mm, sel: mm.sel === i ? null : i, bad: null });
    SoundFX.tab();
  };
  const match = (j: number) => {
    if (mm.sel == null || mm.done.includes(j)) return;
    if (mm.sel === j) {
      set({ sel: null, done: [...mm.done, j], bad: null });
      SoundFX.coin();
    } else {
      set({ ...mm, bad: j, sel: null });
      SoundFX.hit();
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-pop">
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold">Juego de unir</span>
        <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">{mm.done.length}/6 parejas</span>
      </div>
      <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">Une cada palabra con su significado</h3>
      <p className="text-sm text-slate-600 mb-4">Toca una palabra de la izquierda y luego su significado de la derecha.</p>
      <div className="grid grid-cols-2 gap-3 sm:gap-5">
        <div className="space-y-2.5 relative">
          {showHand ? (
            <div className="absolute -right-2 -top-7 z-10">
              <Hand variant="dn" />
            </div>
          ) : null}
          {MM_P.map((p, i) => {
            const d = mm.done.includes(i);
            return (
              <button
                key={i}
                onClick={() => pick(i)}
                className={`${showHand && i === 0 ? "mt-2.5 " : ""}w-full min-h-[56px] text-left px-4 rounded-2xl border-2 font-extrabold text-sm sm:text-base transition-all ${
                  d ? "text-white" : mm.sel === i ? "bg-amber-50 border-amber-400 scale-[1.03] shadow-md" : "bg-white border-slate-200"
                }`}
                style={d ? { background: MM_COL[i], borderColor: MM_COL[i] } : undefined}
              >
                {d ? "✓ " : ""}
                {p[0]}
              </button>
            );
          })}
        </div>
        <div className="space-y-2.5">
          {MM_ORD.map((j) => {
            const d = mm.done.includes(j);
            return (
              <button
                key={j}
                onClick={() => match(j)}
                className={`w-full min-h-[56px] text-left px-4 py-2 rounded-2xl border-2 font-bold text-xs sm:text-sm leading-snug sm:leading-5 transition-all ${
                  mm.bad === j ? "mmbad border-rose-400 bg-rose-50" : d ? "text-white" : "bg-white border-slate-200"
                }`}
                style={d ? { background: MM_COL[j], borderColor: MM_COL[j] } : undefined}
              >
                {MM_P[j]![1]}
              </button>
            );
          })}
        </div>
      </div>
      {all ? (
        <div className="mt-5 bg-emerald-50 border-2 border-emerald-200 rounded-3xl p-5 text-center">
          <h4 className="text-xl font-extrabold text-slate-900">¡Todas las parejas!</h4>
          <div className="mt-3 flex flex-wrap justify-center gap-3">
            <button
              disabled={done}
              onClick={() => completeMiniCourse("mc1", "Une las Parejas del Dinero", 2500, 65)}
              className={`px-6 py-3 rounded-2xl font-extrabold ${done ? "bg-slate-100 text-slate-400" : "bg-emerald-600 text-white btn-3d"}`}
            >
              {done ? "✓ Ya reclamado" : "Reclamar " + formatCOP(2500) + " y +65 XP"}
            </button>
            <button onClick={() => set(initialPairs())} className="px-5 py-3 rounded-2xl bg-white border border-slate-200 font-extrabold text-sm">
              Jugar otra vez
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
