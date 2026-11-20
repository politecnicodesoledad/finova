import { closeModal, useUiStore } from "@/store/uiStore";
import { MonthMissionModal } from "@/components/student/MonthMissionModal";
import { OdsModal } from "@/components/student/OdsModal";

/** Single modal overlay, like the original #modalOverlay (click outside closes). */
export function ModalHost() {
  const modal = useUiStore((s) => s.modal);
  if (!modal) return null;
  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal();
      }}
    >
      <div
        key={modal.kind === "mission" ? `m${modal.nonce}` : "ods"}
        className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-pop relative my-auto"
      >
        {modal.kind === "mission" ? <MonthMissionModal monthId={modal.monthId} /> : <OdsModal />}
      </div>
    </div>
  );
}
