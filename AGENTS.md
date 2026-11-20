<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## FINOVA architecture rules

- The UI must stay visually identical to the original HTML prototype; port markup/classes verbatim instead of redesigning. Why: the client's top rule is "no cambiar el diseño ni el funcionamiento".
- The prototype's stylesheet lives in `src/styles/finova-legacy.css`, imported into the `utilities` layer before Tailwind's utilities, and the Tailwind v3 palette is pinned in `@theme`. Why: this reproduces the original CDN cascade and exact colors.
- Where a v3 class combo `leading-* + sm:text-*` appears, add the matching `sm:leading-*` explicitly. Why: in v3 the responsive font-size line-height overrode `leading-*`; v4 does not.
- Business rules are pure functions in `src/services/rules.ts`; state changes go through actions in `src/store/appStore.ts` (zustand, persisted to localStorage via `services/storage.ts`). Why: one place for rules, testable in `src/test/finova-rules.test.ts`.
- The two games are imperative engines (`src/games/arcade`, `src/games/market`) mounted by React components and never re-rendered by React. Why: keeps canvas/DOM animation behavior identical to the original.
- Supabase is optional: `src/lib/supabase.ts` returns null without `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`, and the app runs in demo mode. Secure rewards/limits/claims are Postgres RPCs in `database/finova_schema.sql` (run manually in the client's own Supabase), not in `supabase/migrations`. Why: the client brings their own Supabase project for Vercel.
