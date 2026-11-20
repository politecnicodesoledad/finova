import type { TabId } from "@/types/finova";

const PATHS: Record<TabId, React.ReactNode> = {
  panel: <path d="M3 11 12 4l9 7M5 10v10h14V10M10 20v-6h4v6" />,
  arcade: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M9.5 9.5h4a2 2 0 0 1 0 4h-3a2 2 0 0 0 0 4H15" />
    </>
  ),
  market: <path d="M4 9l1.5-5h13L20 9M4 9h16v2a3 3 0 0 1-6 0 3 3 0 0 1-4 0 3 3 0 0 1-6 0zM5 14v6h14v-6" />,
  courses: <path d="M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM5 17a3 3 0 0 1 3-3h10" />,
  goals: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" />
    </>
  ),
  ledger: <path d="M4 20V4M4 20h16M8 16v-5M12 16V8M16 16v-3" />,
};

export function NavIcon({ tab }: { tab: TabId }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {PATHS[tab]}
    </svg>
  );
}
