import { FinovaHexagon } from "@/components/brand/FinovaLogo";
import { StudentAvatar } from "@/components/brand/StudentAvatar";
import { useSoundEnabled } from "@/hooks/useFinova";
import { formatCOP, getLevelInfo } from "@/lib/format";
import { SoundFX } from "@/services/sound";
import { logoutUser, switchTab } from "@/store/appStore";
import type { Student } from "@/types/finova";

export function StudentHeader({ student }: { student: Student }) {
  const soundOn = useSoundEnabled();
  const lvl = getLevelInfo(student.xp);
  return (
    <header className="bg-[#0f172a] text-white rounded-full px-4 sm:px-6 py-2.5 shadow-xl flex flex-wrap items-center justify-between gap-3 mb-5">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => switchTab("panel")}>
        <FinovaHexagon size={36} />
        <div>
          <div className="font-display font-black text-base sm:text-lg tracking-wider leading-none sm:leading-7">FINOVA</div>
          <div className="text-[9px] sm:text-[10px] font-bold tracking-[0.2em] text-emerald-400 mt-0.5">FINANZAS INTELIGENTES</div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
        <div className="px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-amber-500/40 flex items-center gap-1.5 text-xs sm:text-sm font-extrabold">
          <span>💰</span>
          <span className="text-slate-300 hidden md:inline">Alcancía:</span>
          <span className="text-amber-400">{formatCOP(student.coins)}</span>
        </div>

        <div className="px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-emerald-500/40 flex items-center gap-1.5 text-xs sm:text-sm font-extrabold">
          <span>⭐</span>
          <span className="text-emerald-400">{student.xp} XP</span>
        </div>

        <div className="px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-sky-500/30 flex items-center gap-1.5 text-xs sm:text-sm font-extrabold">
          <span>🏆</span>
          <span className="text-slate-200">Nivel {lvl.level}</span>
        </div>

        <button
          onClick={() => SoundFX.toggle()}
          title="Activar/Silenciar sonidos"
          className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-sm transition-colors"
        >
          {soundOn ? "🔊" : "🔇"}
        </button>

        <div className="pl-2 pr-3 py-1 rounded-full bg-slate-800/90 border border-slate-700 flex items-center gap-2">
          <div className="w-7 h-7 rounded-full overflow-hidden shrink-0">
            <StudentAvatar style={student.avatarStyle} size={28} />
          </div>
          <span className="text-xs sm:text-sm font-bold text-white">{student.name}</span>
          <span className="text-slate-500">•</span>
          <button onClick={logoutUser} className="text-xs font-bold text-slate-300 hover:text-rose-400 transition-colors">
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}
