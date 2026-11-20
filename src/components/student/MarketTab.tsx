import { memo, useEffect, useRef } from "react";
import hexAsset from "@/assets/finova-hexagon.png.asset.json";
import { mountMarket } from "@/games/market/engine";
import { MARKET_SHELL_HTML } from "@/games/market/shell";
import { formatCOP } from "@/lib/format";
import { curMonth, getActiveStudent, getStudentCourse, playsLeft } from "@/services/rules";
import { SoundFX } from "@/services/sound";
import { marketReward, registerPlay, switchTab, useAppStore } from "@/store/appStore";

function activeMonthAndPlays() {
  const st = useAppStore.getState();
  const s = getActiveStudent(st);
  const m = curMonth(getStudentCourse(st, s));
  return { m, left: s ? playsLeft(s, "market", m) : 0 };
}

/**
 * "El Mercadito de la Alcancía". React renders the static shell once; the game
 * engine takes over the DOM inside #mkt (fullscreen on phones via CSS).
 */
export const MarketTab = memo(function MarketTab() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    return mountMarket(root, {
      soundEnabled: SoundFX.isEnabled,
      playsLeft: () => activeMonthAndPlays().left,
      month: () => activeMonthAndPlays().m,
      registerPlay: () => registerPlay("market"),
      reward: (n, oks, score) => marketReward(n, oks, score),
      exit: () => switchTab("panel"),
      formatCOP,
      logoUrl: hexAsset.url,
    });
  }, []);
  return (
    <div className="animate-pop mkt-wrap">
      <div id="mkt" ref={ref} dangerouslySetInnerHTML={{ __html: MARKET_SHELL_HTML }} />
    </div>
  );
});
