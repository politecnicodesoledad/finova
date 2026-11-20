import { useRef, useState } from "react";
import { MONTHS_CATALOG } from "@/data/catalog";
import { fisherYatesShuffle, formatCOP } from "@/lib/format";
import { SoundFX } from "@/services/sound";
import { showToast } from "@/store/toastStore";
import { closeModal, completeMonthForStudent, recordBestSpeed, useAppStore } from "@/store/appStore";
import { useActiveStudent } from "@/hooks/useFinova";
import type { Question } from "@/types/finova";

interface PreparedQuestion extends Question {
  shuffledOptions: { text: string; isCorrect: boolean }[];
}

/** Picks 3 questions (prioritizing the month) and shuffles their options with Fisher-Yates. */
function prepareQuestions(all: Question[], monthId: number): PreparedQuestion[] {
  let pool = all.filter((q) => q.monthId === monthId);
  if (pool.length < 3) {
    const others = fisherYatesShuffle(all.filter((q) => q.monthId !== monthId));
    pool = [...pool, ...others].slice(0, 3);
  } else {
    pool = fisherYatesShuffle(pool).slice(0, 3);
  }
  return pool.map((q) => ({
    ...q,
    shuffledOptions: fisherYatesShuffle(q.options.map((text, idx) => ({ text, isCorrect: idx === q.correctIndex }))),
  }));
}

export function MonthMissionModal({ monthId }: { monthId: number }) {
  const student = useActiveStudent();
  const [questions] = useState(() => prepareQuestions(useAppStore.getState().questions, monthId));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const correctCount = useRef(0);
  const startTime = useRef(performance.now());
  const [isAlreadyDone] = useState(() => !!student?.completedMonths.includes(monthId));

  const monthObj = MONTHS_CATALOG.find((m) => m.id === monthId);
  const q = questions[currentIdx];
  if (!monthObj || !q || !student) return null;

  const answered = chosen !== null;
  const chosenOpt = answered ? q.shuffledOptions[chosen] : undefined;
  const isLast = currentIdx >= questions.length - 1;

  const pick = (idx: number) => {
    if (answered) return;
    const opt = q.shuffledOptions[idx];
    if (opt?.isCorrect) {
      correctCount.current++;
      SoundFX.coin();
    } else {
      SoundFX.hit();
    }
    setChosen(idx);
  };

  const next = () => {
    if (!isLast) {
      setCurrentIdx((i) => i + 1);
      setChosen(null);
      return;
    }
    const elapsed = Number(((performance.now() - startTime.current) / 1000).toFixed(1));
    const correct = correctCount.current;
    if (correct >= 2) recordBestSpeed(elapsed);
    closeModal();
    if (correct >= 2) {
      completeMonthForStudent(monthId);
    } else {
      SoundFX.hit();
      showToast(
        "¡Casi lo logras!",
        `Acertaste ${correct} de ${questions.length}. Inténtalo de nuevo para marcar el mes como cumplido.`,
        "warn",
      );
    }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl shadow-[inset_0_2px_4px_0_rgb(0_0_0/0.05)]">
            {monthObj.icon}
          </div>
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600">
              Misión Mes {monthId} • {monthObj.name}
            </span>
            <h3 className="text-xl font-extrabold text-slate-900">{monthObj.title}</h3>
          </div>
        </div>
        <button
          onClick={closeModal}
          className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center"
        >
          ✕
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs font-bold text-slate-500">
        <span>
          Reto {currentIdx + 1} de {questions.length}
        </span>
        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800">
          Premio: +{formatCOP(isAlreadyDone ? 800 : monthObj.rewardCoins)} • +{isAlreadyDone ? 25 : monthObj.rewardXP} XP
        </span>
      </div>

      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mt-2 mb-5">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 transition-all duration-300"
          style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 mb-5">
        <p className="text-base sm:text-lg font-bold text-slate-800 leading-snug sm:leading-7">{q.question}</p>
      </div>

      <div className="space-y-3">
        {q.shuffledOptions.map((opt, idx) => {
          const isChosen = chosen === idx;
          const stateCls = isChosen
            ? opt.isCorrect
              ? "border-emerald-500 bg-emerald-100 text-emerald-950"
              : "border-rose-400 bg-rose-50 text-rose-900"
            : "border-slate-200";
          return (
            <button
              key={`${currentIdx}-${idx}`}
              disabled={answered}
              onClick={() => pick(idx)}
              className={`mission-opt-btn w-full text-left p-4 rounded-2xl border-2 ${stateCls} hover:border-emerald-500 hover:bg-emerald-50/60 transition-all font-semibold text-slate-700 flex items-center gap-3 btn-3d`}
            >
              <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-extrabold text-sm flex items-center justify-center shrink-0">
                {["A", "B", "C", "D"][idx]}
              </span>
              <span className="flex-1">{opt.text}</span>
            </button>
          );
        })}
      </div>

      {answered && chosenOpt ? (
        chosenOpt.isCorrect ? (
          <div className="mt-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 animate-pop">
            <p className="font-extrabold text-sm flex items-center gap-2">✅ ¡Excelente decisión financiera!</p>
            <p className="text-xs sm:text-sm mt-1">{q.explanation}</p>
            <div className="mt-4 flex justify-end">
              <button onClick={next} className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm btn-3d">
                {!isLast ? "Siguiente Reto →" : "¡Reclamar Recompensa! 🏆"}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 animate-pop">
            <p className="font-extrabold text-sm flex items-center gap-2">💡 ¡Buen intento! Aprendamos juntos:</p>
            <p className="text-xs sm:text-sm mt-1">{q.explanation}</p>
            <div className="mt-4 flex justify-end">
              <button onClick={next} className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm btn-3d">
                {!isLast ? "Continuar →" : "Finalizar Misión ✨"}
              </button>
            </div>
          </div>
        )
      ) : null}
    </>
  );
}
