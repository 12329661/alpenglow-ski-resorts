# Alpenglow — world ski-resort atlas

A Next.js (App Router) + TypeScript + Tailwind + shadcn/ui site that explores
499 ski resorts: an interactive map, a price-vs-terrain analysis, a sortable
directory, and a two-resort comparison view. Charts are Recharts; data lives in
Supabase.

## Setup

The app reads a single table, **`resort`**, from the Supabase project in
`.env.local`. It was created by a raw CSV import, so its columns are capitalised
with spaces (`ID`, `Resort`, `Highest point`, …). `lib/data.ts` aliases them to
snake_case in the `select`; the rest of the app never sees the raw names.

The table needs a public-read RLS policy so the anon key can read it:

```sql
alter table public."resort" enable row level security;
create policy "public read resort" on public."resort" for select using (true);
```

### Run

```bash
npm run dev      # http://localhost:3000
```

`npm run build && npm run start` for production. The home page uses ISR
(`revalidate = 300`).

## Data notes

- Fields used: name, lat/long, country, continent, day-pass price, season,
  highest/lowest lift-served point (→ summit elevation and vertical drop).
- Rows with a placeholder `Price` of `0` are treated as unknown (`NULL`).
- The `resort` table also carries slope counts, lift counts, snow cannons, and
  yes/no flags for snowparks / night skiing / summer skiing / child-friendly —
  not yet surfaced in the UI.
- `resorts.csv` / `snow.csv` and `scripts/build-sql.mjs` are kept for reference
  but are no longer wired into the app.

## Stack

Next.js 16 · React 19 · Tailwind CSS v4 · shadcn/ui (base-ui) · Recharts 3 ·
`@supabase/supabase-js` · next-themes
