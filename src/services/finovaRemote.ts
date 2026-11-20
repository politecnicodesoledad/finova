/**
 * Secure server-side actions (Postgres RPC functions defined in
 * database/finova_schema.sql). Rewards, play limits and prize claims are
 * validated in the database so nobody can cheat by editing browser data.
 *
 * Every function returns null in demo mode (no Supabase env vars), and the
 * caller keeps using the local store.
 */
import { supabase } from "@/lib/supabase";
import type { GameId, MiniCourseId } from "@/types/finova";

async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc(fn, args);
  if (error) throw new Error(`${fn} failed: ${error.message}`);
  return data as T;
}

export const finovaRemote = {
  /** Counts a game start; fails when the 2-per-month limit is reached. Returns plays left. */
  registerGamePlay: (game: GameId) => rpc<number>("register_game_play", { p_game: game }),
  /** Awards coins/XP for a finished game (server caps the amounts). */
  awardGameReward: (game: GameId, coins: number, xp: number, label: string) =>
    rpc<void>("award_game_reward", { p_game: game, p_coins: coins, p_xp: xp, p_label: label }),
  /** Marks a month mission complete (rewards only the first time; replay gives a small bonus). */
  completeMonth: (monthNumber: number, correct: number, elapsedSeconds: number) =>
    rpc<void>("complete_month", { p_month: monthNumber, p_correct: correct, p_elapsed: elapsedSeconds }),
  /** Pays a minicourse once per student. */
  completeMinicourse: (course: MiniCourseId) => rpc<boolean>("complete_minicourse", { p_course: course }),
  /** Atomic prize claim: checks month list, coins and remaining slots under a row lock. */
  claimPrize: (prizeId: string) => rpc<string>("claim_prize", { p_prize: prizeId }),
  /** Teacher: archives the podium and resets period points (level and XP are kept). */
  closePeriod: (courseId: string) => rpc<void>("close_period", { p_course: courseId }),
};
