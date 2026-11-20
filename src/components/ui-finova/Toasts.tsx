import { useToastStore, type ToastType } from "@/store/toastStore";

const STYLES: Record<ToastType, string> = {
  success: "bg-emerald-900 text-white border-emerald-500",
  gold: "bg-amber-500 text-slate-950 border-amber-300",
  info: "bg-slate-900 text-white border-sky-400",
  warn: "bg-rose-600 text-white border-rose-300",
};
const ICONS: Record<ToastType, string> = { success: "✨", gold: "🪙", info: "💡", warn: "⚠️" };

export function Toasts() {
  const toasts = useToastStore((s) => s.toasts);
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto rounded-2xl px-4 py-3 shadow-xl border-l-4 flex items-start gap-3 animate-pop ${STYLES[t.type]}`}
          style={t.leaving ? { opacity: 0, transform: "translateY(8px)", transition: "all 0.25s ease" } : undefined}
        >
          <span className="text-xl leading-none mt-0.5">{ICONS[t.type]}</span>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm leading-tight">{t.title}</p>
            {t.message ? <p className="text-xs opacity-90 mt-0.5 leading-snug">{t.message}</p> : null}
          </div>
        </div>
      ))}
    </div>
  );
}
