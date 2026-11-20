import { Hand } from "@/components/brand/Hand";
import { MINICOURSES_META } from "@/data/minicourses";
import { formatCOP } from "@/lib/format";
import { SoundFX } from "@/services/sound";
import { useUiStore } from "@/store/uiStore";
import type { MiniCourseId, Student } from "@/types/finova";
import { DetectiveGame } from "./minicourses/DetectiveGame";
import { FrascosGame } from "./minicourses/FrascosGame";
import { PairsGame } from "./minicourses/PairsGame";

export function MiniCoursesTab({ student }: { student: Student }) {
  const activeCourseId = useUiStore((s) => s.activeCourseId);
  const firstPending = (["mc1", "mc2", "mc3"] as MiniCourseId[]).find((k) => !student.completedCourses.includes(k));
  return (
    <div className="space-y-6 animate-pop">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MINICOURSES_META.map((c) => {
          const done = student.completedCourses.includes(c.id);
          const isSelected = activeCourseId === c.id;
          return (
            <button
              key={c.id}
              onClick={() => {
                useUiStore.setState({ activeCourseId: c.id });
                SoundFX.tab();
              }}
              className={`relative text-left p-5 rounded-3xl border-2 transition-all btn-3d ${
                isSelected ? "border-emerald-600 bg-emerald-50/80 shadow-md" : "border-slate-200 bg-white hover:border-emerald-300"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">{c.icon}</span>
                <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${done ? "bg-emerald-600 text-white" : "bg-amber-100 text-amber-800"}`}>
                  {done ? "✓ Completado" : `+${formatCOP(c.reward)}`}
                </span>
              </div>
              {!done && c.id === firstPending ? <Hand variant="up cardh2" /> : null}
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700">{c.tag}</p>
              <h4 className="font-extrabold text-slate-900 text-base mt-0.5">{c.title}</h4>
            </button>
          );
        })}
      </div>

      <div className="card-soft p-6 sm:p-8">
        {activeCourseId === "mc1" ? (
          <PairsGame student={student} />
        ) : activeCourseId === "mc2" ? (
          <DetectiveGame student={student} />
        ) : (
          <FrascosGame student={student} />
        )}
      </div>
    </div>
  );
}
