import { useEffect, useRef, useState } from "react";
import { PiggyMascot } from "@/components/brand/PiggyMascot";
import { DIFFICULTY_CONFIGS, type DifficultyId } from "@/data/arcade";
import { startArcade, type ArcadeHud, type ArcadeResult } from "@/games/arcade/engine";
import { formatCOP } from "@/lib/format";
import { curMonth, playsLeft } from "@/services/rules";
import { SoundFX } from "@/services/sound";
import { finishArcadeGame, registerPlay, switchTab } from "@/store/appStore";
import { showToast } from "@/store/toastStore";
import { useUiStore } from "@/store/uiStore";
import type { Course, Student } from "@/types/finova";

type Overlay = { kind: "start" } | { kind: "end"; result: ArcadeResult; difficulty: DifficultyId } | { kind: "hidden" };

export function ArcadeTab({ student, course }: { student: Student; course: Course }) {
  const difficulty = useUiStore((s) => s.arcadeDifficulty);
  const diff = DIFFICULTY_CONFIGS[difficulty];
  const [overlay, setOverlay] = useState<Overlay>({ kind: "start" });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const leftRef = useRef<HTMLButtonElement>(null);
  const rightRef = useRef<HTMLButtonElement>(null);
  const coinsRef = useRef<HTMLSpanElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const livesRef = useRef<HTMLSpanElement>(null);
  const comboRef = useRef<HTMLSpanElement>(null);
  const stopRef = useRef<(() => void) | null>(null);

  const stopGame = () => {
    stopRef.current?.();
    stopRef.current = null;
  };
  useEffect(() => stopGame, []);

  const updateHud = (h: ArcadeHud) => {
    if (coinsRef.current) coinsRef.current.textContent = formatCOP(h.scoreCoins);
    if (timeRef.current) timeRef.current.textContent = `${h.timeLeft}s`;
    if (livesRef.current) livesRef.current.textContent = "❤️".repeat(Math.max(0, h.lives)) + "🖤".repeat(Math.max(0, 3 - h.lives));
    if (comboRef.current) comboRef.current.textContent = `x${Math.max(1, 1 + Math.floor(h.combo / 3))}`;
  };

  const startArcadeGame = () => {
    if (!registerPlay("arcade")) {
      showToast("Límite del mes", "Ya usaste tus 2 partidas de Caza-Monedas este mes. ¡Vuelve el próximo mes!", "info");
      return;
    }
    stopGame();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const playedDifficulty = difficulty;
    stopRef.current = startArcade({
      canvas,
      leftBtn: leftRef.current,
      rightBtn: rightRef.current,
      diff,
      onHud: updateHud,
      onFinish: (result) => {
        stopRef.current = null;
        finishArcadeGame(result.scoreCoins, result.xpEarned, playedDifficulty);
        setOverlay({ kind: "end", result, difficulty: playedDifficulty });
      },
    });
  };

  const launchArcadeFromOverlay = () => {
    setOverlay({ kind: "hidden" });
    startArcadeGame();
  };

  const selectDifficulty = (id: DifficultyId) => {
    stopGame();
    useUiStore.setState({ arcadeDifficulty: id });
    SoundFX.click();
    setOverlay({ kind: "start" });
    updateHud({ scoreCoins: 0, timeLeft: 40, lives: 3, combo: 0 });
  };

  const endDiff = overlay.kind === "end" ? DIFFICULTY_CONFIGS[overlay.difficulty] : diff;

  return (
    <div className="space-y-5 animate-pop">
      <div className="card-soft p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold uppercase">🎮 Arcade Colorido FINOVA</span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-1">Caza-Monedas: Elige tu Dificultad por + Monedas</h2>
            <p className="text-sm text-slate-600">Atrapa monedas de oro y diamantes, activa el escudo o el imán y esquiva los gastos hormiga.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 shrink-0">
            {Object.values(DIFFICULTY_CONFIGS).map((d) => {
              const selected = difficulty === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => selectDifficulty(d.id)}
                  className={`text-left p-3 rounded-2xl border-2 transition-all btn-3d ${
                    selected ? "border-emerald-600 bg-emerald-50 shadow-xs" : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-sm text-slate-900">{d.label}</span>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        d.id === "maestra" ? "bg-rose-100 text-rose-700" : d.id === "estratega" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {d.multiplier}x
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-500 mt-0.5">{d.badge}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card-soft p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 px-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="px-3.5 py-1.5 rounded-2xl bg-amber-100 text-amber-900 font-black text-sm flex items-center gap-1.5">
              🪙 <span ref={coinsRef}>$ 0</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-2xl bg-sky-100 text-sky-900 font-black text-sm flex items-center gap-1.5">
              ⏱️ <span ref={timeRef}>40s</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-2xl bg-purple-100 text-purple-900 font-black text-sm">
              Combo <span ref={comboRef}>x1</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span ref={livesRef} className="text-base tracking-wider">
              ❤️❤️❤️
            </span>
            <button onClick={startArcadeGame} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm btn-3d">
              ▶ Jugar · quedan <span>{playsLeft(student, "arcade", curMonth(course))}</span>/2
            </button>
          </div>
        </div>

        <div className="relative w-full h-[380px] sm:h-[440px] rounded-2xl overflow-hidden border-2 border-emerald-200 bg-sky-100">
          <canvas id="arcadeCanvas" ref={canvasRef} />

          {overlay.kind === "start" ? (
            <div className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px] flex items-center justify-center p-4">
              <div className="bg-white/95 rounded-3xl p-6 max-w-md w-full text-center shadow-2xl border-2 border-amber-300 animate-pop">
                <div className="flex justify-center mb-2">
                  <PiggyMascot size={64} />
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold">
                  Dificultad: {diff.label} ({diff.badge})
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-2">¡Listos para Cazar Monedas!</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">{diff.desc}</p>
                <div className="grid grid-cols-4 gap-2 my-4 text-xs font-bold text-slate-700">
                  <div className="bg-amber-50 p-2 rounded-xl">🪙<br />+$1.000</div>
                  <div className="bg-sky-50 p-2 rounded-xl">💎<br />+$3.000</div>
                  <div className="bg-emerald-50 p-2 rounded-xl">🛡️<br />Escudo</div>
                  <div className="bg-rose-50 p-2 rounded-xl">🐜<br />Esquiva</div>
                </div>
                <button
                  onClick={launchArcadeFromOverlay}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-extrabold text-base shadow-lg btn-3d"
                >
                  🚀 ¡Empezar Partida ({diff.multiplier}x Monedas)!
                </button>
              </div>
            </div>
          ) : overlay.kind === "end" ? (
            <div className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px] flex items-center justify-center p-4">
              <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl border-2 border-emerald-200 animate-pop">
                <div className="text-5xl mb-2">🏆</div>
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold uppercase">
                  Modo {endDiff.label} ({endDiff.multiplier}x)
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-2">¡Partida Terminada!</h3>
                <p className="text-sm text-slate-600 mt-1">Tus monedas atrapadas ya se sumaron a tu Alcancía.</p>
                <div className="grid grid-cols-2 gap-3 my-5">
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3">
                    <p className="text-xs font-bold text-amber-700">Monedas Ganadas</p>
                    <p className="text-xl font-black text-amber-900 mt-0.5">+{formatCOP(overlay.result.scoreCoins)}</p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3">
                    <p className="text-xs font-bold text-emerald-700">Experiencia</p>
                    <p className="text-xl font-black text-emerald-900 mt-0.5">+{overlay.result.xpEarned} XP</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <button onClick={launchArcadeFromOverlay} className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm btn-3d">
                    🎮 Jugar de Nuevo
                  </button>
                  <button onClick={() => switchTab("panel")} className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm btn-3d">
                    Ir a mi Panel
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex items-center justify-between gap-4">
          <button ref={leftRef} className="flex-1 py-3.5 rounded-2xl bg-slate-900 active:bg-emerald-700 text-white font-extrabold text-base select-none btn-3d">
            ⬅️ Mover Izquierda
          </button>
          <span className="hidden sm:inline text-xs font-bold text-slate-500 text-center">Usa flechas ◀ ▶, arrastra tu dedo o toca los botones</span>
          <button ref={rightRef} className="flex-1 py-3.5 rounded-2xl bg-slate-900 active:bg-emerald-700 text-white font-extrabold text-base select-none btn-3d">
            Mover Derecha ➡️
          </button>
        </div>
      </div>
    </div>
  );
}
