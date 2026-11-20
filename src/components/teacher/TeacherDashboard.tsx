import { useState } from "react";
import { FinovaHexagon } from "@/components/brand/FinovaLogo";
import { StudentAvatar } from "@/components/brand/StudentAvatar";
import { MONTHS_CATALOG } from "@/data/catalog";
import { useSoundEnabled } from "@/hooks/useFinova";
import { formatCOP, getLevelInfo } from "@/lib/format";
import { SoundFX } from "@/services/sound";
import {
  addTeacherQuestion,
  createNewCourse,
  deleteQuestion,
  deleteStudentAccount,
  loginAsStudent,
  logoutUser,
  toggleCourseMonth,
  unlockNextMonthForCourse,
  useAppStore,
} from "@/store/appStore";
import { useUiStore, type TeacherSection } from "@/store/uiStore";
import { RewardsSection } from "./RewardsSection";

export function TeacherDashboard() {
  const state = useAppStore((s) => s);
  const soundOn = useSoundEnabled();
  const teacherSelectedCourseId = useUiStore((s) => s.teacherSelectedCourseId);
  const teacherSectionTab = useUiStore((s) => s.teacherSectionTab);
  const selectedCourse = state.courses.find((c) => c.id === teacherSelectedCourseId) || state.courses[0]!;
  const courseStudents = state.students.filter((s) => s.courseId === selectedCourse.id);

  const [newGrade, setNewGrade] = useState("4°");
  const [newSection, setNewSection] = useState("");
  const [tq, setTq] = useState({ month: "1", text: "", o0: "", o1: "", o2: "", exp: "" });

  const sections: { id: TeacherSection; icon: string; label: string }[] = [
    { id: "months", icon: "🗓️", label: `Habilitar Meses (${selectedCourse.name})` },
    { id: "students", icon: "👩‍🎓", label: `Estudiantes y Cumplimiento (${courseStudents.length})` },
    { id: "questions", icon: "❓", label: `Preguntas de Misiones (${state.questions.length})` },
    { id: "rewards", icon: "🏆", label: "Podio y Premios" },
  ];

  return (
    <>
      <header className="bg-[#0f172a] text-white rounded-full px-5 py-3 shadow-xl flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <FinovaHexagon size={36} />
          <div>
            <div className="font-display font-black text-base sm:text-lg tracking-wider leading-none sm:leading-7">FINOVA • DOCENTES</div>
            <div className="text-[10px] font-bold tracking-[0.18em] text-amber-400 mt-0.5">PANEL DE GESTIÓN ESCOLAR</div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={() => SoundFX.toggle()} className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-sm">
            {soundOn ? "🔊" : "🔇"}
          </button>
          <div className="px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700 flex items-center gap-2 text-xs sm:text-sm font-bold">
            <span>👩‍🏫</span>
            <span>{state.teacher.name}</span>
            <span className="text-slate-500">•</span>
            <button onClick={logoutUser} className="text-rose-400 hover:text-rose-300 font-extrabold">
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className="card-soft p-5 sm:p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">Organización por Salones</span>
            <h2 className="text-xl font-extrabold text-slate-900">Selecciona un Curso para Habilitar Meses y Ver Progreso</h2>
            <div className="flex flex-wrap gap-2 mt-3">
              {state.courses.map((c) => {
                const active = c.id === selectedCourse.id;
                const count = state.students.filter((s) => s.courseId === c.id).length;
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      useUiStore.setState({ teacherSelectedCourseId: c.id });
                      SoundFX.click();
                    }}
                    className={`px-4 py-2.5 rounded-2xl font-extrabold text-xs sm:text-sm border-2 transition-all btn-3d ${
                      active ? "border-emerald-600 bg-emerald-600 text-white shadow-md" : "border-slate-200 bg-slate-50 text-slate-700 hover:border-emerald-300"
                    }`}
                  >
                    🏫 {c.name}{" "}
                    <span className="opacity-80 text-xs">
                      ({count} est. • Cód: {c.code})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex flex-wrap items-end gap-2">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase">Grado</label>
              <select value={newGrade} onChange={(e) => setNewGrade(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white">
                <option value="3°">3°</option>
                <option value="4°">4°</option>
                <option value="5°">5°</option>
                <option value="6°">6°</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase">Letra</label>
              <input
                value={newSection}
                onChange={(e) => setNewSection(e.target.value)}
                type="text"
                maxLength={2}
                placeholder="C"
                className="w-14 px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold uppercase bg-white"
              />
            </div>
            <button
              onClick={() => {
                if (!newSection.trim()) return;
                createNewCourse(newGrade, newSection);
                setNewSection("");
                setNewGrade("4°");
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs btn-3d"
            >
              + Crear Curso
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {sections.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              useUiStore.setState({ teacherSectionTab: t.id });
              SoundFX.tab();
            }}
            className={`px-5 py-2.5 rounded-full font-extrabold text-xs sm:text-sm btn-3d ${
              teacherSectionTab === t.id ? "bg-emerald-600 text-white shadow-md" : "bg-white text-slate-700 border border-slate-200"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {teacherSectionTab === "rewards" ? <RewardsSection state={state} course={selectedCourse} students={courseStudents} /> : null}

      {teacherSectionTab === "months" ? (
        <div className="card-soft p-6 animate-pop">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Control de Meses Habilitados para {selectedCourse.name}</h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Haz clic en cualquier mes para activarlo o bloquearlo inmediatamente en el panel de tus estudiantes.
              </p>
            </div>
            <button
              onClick={() => unlockNextMonthForCourse(selectedCourse.id)}
              className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs sm:text-sm btn-3d shrink-0"
            >
              ⚡ Habilitar Siguiente Mes
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {MONTHS_CATALOG.map((m) => {
              const isOpen = selectedCourse.unlockedMonths.includes(m.id);
              const completedByCount = courseStudents.filter((st) => st.completedMonths.includes(m.id)).length;
              return (
                <div
                  key={m.id}
                  onClick={() => toggleCourseMonth(selectedCourse.id, m.id)}
                  className={`cursor-pointer rounded-2xl p-4 border-2 transition-all btn-3d text-center ${
                    isOpen ? "border-emerald-500 bg-emerald-50/70" : "border-slate-200 bg-slate-50 opacity-80"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-slate-500">Mes {m.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${isOpen ? "bg-emerald-600 text-white" : "bg-slate-300 text-slate-700"}`}>
                      {isOpen ? "Abierto" : "Cerrado"}
                    </span>
                  </div>
                  <div className="text-2xl my-1">{isOpen ? m.icon : "🔒"}</div>
                  <p className="font-extrabold text-sm text-slate-900">{m.name}</p>
                  <p className="text-[11px] font-bold text-emerald-700 mt-1">
                    Cumplido: {completedByCount}/{courseStudents.length} est.
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ) : teacherSectionTab === "students" ? (
        <div className="card-soft p-6 animate-pop">
          <h3 className="text-lg font-extrabold text-slate-900 mb-4">
            Listado de Estudiantes • {selectedCourse.name} (Código: {selectedCourse.code})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-extrabold text-slate-500 uppercase">
                  <th className="py-3 px-3">Estudiante</th>
                  <th className="py-3 px-3">Meses Cumplidos</th>
                  <th className="py-3 px-3">Alcancía</th>
                  <th className="py-3 px-3">XP / Nivel</th>
                  <th className="py-3 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {courseStudents.length ? (
                  courseStudents.map((st) => {
                    const lvl = getLevelInfo(st.xp);
                    return (
                      <tr key={st.id} className="hover:bg-slate-50/80">
                        <td className="py-3.5 px-3 font-extrabold text-slate-900 flex items-center gap-2.5">
                          <StudentAvatar style={st.avatarStyle} size={34} />
                          <span>{st.fullName}</span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs">✅ {st.completedMonths.length} / 12 meses</span>
                          <div className="text-[11px] text-slate-500 mt-1">
                            {st.completedMonths.map((mid) => MONTHS_CATALOG[mid - 1]?.name).join(", ") || "Ninguno aún"}
                          </div>
                        </td>
                        <td className="py-3.5 px-3 font-extrabold text-amber-700">{formatCOP(st.coins)}</td>
                        <td className="py-3.5 px-3 font-bold text-slate-700">
                          {st.xp} XP (Nv. {lvl.level})
                        </td>
                        <td className="py-3.5 px-3 text-right space-x-2">
                          <button onClick={() => loginAsStudent(st.id)} className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs">
                            Ver Panel
                          </button>
                          <button onClick={() => deleteStudentAccount(st.id)} className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs">
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500">
                      Aún no hay estudiantes inscritos en {selectedCourse.name}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-pop">
          <div className="lg:col-span-5 card-soft p-6">
            <h3 className="text-lg font-extrabold text-slate-900 mb-3">➕ Agregar Nueva Pregunta</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Mes Asociado</label>
                <select value={tq.month} onChange={(e) => setTq({ ...tq, month: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 font-bold">
                  {MONTHS_CATALOG.map((m) => (
                    <option key={m.id} value={m.id}>
                      Mes {m.id} - {m.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700">Pregunta o Situación Financiera</label>
                <textarea
                  value={tq.text}
                  onChange={(e) => setTq({ ...tq, text: e.target.value })}
                  rows={2}
                  placeholder="Ej: Si recibes $5.000 de regalo..."
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                />
              </div>
              <div>
                <label className="font-bold text-emerald-700">Opción 1 (Respuesta Correcta ✅)</label>
                <input
                  value={tq.o0}
                  onChange={(e) => setTq({ ...tq, o0: e.target.value })}
                  type="text"
                  placeholder="Escribe la respuesta correcta"
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-emerald-300 bg-emerald-50/40 font-semibold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">Opción 2 (Distractor)</label>
                <input
                  value={tq.o1}
                  onChange={(e) => setTq({ ...tq, o1: e.target.value })}
                  type="text"
                  placeholder="Opción incorrecta 1"
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">Opción 3 (Distractor)</label>
                <input
                  value={tq.o2}
                  onChange={(e) => setTq({ ...tq, o2: e.target.value })}
                  type="text"
                  placeholder="Opción incorrecta 2"
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">Explicación Educativa</label>
                <input
                  value={tq.exp}
                  onChange={(e) => setTq({ ...tq, exp: e.target.value })}
                  type="text"
                  placeholder="¿Por qué es la mejor opción?"
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                />
              </div>
              <button
                onClick={() => {
                  const ok = addTeacherQuestion({ monthId: Number(tq.month) || 1, question: tq.text, options: [tq.o0, tq.o1, tq.o2], explanation: tq.exp });
                  if (ok) setTq({ month: "1", text: "", o0: "", o1: "", o2: "", exp: "" });
                }}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm btn-3d"
              >
                Guardar Pregunta
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 card-soft p-6 space-y-3 max-h-[560px] overflow-y-auto">
            <h3 className="text-lg font-extrabold text-slate-900">Banco de Preguntas Activas</h3>
            {state.questions.map((q) => (
              <div key={q.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">Mes {q.monthId}</span>
                  <p className="font-extrabold text-sm text-slate-900 mt-1">{q.question}</p>
                  <p className="text-xs text-emerald-700 font-bold mt-1">✅ {q.options[q.correctIndex]}</p>
                </div>
                <button onClick={() => deleteQuestion(q.id)} className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-700 font-bold text-xs shrink-0">
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
