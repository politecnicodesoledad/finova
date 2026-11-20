import { closeModal } from "@/store/uiStore";

export function OdsModal() {
  return (
    <>
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="text-xl font-extrabold text-slate-900">🌍 FINOVA y los Objetivos de Desarrollo Sostenible</h3>
        <button onClick={closeModal} className="w-8 h-8 rounded-full bg-slate-100 font-bold">
          ✕
        </button>
      </div>
      <div className="mt-4 space-y-3 text-sm text-slate-600 leading-relaxed">
        <p>
          En <strong>FINOVA</strong> creemos que aprender a administrar el dinero desde el colegio transforma familias y comunidades:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3">
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
            <p className="font-extrabold text-emerald-900">🎓 ODS 4: Educación de Calidad</p>
            <p className="text-xs mt-1">Alfabetización financiera práctica, divertida e inclusiva.</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
            <p className="font-extrabold text-amber-900">💼 ODS 8: Crecimiento Sostenible</p>
            <p className="text-xs mt-1">Fomento del ahorro, emprendimiento y planificación responsable.</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200">
            <p className="font-extrabold text-sky-900">♻️ ODS 12: Consumo Responsable</p>
            <p className="text-xs mt-1">Diferenciar necesidades reales de compras impulsivas.</p>
          </div>
        </div>
      </div>
    </>
  );
}
