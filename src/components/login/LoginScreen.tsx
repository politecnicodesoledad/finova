import { useState } from "react";
import { FinovaFullLogo } from "@/components/brand/FinovaLogo";
import { PiggyMascot } from "@/components/brand/PiggyMascot";
import { StudentAvatar } from "@/components/brand/StudentAvatar";
import { getStudentCourse } from "@/services/rules";
import { loginAsStudent, loginAsTeacher, registerNewStudent, resetDemoData, useAppStore } from "@/store/appStore";
import type { AvatarStyle } from "@/types/finova";

export function LoginScreen() {
  const state = useAppStore((s) => s);
  const [regName, setRegName] = useState("");
  const [regCode, setRegCode] = useState("");
  const [regAvatar, setRegAvatar] = useState<AvatarStyle>("valeria");

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10 animate-pop">
      <div className="text-center mb-8">
        <div className="inline-block bg-[#0f172a] px-6 py-4 sm:px-8 sm:py-5 rounded-[28px] shadow-xl mb-4">
          <FinovaFullLogo className="w-[260px] sm:w-[340px]" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">Elige cómo deseas ingresar</h1>
        <p className="text-sm sm:text-base text-slate-600 mt-1">Plataforma educativa gamificada para colegios y estudiantes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-soft p-6 sm:p-8 border-2 border-emerald-200">
          <div className="flex items-center gap-3 mb-4">
            <PiggyMascot size={48} />
            <div>
              <span className="text-xs font-extrabold uppercase text-emerald-700">Portal Estudiantil</span>
              <h2 className="text-xl font-extrabold text-slate-900">Soy Estudiante</h2>
            </div>
          </div>

          <p className="text-xs font-bold text-slate-500 uppercase mb-2">Ingreso Rápido (Cuentas Demo):</p>
          <div className="grid grid-cols-2 gap-2.5 mb-5">
            {state.students.map((st) => {
              const c = getStudentCourse(state, st);
              return (
                <button
                  key={st.id}
                  onClick={() => loginAsStudent(st.id)}
                  className="p-3 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/70 flex items-center gap-2.5 text-left transition-all btn-3d"
                >
                  <StudentAvatar style={st.avatarStyle} size={36} />
                  <div className="min-w-0">
                    <p className="font-extrabold text-xs text-slate-900 truncate">{st.name}</p>
                    <p className="text-[11px] font-bold text-emerald-700">{c.name}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-3">
            <p className="text-xs font-extrabold text-slate-700">¿Eres nueva? Crea tu cuenta con el código del salón:</p>
            <input
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              type="text"
              placeholder="Tu nombre (ej: Lucía Pérez)"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
            />
            <div className="grid grid-cols-2 gap-2.5">
              <input
                value={regCode}
                onChange={(e) => setRegCode(e.target.value)}
                type="text"
                placeholder="Código (ej: FIN4A)"
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-bold uppercase"
              />
              <select
                value={regAvatar}
                onChange={(e) => setRegAvatar(e.target.value as AvatarStyle)}
                className="px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
              >
                <option value="valeria">Avatar Morado</option>
                <option value="sofia">Avatar Rosa</option>
                <option value="camila">Avatar Dorado</option>
                <option value="mariana">Avatar Esmeralda</option>
              </select>
            </div>
            <button
              onClick={() => registerNewStudent(regName, regCode, regAvatar)}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm btn-3d"
            >
              🚀 Entrar al Club FINOVA
            </button>
          </div>
        </div>

        <div className="card-soft p-6 sm:p-8 border-2 border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center text-2xl">👩‍🏫</div>
              <div>
                <span className="text-xs font-extrabold uppercase text-amber-600">Portal Docente</span>
                <h2 className="text-xl font-extrabold text-slate-900">Soy Profesor(a)</h2>
              </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Administra tus cursos (<strong>4° A, 4° B, 5° A</strong>), habilita los meses del año que tus estudiantes ya pueden realizar, revisa quiénes
              cumplieron cada mes y personaliza las preguntas.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-1.5">
              <p className="font-extrabold">✨ Herramientas incluidas:</p>
              <p>• Activar / Bloquear meses (Enero a Diciembre) por salón.</p>
              <p>• Seguimiento en tiempo real de meses cumplidos.</p>
              <p>• Banco editable de preguntas de educación financiera.</p>
            </div>
          </div>

          <div className="mt-6 space-y-2.5">
            <button
              onClick={loginAsTeacher}
              className="w-full py-3.5 rounded-2xl bg-[#0f172a] hover:bg-slate-800 text-white font-extrabold text-sm shadow-lg btn-3d"
            >
              🏫 Ingresar al Panel del Profesor
            </button>
            <button onClick={resetDemoData} className="w-full py-2 text-xs font-bold text-slate-400 hover:text-slate-600">
              Restaurar datos iniciales de demostración
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
