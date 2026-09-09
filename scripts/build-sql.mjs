// Reads resorts.csv (CP1252) + snow.csv (global 0.25° monthly snow-cover grid, 2022)
// and emits supabase/schema.sql + supabase/seed.sql.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const ROOT = new URL("../", import.meta.url);
const OUT = new URL("supabase/", ROOT);
mkdirSync(OUT, { recursive: true });

/* ---------- resorts.csv ---------- */
const decoder = new TextDecoder("windows-1252");
const resortsRaw = decoder.decode(readFileSync(new URL("resorts.csv", ROOT)));

function parseCSV(text) {
  const rows = [];
  let row = [], field = "", inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQ = false;
      } else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      if (field !== "" || row.length) { row.push(field); rows.push(row); row = []; field = ""; }
    } else field += c;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows;
}

// Source names are inconsistent: some accents survived CP1252 decoding, others
// were already replaced with a literal "?" upstream. Normalise everything to
// clean ASCII so the listing reads uniformly.
function cleanName(s) {
  return s
    .replace(/[–—]/g, "-")
    .replace(/[‘’ʼ]/g, "'")
    .replace(/([\/\-\s])\?/g, "$1")
    .replace(/^\?/, "")
    .replace(/\?/g, "")
    .normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/ß/g, "ss").replace(/[øØ]/g, "o").replace(/[æÆ]/g, "ae")
    .replace(/[œŒ]/g, "oe").replace(/[ðÐ]/g, "d").replace(/[þÞ]/g, "th")
    .replace(/[łŁ]/g, "l")
    .replace(/\s*-\s*$/, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

const rows = parseCSV(resortsRaw);
const header = rows[0];
const idx = (name) => header.indexOf(name);
const cI = idx("Continent"), coI = idx("Country"), pI = idx("Price"),
  hpI = idx("Highest point"), lpI = idx("Lowest point"), sI = idx("Season"),
  laI = idx("Latitude"), loI = idx("Longitude"), nI = idx("Resort");

const resorts = rows.slice(1).filter(r => r.length > 3).map(r => ({
  id: Number(r[0]),
  name: cleanName(r[nI]),
  latitude: Number(r[laI]),
  longitude: Number(r[loI]),
  country: r[coI].trim(),
  continent: r[cI].trim(),
  price: Number(r[pI]) > 0 ? Number(r[pI]) : null,
  season: r[sI].trim() || null,
  highest_point: Number(r[hpI]) || null,
  lowest_point: Number(r[lpI]) || null,
}));

/* ---------- snow.csv ---------- */
const snowRaw = readFileSync(new URL("snow.csv", ROOT), "utf8");
const STEP = 0.25;
const snap = (v) => Math.round((v - 0.125) / STEP) * STEP + 0.125;
const key = (la, lo) => `${la.toFixed(3)},${lo.toFixed(3)}`;

// grid: key -> Float array indexed by month 0..11
const grid = new Map();
const months = ["2022-01-01","2022-02-01","2022-03-01","2022-04-01","2022-05-01","2022-06-01",
  "2022-07-01","2022-08-01","2022-09-01","2022-10-01","2022-11-01","2022-12-01"];
const monthIdx = Object.fromEntries(months.map((m, i) => [m, i]));

{
  const lines = snowRaw.split("\n");
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const parts = line.split(",");
    const mi = monthIdx[parts[0]];
    if (mi === undefined) continue;
    const la = Number(parts[1]), lo = Number(parts[2]), sn = Number(parts[3]);
    const k = key(la, lo);
    let arr = grid.get(k);
    if (!arr) { arr = new Float32Array(12).fill(NaN); grid.set(k, arr); }
    arr[mi] = sn;
  }
}
console.error(`snow grid cells: ${grid.size}`);

const cellSeries = (arr) =>
  // snow.csv only lists cell-months that had snow cover, so a missing month
  // for a land cell means no snow -> 0.
  months.map((_, i) => (Number.isNaN(arr[i]) ? 0 : Math.round(arr[i] * 100) / 100));
const annualMean = (s) => s.reduce((a, b) => a + b, 0) / s.length;

// A resort sits in one 0.25deg (~25 km) cell, but a coarse cell centred on a
// valley or coastline routinely misses the peaks the resort is actually built
// on. So scan the neighbourhood and take the snowiest cell within ~0.6deg;
// only fall back to the strict nearest cell when nothing lies that close.
function snowForResort(lat, lon) {
  const la0 = snap(lat), lo0 = snap(lon);
  let near = null;
  const nearby = [];
  for (let ring = 0; ring <= 12; ring++) {
    for (let dla = -ring; dla <= ring; dla++) {
      for (let dlo = -ring; dlo <= ring; dlo++) {
        if (ring > 0 && Math.abs(dla) !== ring && Math.abs(dlo) !== ring) continue;
        let lo = lo0 + dlo * STEP;
        if (lo > 180) lo -= 360;
        if (lo < -180) lo += 360;
        const arr = grid.get(key(la0 + dla * STEP, lo));
        if (!arr || !arr.some((v) => !Number.isNaN(v))) continue;
        const s = cellSeries(arr);
        if (!near) near = s;
        if (ring <= 2) nearby.push(s);
      }
    }
    if (ring >= 2 && nearby.length) break;
    if (ring >= 2 && near) break;
  }
  if (nearby.length) {
    return nearby.reduce((best, s) => (annualMean(s) > annualMean(best) ? s : best));
  }
  return near;
}

let matched = 0;
const snowRows = [];
for (const r of resorts) {
  const series = snowForResort(r.latitude, r.longitude);
  if (!series) continue;
  matched++;
  series.forEach((v, i) => { snowRows.push([r.id, months[i], v]); });
}
console.error(`resorts matched to snow: ${matched}/${resorts.length}, snow rows: ${snowRows.length}`);

/* ---------- emit SQL ---------- */
const q = (v) => v === null ? "null" : typeof v === "number" ? String(v) : `'${v.replace(/'/g, "''")}'`;

const schema = `-- ski-resorts-website schema
-- Safe to re-run. Drops + recreates both tables and their public-read policies.

drop table if exists public.snow cascade;
drop table if exists public.resorts cascade;

create table public.resorts (
  id            integer primary key,
  name          text not null,
  latitude      double precision not null,
  longitude     double precision not null,
  country       text not null,
  continent     text not null,
  price         numeric,
  season        text,
  highest_point integer,
  lowest_point  integer
);

create table public.snow (
  resort_id integer not null references public.resorts(id) on delete cascade,
  month     date not null,
  snow      numeric not null,
  primary key (resort_id, month)
);

create index snow_resort_id_idx on public.snow (resort_id);

alter table public.resorts enable row level security;
alter table public.snow    enable row level security;

drop policy if exists "public read resorts" on public.resorts;
drop policy if exists "public read snow"    on public.snow;

create policy "public read resorts" on public.resorts for select using (true);
create policy "public read snow"    on public.snow    for select using (true);
`;

function insertBlock(table, cols, data, chunk = 200) {
  let out = "";
  for (let i = 0; i < data.length; i += chunk) {
    const vals = data.slice(i, i + chunk)
      .map(row => `  (${row.map(q).join(", ")})`).join(",\n");
    out += `insert into public.${table} (${cols.join(", ")}) values\n${vals};\n`;
  }
  return out;
}

const seed = `${insertBlock("resorts",
  ["id","name","latitude","longitude","country","continent","price","season","highest_point","lowest_point"],
  resorts.map(r => [r.id, r.name, r.latitude, r.longitude, r.country, r.continent, r.price, r.season, r.highest_point, r.lowest_point]))}
${insertBlock("snow", ["resort_id","month","snow"], snowRows, 500)}`;

const setup = `-- ============================================================================
-- ski-resorts-website : full database setup
-- Paste this whole file into the Supabase SQL Editor and run it once.
-- Generated by scripts/build-sql.mjs from resorts.csv + snow.csv. Safe to re-run.
-- ${resorts.length} resorts, ${snowRows.length} monthly snow-cover rows.
-- ============================================================================

${schema}
-- ---------------------------------------------------------------------------
-- seed data
-- ---------------------------------------------------------------------------

${seed}`;

writeFileSync(new URL("schema.sql", OUT), schema);
writeFileSync(new URL("seed.sql", OUT), `-- seed data only; run schema.sql first\n\n${seed}`);
writeFileSync(new URL("setup.sql", OUT), setup);
console.error("wrote supabase/{schema,seed,setup}.sql");
