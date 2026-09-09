"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Search, Trophy, Mountain } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/section-heading";
import { CONTINENTS, CONTINENT_COLORS, RESORT_FLAGS } from "@/lib/types";
import type { ResortData, ResortEnriched, ResortFlag } from "@/lib/types";
import { usd, metres } from "@/lib/format";
import { cn } from "cn";

type SortKey = "name" | "country" | "continent" | "price" | "elevation" | "vertical";

const COLUMNS: {
  key: SortKey;
  label: string;
  numeric?: boolean;
  className?: string;
}[] = [
  { key: "name", label: "Resort" },
  { key: "country", label: "Country", className: "hidden md:table-cell" },
  { key: "continent", label: "Continent", className: "hidden lg:table-cell" },
  { key: "price", label: "Day pass", numeric: true },
  { key: "elevation", label: "Summit", numeric: true },
  { key: "vertical", label: "Vertical", numeric: true },
];

function compare(a: ResortEnriched, b: ResortEnriched, key: SortKey) {
  const av = a[key];
  const bv = b[key];
  if (av == null && bv == null) return 0;
  if (av == null) return 1;
  if (bv == null) return -1;
  return typeof av === "string" ? av.localeCompare(bv as string) : (av as number) - (bv as number);
}

export function Directory({ data }: { data: ResortData }) {
  const { resorts, superlatives } = data;
  const [continent, setContinent] = React.useState<string>("all");
  const [query, setQuery] = React.useState("");
  const [flags, setFlags] = React.useState<Set<ResortFlag>>(new Set());
  const [sort, setSort] = React.useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "price",
    dir: "asc",
  });

  function toggleFlag(key: ResortFlag) {
    setFlags((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = resorts.filter((r) => {
      if (continent !== "all" && r.continent !== continent) return false;
      if (q && !r.name.toLowerCase().includes(q) && !r.country.toLowerCase().includes(q))
        return false;
      for (const key of flags) if (!r.flags[key]) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      const c = compare(a, b, sort.key);
      return sort.dir === "asc" ? c : -c;
    });
    return list;
  }, [resorts, continent, query, flags, sort]);

  function toggleSort(key: SortKey) {
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "name" || key === "country" || key === "continent" ? "asc" : "desc" },
    );
  }

  function badgesFor(r: ResortEnriched) {
    const out: { label: string; icon: typeof Trophy }[] = [];
    if (r.id === superlatives.bestValueId) out.push({ label: "Best value", icon: Trophy });
    if (r.id === superlatives.highestPeakId) out.push({ label: "Highest peak", icon: Mountain });
    return out;
  }

  return (
    <section
      id="directory"
      className="scroll-mt-20 border-y border-border/60 bg-muted/30"
    >
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <SectionHeading
          eyebrow="Directory"
          title="Every resort, sortable"
          description="Filter by continent or amenity, search by name or country, and sort any column. Badges mark the outright cheapest pass and the highest summit."
        />

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative sm:max-w-xs sm:flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search resort or country…"
              className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
            />
          </div>
          <Select
            value={continent}
            onValueChange={(v) => setContinent((v as string | null) ?? "all")}
          >
            <SelectTrigger className="w-full sm:w-52">
              <SelectValue placeholder="Continent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All continents</SelectItem>
              {CONTINENTS.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="text-sm text-muted-foreground sm:ml-auto">
            {rows.length} {rows.length === 1 ? "resort" : "resorts"}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Amenities
          </span>
          {RESORT_FLAGS.map((f) => {
            const on = flags.has(f.key);
            return (
              <button
                key={f.key}
                type="button"
                aria-pressed={on}
                onClick={() => toggleFlag(f.key)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  on
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {f.label}
              </button>
            );
          })}
          {flags.size > 0 && (
            <button
              type="button"
              onClick={() => setFlags(new Set())}
              className="text-xs text-muted-foreground underline-offset-2 hover:underline"
            >
              Clear
            </button>
          )}
        </div>

        <Card className="mt-4 overflow-hidden border-border/70 bg-card/70 py-0">
          <div className="max-h-[640px] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-card/95 backdrop-blur">
                <TableRow className="hover:bg-transparent">
                  {COLUMNS.map((col) => {
                    const active = sort.key === col.key;
                    const Icon = active
                      ? sort.dir === "asc"
                        ? ArrowUp
                        : ArrowDown
                      : ArrowUpDown;
                    return (
                      <TableHead
                        key={col.key}
                        className={cn(
                          col.numeric && "text-right",
                          col.className,
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => toggleSort(col.key)}
                          className={cn(
                            "inline-flex items-center gap-1 transition-colors hover:text-foreground",
                            col.numeric && "flex-row-reverse",
                            active ? "text-foreground" : "text-muted-foreground",
                          )}
                        >
                          {col.label}
                          <Icon className="size-3.5" />
                        </button>
                      </TableHead>
                    );
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="max-w-[15rem]">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-medium">{r.name}</span>
                        {badgesFor(r).map((b) => (
                          <Badge
                            key={b.label}
                            variant="secondary"
                            className="gap-1 border-primary/30 bg-primary/10 text-primary"
                          >
                            <b.icon className="size-3" />
                            {b.label}
                          </Badge>
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground md:hidden">
                        {r.country}
                      </span>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {r.country}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                        <span
                          className="size-2 rounded-full"
                          style={{ backgroundColor: CONTINENT_COLORS[r.continent] }}
                        />
                        {r.continent}
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{usd(r.price)}</TableCell>
                    <TableCell className="text-right tabular-nums">{metres(r.elevation)}</TableCell>
                    <TableCell className="text-right tabular-nums">{metres(r.vertical)}</TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={COLUMNS.length} className="h-24 text-center text-muted-foreground">
                      No resorts match those filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </section>
  );
}
