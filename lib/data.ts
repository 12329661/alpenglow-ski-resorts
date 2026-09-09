import "server-only";
import { cache } from "react";
import { supabase } from "@/lib/supabase";
import { cleanResortName } from "@/lib/clean-name";
import type {
  Resort,
  ResortEnriched,
  ResortData,
  Superlatives,
  OverviewStats,
} from "@/lib/types";

const PAGE = 1000;

/** Fetch every row of a table, paging past PostgREST's row cap. */
async function fetchAll<T>(
  table: string,
  columns: string,
  order: string,
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .order(order)
      .range(from, from + PAGE - 1);
    if (error) throw new Error(`Supabase ${table}: ${error.message}`);
    rows.push(...((data ?? []) as T[]));
    if (!data || data.length < PAGE) break;
  }
  return rows;
}

function mean(xs: number[]): number | null {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
}

export const getResortData = cache(async (): Promise<ResortData> => {
  // The table was a raw CSV import, so columns are capitalised with spaces.
  // Alias them to snake_case here; .order() still takes the real column name.
  const resorts = await fetchAll<Resort>(
    "resort",
    'id:ID,name:Resort,latitude:Latitude,longitude:Longitude,country:Country,continent:Continent,price:Price,season:Season,highest_point:"Highest point",lowest_point:"Lowest point",nightskiing:Nightskiing,summer_skiing:"Summer skiing",snowparks:Snowparks,child_friendly:"Child friendly"',
    "ID",
  );

  const yes = (v: string | null) => v?.trim().toLowerCase() === "yes";

  const enriched: ResortEnriched[] = resorts.map((r) => {
    const elevation = r.highest_point;
    const vertical =
      r.highest_point != null && r.lowest_point != null
        ? r.highest_point - r.lowest_point
        : null;
    // Some rows carry a placeholder price of 0 — treat as unknown.
    const price = r.price != null && Number(r.price) > 0 ? Number(r.price) : null;
    return {
      ...r,
      name: cleanResortName(r.name),
      price,
      elevation,
      vertical,
      flags: {
        nightskiing: yes(r.nightskiing),
        summerSkiing: yes(r.summer_skiing),
        snowparks: yes(r.snowparks),
        childFriendly: yes(r.child_friendly),
      },
    };
  });

  const priced = enriched.filter((r) => r.price != null && r.price > 0);
  const bestValue = priced.reduce<ResortEnriched | null>(
    (best, r) => (!best || r.price! < best.price! ? r : best),
    null,
  );
  const withElev = enriched.filter((r) => r.elevation != null);
  const highestPeak = withElev.reduce<ResortEnriched | null>(
    (best, r) => (!best || r.elevation! > best.elevation! ? r : best),
    null,
  );

  const superlatives: Superlatives = {
    bestValueId: bestValue?.id ?? null,
    highestPeakId: highestPeak?.id ?? null,
  };

  const stats: OverviewStats = {
    count: enriched.length,
    avgPrice: mean(priced.map((r) => r.price!)),
    avgElevation: mean(withElev.map((r) => r.elevation!)),
    countries: new Set(enriched.map((r) => r.country)).size,
    continents: new Set(enriched.map((r) => r.continent)).size,
  };

  return { resorts: enriched, superlatives, stats };
});
