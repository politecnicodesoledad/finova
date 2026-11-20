import type { CSSProperties, ReactNode } from "react";
import { HandSvg } from "@/components/brand/Hand";
import { PiggyMascot } from "@/components/brand/PiggyMascot";
import { formatCOP } from "@/lib/format";
import { curMonth, playsLeft } from "@/services/rules";
import { switchTab } from "@/store/appStore";
import type { Course, GameId, NextTodo, Student } from "@/types/finova";

const CoinsArt = (
  <svg viewBox="0 0 64 64" width="70">
    <circle cx="24" cy="40" r="16" fill="#f59e0b" />
    <circle cx="24" cy="40" r="11" fill="#fbbf24" stroke="#d97706" strokeWidth="2.5" />
    <circle cx="42" cy="26" r="16" fill="#f59e0b" />
    <circle cx="42" cy="26" r="11" fill="#fbbf24" stroke="#d97706" strokeWidth="2.5" />
    <text x="42" y="32" textAnchor="middle" fontSize="16" fontWeight="900" fill="#b45309">
      $
    </text>
  </svg>
);

/** "Sala de juegos" — the two game tiles at the top of the monthly panel. */
export function GamesHub({ student, course, next }: { student: Student; course: Course; next: NextTodo | null }) {
  const games: [GameId, string, string, number, string, string, ReactNode][] = [
    ["arcade", "Caza-Monedas", "Atrapa monedas, activa el escudo y esquiva los gastos hormiga. Reflejos puros.", student.highScoreArcade || 0, "#f59e0b", "#fef3c7", CoinsArt],
    ["market", "El Mercadito de la Alcancía", "Clasifica necesidades, deseos y ahorros, toma decisiones y reúne el dinero de tu bicicleta.", student.mkBest || 0, "#059669", "#d1fae5", <PiggyMascot size={76} />],
  ];
  return (
    <section className="mb-6">
      <div className="flex items-end justify-between mb-3">
        <h2 className="font-display font-black text-xl text-slate-900">Sala de juegos</h2>
        <span className="text-xs font-bold text-slate-500">Dos juegos, dos formas de aprender</span>
      </div>
      <div className="grid md:grid-cols-2 gap-5 stagger">
        {games.map((g) => (
          <button key={g[0]} onClick={() => switchTab(g[0])} className="gtile" style={{ "--g": g[4] } as CSSProperties}>
            {next?.tab === g[0] ? (
              <span className="hand up cardh2">
                <HandSvg />
              </span>
            ) : null}
            <div className="art" style={{ background: g[5] }}>
              {g[6]}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-display font-black text-lg text-slate-900 leading-tight">{g[1]}</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-snug sm:leading-5">{g[2]}</p>
              <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1.5 rounded-full text-white text-xs font-extrabold" style={{ background: g[4] }}>
                  Jugar ahora
                </span>
                <span className="text-xs font-extrabold text-slate-500">Récord: {formatCOP(g[3]).replace("$", "")} pts</span>
                <span className="text-xs font-extrabold text-emerald-700">{playsLeft(student, g[0], curMonth(course))}/2 partidas</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
