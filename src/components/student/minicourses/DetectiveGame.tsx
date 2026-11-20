import { MC2_ITEMS } from "@/data/minicourses";
import { SoundFX } from "@/services/sound";
import { completeMiniCourse } from "@/store/appStore";
import { initialDetective, useUiStore } from "@/store/uiStore";
import type { Student } from "@/types/finova";

function answerMc2(choice: "need" | "want") {
  const mc2 = useUiStore.getState().mc2;
  const item = MC2_ITEMS[mc2.index];
  if (!item) return;
  const isOk = item.type === choice;
  if (isOk) SoundFX.coin();
  else SoundFX.hit();
  useUiStore.setState({
    mc2: { ...mc2, score: mc2.score + (isOk ? 1 : 0), feedback: { ok: isOk, text: (isOk ? "✅ " : "💡 ") + item.tip } },
  });
  setTimeout(() => {
    const cur = useUiStore.getState().mc2;
    if (cur.index < MC2_ITEMS.length - 1) useUiStore.setState({ mc2: { ...cur, index: cur.index + 1, feedback: null } });
    else useUiStore.setState({ mc2: { ...cur, finished: true } });
  }, 1250);
}

/** mc2 — Detective de Gastos */
export function DetectiveGame({ student }: { student: Student }) {
  const mc2 = useUiStore((s) => s.mc2);
  const currentItem = MC2_ITEMS[mc2.index]!;
  return (
    <div className="max-w-2xl mx-auto text-center animate-pop">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold mb-2">
        🕵️‍♀️ Clasifica cada tarjeta: ¿Necesidad o Deseo?
      </div>
      <h3 className="text-2xl font-extrabold text-slate-900">Detective de Gastos Inteligentes</h3>
      <p className="text-sm text-slate-600 mt-1 mb-5">Ayuda a Valeria a decidir qué es indispensable y qué es un antojo.</p>

      {!mc2.finished ? (
        <>
          <div className="flex items-center justify-between text-xs font-extrabold text-slate-500 mb-2">
            <span>
              Tarjeta {mc2.index + 1} de {MC2_ITEMS.length}
            </span>
            <span className="text-emerald-700">
              Aciertos: {mc2.score} / {MC2_ITEMS.length}
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-6">
            <div className="h-full bg-amber-400 transition-all" style={{ width: `${((mc2.index + 1) / MC2_ITEMS.length) * 100}%` }} />
          </div>

          <div className="bg-gradient-to-b from-white to-emerald-50/60 border-2 border-emerald-200 rounded-3xl p-8 shadow-md mb-6">
            <div className="text-6xl mb-3 animate-float">{currentItem.emoji}</div>
            <h4 className="text-xl font-extrabold text-slate-900">{currentItem.name}</h4>
            {mc2.feedback ? (
              <div
                className={`mt-4 p-3 rounded-2xl text-xs sm:text-sm font-bold ${
                  mc2.feedback.ok ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900"
                }`}
              >
                {mc2.feedback.text}
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => answerMc2("need")}
              className="py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base shadow-lg shadow-emerald-600/20 btn-3d flex items-center justify-center gap-2"
            >
              🎒 Es una NECESIDAD
            </button>
            <button
              onClick={() => answerMc2("want")}
              className="py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-base shadow-lg shadow-amber-500/20 btn-3d flex items-center justify-center gap-2"
            >
              🍦 Es un DESEO / Antojo
            </button>
          </div>
        </>
      ) : (
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-3xl p-8">
          <div className="text-5xl mb-2">🎖️</div>
          <h4 className="text-2xl font-extrabold text-slate-900">¡Caso Resuelto, Detective!</h4>
          <p className="text-sm text-slate-700 mt-1">
            Clasificaste correctamente{" "}
            <strong>
              {mc2.score} de {MC2_ITEMS.length}
            </strong>{" "}
            elementos.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => completeMiniCourse("mc2", "Detective de Gastos", 2500, 65)}
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm btn-3d"
            >
              {student.completedCourses.includes("mc2") ? "✓ Ya reclamado" : "🪙 Reclamar +$2.500 y +65 XP"}
            </button>
            <button
              onClick={() => useUiStore.setState({ mc2: initialDetective() })}
              className="px-5 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-sm btn-3d"
            >
              Volver a jugar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
