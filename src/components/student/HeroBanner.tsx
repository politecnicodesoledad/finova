import { PiggyMascot } from "@/components/brand/PiggyMascot";
import { StudentAvatar } from "@/components/brand/StudentAvatar";
import { MONTHS_CATALOG } from "@/data/catalog";
import { getLevelInfo } from "@/lib/format";
import { openMonthMissionModal, openOdsModal } from "@/store/appStore";
import type { Course, Student } from "@/types/finova";

export function HeroBanner({ student, course }: { student: Student; course: Course }) {
  const lvl = getLevelInfo(student.xp);
  const nextOpenMonthId =
    course.unlockedMonths.find((m) => !student.completedMonths.includes(m)) ||
    course.unlockedMonths[course.unlockedMonths.length - 1] ||
    1;
  const nextOpenMonth = MONTHS_CATALOG.find((m) => m.id === nextOpenMonthId) || MONTHS_CATALOG[0]!;

  return (
    <section className="hero-gradient rounded-[28px] p-5 sm:p-7 text-white shadow-xl shadow-emerald-900/15 mb-6 relative overflow-hidden">
      <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute right-36 -bottom-16 w-44 h-44 rounded-full bg-emerald-300/10 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="relative shrink-0 flex items-end">
            <StudentAvatar style={student.avatarStyle} size={82} />
            <div className="-ml-3 mb-0.5 drop-shadow-md">
              <PiggyMascot size={46} />
            </div>
          </div>

          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-extrabold tracking-wide mb-1.5">
              {course.name} • Club FINOVA
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
              ¡Hola, {student.name}! <span>✨</span>
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 font-medium mt-0.5">
              Tu dinero. Tus metas. <span className="text-amber-300 font-extrabold">Nuestro plan.</span>
            </p>

            <div className="mt-3 inline-flex flex-col sm:flex-row sm:items-center gap-2 bg-emerald-950/40 border border-emerald-400/25 rounded-2xl px-3.5 py-2">
              <div className="flex items-center gap-1.5 text-xs font-extrabold">
                <span>{lvl.title}</span>
                <span>☀️</span>
                <span className="text-amber-300">
                  {lvl.currentLevelXP} / {lvl.nextLevelXP} XP
                </span>
              </div>
              <div className="w-36 h-2 bg-emerald-950 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full transition-all duration-300" style={{ width: `${lvl.percent}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
          <button
            onClick={() => openMonthMissionModal(nextOpenMonthId)}
            className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-950/20 flex items-center justify-center gap-2 btn-3d"
          >
            <span>🎮</span>
            <span>Jugar Misión del Mes ({nextOpenMonth.name})</span>
          </button>
          <button
            onClick={openOdsModal}
            className="px-6 py-3 rounded-2xl bg-[#0f172a] hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 btn-3d"
          >
            <span>🌍</span>
            <span>Sobre FINOVA y los ODS</span>
          </button>
        </div>
      </div>
    </section>
  );
}
