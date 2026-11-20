import { Hand } from "@/components/brand/Hand";
import { NavIcon } from "@/components/brand/NavIcon";
import { switchTab } from "@/store/appStore";
import type { NextTodo, TabId } from "@/types/finova";

const TABS: { id: TabId; label: string; short: string }[] = [
  { id: "panel", label: "Mi Panel Mensual", short: "Panel" },
  { id: "arcade", label: "Caza-Monedas", short: "Caza" },
  { id: "market", label: "Mercadito de la Alcancía", short: "Mercadito" },
  { id: "courses", label: "Minicursos", short: "Cursos" },
  { id: "goals", label: "Premios del Colegio", short: "Premios" },
  { id: "ledger", label: "Control del Dinero", short: "Dinero" },
];

/** Pill navigation; on phones it becomes a fixed bottom bar (see nav.fnav in styles.css). */
export function StudentNav({ activeTab, next }: { activeTab: TabId; next: NextTodo | null }) {
  return (
    <nav className="fnav flex items-center gap-2 overflow-x-auto mb-5 no-scrollbar">
      {TABS.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => switchTab(tab.id)}
            className={`px-5 py-2.5 rounded-full font-extrabold text-xs sm:text-sm whitespace-nowrap flex items-center gap-2 transition-all btn-3d ${
              active
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25"
                : "bg-white text-slate-700 hover:bg-emerald-50 border border-slate-200/80 shadow-xs"
            }`}
          >
            <NavIcon tab={tab.id} />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.short}</span>
            {next?.tab === tab.id ? <Hand variant="up navh" /> : null}
          </button>
        );
      })}
    </nav>
  );
}
