import { useStudentContext } from "@/hooks/useFinova";
import { nextTodo } from "@/services/rules";
import { ArcadeTab } from "./ArcadeTab";
import { GamesHub } from "./GamesHub";
import { HeroBanner } from "./HeroBanner";
import { LedgerTab } from "./LedgerTab";
import { MarketTab } from "./MarketTab";
import { MiniCoursesTab } from "./MiniCoursesTab";
import { MonthRoute } from "./MonthRoute";
import { PodiumCard } from "./PodiumCard";
import { PrizesTab } from "./PrizesTab";
import { StudentHeader } from "./StudentHeader";
import { StudentNav } from "./StudentNav";
import { TodoList } from "./TodoList";

export function StudentDashboard() {
  const { state, student, course } = useStudentContext();
  if (!student) return null;
  const next = nextTodo(state, student);
  const tab = state.activeTab;

  return (
    <>
      <StudentHeader student={student} />
      <StudentNav activeTab={tab} next={next} />
      <HeroBanner student={student} course={course} />

      <main>
        {tab === "panel" ? (
          <>
            <GamesHub student={student} course={course} next={next} />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-pop">
              <MonthRoute student={student} course={course} next={next} />
              <div className="lg:col-span-5 space-y-6">
                <div className="card-soft p-5 sm:p-7">
                  <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">🔥 Retos de Ahorro del Mes</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5 mb-4">Toca lo que sigue: la manito te muestra qué te falta este mes.</p>
                  <div className="space-y-3">
                    <TodoList student={student} course={course} next={next} />
                  </div>
                </div>
                <PodiumCard state={state} student={student} course={course} />
              </div>
            </div>
          </>
        ) : tab === "market" ? (
          <MarketTab />
        ) : tab === "arcade" ? (
          <ArcadeTab student={student} course={course} />
        ) : tab === "courses" ? (
          <MiniCoursesTab student={student} />
        ) : tab === "goals" ? (
          <PrizesTab state={state} student={student} />
        ) : tab === "ledger" ? (
          <LedgerTab state={state} student={student} />
        ) : null}
      </main>
    </>
  );
}
