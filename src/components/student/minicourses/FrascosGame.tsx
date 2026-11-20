import { Hand } from "@/components/brand/Hand";
import { FRASCOS_TOTAL, checkFrascos } from "@/data/minicourses";
import { formatCOP } from "@/lib/format";
import { SoundFX } from "@/services/sound";
import { completeMiniCourse } from "@/store/appStore";
import { initialFrascos, useUiStore, type FrascosState } from "@/store/uiStore";
import type { Student } from "@/types/finova";

type JarKey = "n" | "w" | "s";
const JARS: [JarKey, string, string, string][] = [
  ["n", "Necesidades", "#059669", "Lo que no puede faltar"],
  ["w", "Deseos", "#f59e0b", "Lo que puede esperar"],
  ["s", "Ahorro", "#2563eb", "Para tu meta"],
];

const pocketOf = (fr: FrascosState) => FRASCOS_TOTAL - fr.n - fr.w - fr.s;

function Coin() {
  return (
    <span
      className="inline-grid place-items-center w-6 h-6 rounded-full text-[10px] font-black"
      style={{ background: "#f6b73c", border: "2px solid #c27a08", color: "#8a5206" }}
    >
      $
    </span>
  );
}

/** mc3 — Los 3 Frascos (regla 50/30/20) */
export function FrascosGame({ student }: { student: Student }) {
  const fr = useUiStore((s) => s.fr);
  const done = student.completedCourses.includes("mc3");
  const ok = fr.msg === "ok";
  const pocket = pocketOf(fr);

  const add = (k: JarKey, d: number) => {
    const cur = useUiStore.getState().fr;
    if (d > 0 && pocketOf(cur) <= 0) return;
    if (d < 0 && cur[k] <= 0) return;
    useUiStore.setState({ fr: { ...cur, [k]: cur[k] + d, msg: "" } });
    if (d > 0) SoundFX.coin();
  };
  const check = () => {
    const cur = useUiStore.getState().fr;
    const msg = checkFrascos(cur);
    useUiStore.setState({ fr: { ...cur, msg } });
    if (msg !== "ok") SoundFX.hit();
  };

  return (
    <div className="max-w-3xl mx-auto animate-pop">
      <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold">Reparte tu mesada</span>
      <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">Los 3 frascos</h3>
      <p className="text-sm text-slate-600 mb-3">
        Tienes 10 monedas de $1.000. Reparte <b>todas</b> así: la mitad a necesidades, un poco a deseos y lo demás a ahorrar (regla 50 / 30 / 20).
      </p>
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 mb-4 flex items-center gap-2 flex-wrap min-h-[52px]">
        <span className="text-xs font-extrabold text-amber-800 mr-1">Tu bolsillo:</span>
        {pocket > 0 ? (
          Array.from({ length: pocket }, (_, i) => <Coin key={i} />)
        ) : (
          <span className="text-xs font-bold text-emerald-700">Vacío: ¡ya repartiste todo!</span>
        )}
        {pocket == 10 ? <Hand variant="rt" /> : null}
      </div>
      <div className="grid grid-cols-3 gap-2 sm:gap-5">
        {JARS.map((j) => (
          <div key={j[0]} className="text-center">
            <p className="font-extrabold text-sm" style={{ color: j[2] }}>
              {j[1]}
            </p>
            <p className="text-[11px] font-semibold text-slate-500 mb-2 leading-tight">{j[3]}</p>
            <div
              className="h-36 rounded-2xl border-4 p-1.5 flex flex-wrap-reverse content-start justify-center gap-0.5 overflow-hidden bg-white"
              style={{ borderColor: j[2] }}
            >
              {Array.from({ length: fr[j[0]] }, (_, i) => (
                <Coin key={i} />
              ))}
            </div>
            <div className="flex items-center justify-center gap-2 mt-2">
              <button onClick={() => add(j[0], -1)} className="w-11 h-11 rounded-xl bg-slate-100 font-black text-xl">
                −
              </button>
              <span className="w-6 font-black">{fr[j[0]]}</span>
              <button onClick={() => add(j[0], 1)} className="w-11 h-11 rounded-xl text-white font-black text-xl" style={{ background: j[2] }}>
                +
              </button>
            </div>
          </div>
        ))}
      </div>
      <button onClick={check} className="mt-5 w-full py-3.5 rounded-2xl bg-slate-900 text-white font-extrabold btn-3d">
        Comprobar mi reparto
      </button>
      {fr.msg && !ok ? <p className="mt-3 p-3 rounded-2xl bg-rose-50 text-rose-700 text-sm font-bold text-center">{fr.msg}</p> : null}
      {ok ? (
        <div className="mt-4 bg-emerald-50 border-2 border-emerald-200 rounded-3xl p-5 text-center">
          <h4 className="text-xl font-extrabold">¡Reparto perfecto!</h4>
          <p className="text-sm text-slate-600">Cubriste lo necesario, te diste un gusto y ahorraste.</p>
          <div className="mt-3 flex flex-wrap justify-center gap-3">
            <button
              disabled={done}
              onClick={() => completeMiniCourse("mc3", "Los 3 Frascos de la Mesada", 3000, 80)}
              className={`px-6 py-3 rounded-2xl font-extrabold ${done ? "bg-slate-100 text-slate-400" : "bg-emerald-600 text-white btn-3d"}`}
            >
              {done ? "✓ Ya reclamado" : "Reclamar " + formatCOP(3000) + " y +80 XP"}
            </button>
            <button
              onClick={() => useUiStore.setState({ fr: initialFrascos() })}
              className="px-5 py-3 rounded-2xl bg-white border border-slate-200 font-extrabold text-sm"
            >
              Jugar otra vez
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
