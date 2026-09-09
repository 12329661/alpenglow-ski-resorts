"use client";

import * as React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/section-heading";
import { ResortCombobox } from "@/components/resort-combobox";
import { CONTINENT_COLORS } from "@/lib/types";
import type { ResortData, ResortEnriched } from "@/lib/types";
import { usd, metres } from "@/lib/format";
import { cn } from "cn";

type Row = {
  label: string;
  a: string;
  b: string;
  /** 1 if A is better, -1 if B is better, 0 if tie/na */
  winner: number;
};

function buildRows(a: ResortEnriched, b: ResortEnriched): Row[] {
  const cmp = (x: number | null, y: number | null, higherWins: boolean) => {
    if (x == null || y == null || x === y) return 0;
    return (x > y ? 1 : -1) * (higherWins ? 1 : -1);
  };
  return [
    { label: "Day pass", a: usd(a.price), b: usd(b.price), winner: cmp(a.price, b.price, false) },
    { label: "Summit elevation", a: metres(a.elevation), b: metres(b.elevation), winner: cmp(a.elevation, b.elevation, true) },
    { label: "Vertical drop", a: metres(a.vertical), b: metres(b.vertical), winner: cmp(a.vertical, b.vertical, true) },
    { label: "Season", a: a.season ?? "—", b: b.season ?? "—", winner: 0 },
    { label: "Country", a: `${a.country}`, b: `${b.country}`, winner: 0 },
  ];
}

function ResortCard({
  resort,
  rows,
  side,
}: {
  resort: ResortEnriched;
  rows: Row[];
  side: "a" | "b";
}) {
  return (
    <Card className="border-border/70 bg-card/70">
      <CardHeader className="gap-1 border-b border-border/60 pb-4">
        <div className="flex items-center gap-2">
          <span
            className="size-2.5 rounded-full"
            style={{ backgroundColor: CONTINENT_COLORS[resort.continent] }}
          />
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            {resort.continent}
          </span>
        </div>
        <div className="font-heading text-xl font-bold">{resort.name}</div>
        <div className="text-sm text-muted-foreground">{resort.country}</div>
      </CardHeader>
      <CardContent className="p-0">
        <dl className="divide-y divide-border/60">
          {rows.map((row) => {
            const value = side === "a" ? row.a : row.b;
            const wins = side === "a" ? row.winner === 1 : row.winner === -1;
            return (
              <div
                key={row.label}
                className="flex items-center justify-between gap-3 px-5 py-3"
              >
                <dt className="text-sm text-muted-foreground">{row.label}</dt>
                <dd
                  className={cn(
                    "flex items-center gap-2 text-right text-sm font-medium tabular-nums",
                    wins && "text-primary",
                  )}
                >
                  {value}
                  {wins && (
                    <Badge
                      variant="secondary"
                      className="border-primary/30 bg-primary/10 px-1.5 text-[10px] text-primary"
                    >
                      better
                    </Badge>
                  )}
                </dd>
              </div>
            );
          })}
        </dl>
      </CardContent>
    </Card>
  );
}

export function Compare({ data }: { data: ResortData }) {
  const { resorts, superlatives } = data;
  const byId = React.useMemo(
    () => new Map(resorts.map((r) => [r.id, r])),
    [resorts],
  );

  const [idA, setIdA] = React.useState<number>(
    superlatives.bestValueId ?? resorts[0]?.id ?? 0,
  );
  const [idB, setIdB] = React.useState<number>(
    superlatives.highestPeakId ?? resorts[1]?.id ?? 0,
  );

  const a = byId.get(idA);
  const b = byId.get(idB);
  if (!a || !b) return null;

  const rows = buildRows(a, b);

  return (
    <section
      id="compare"
      className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
    >
      <SectionHeading
        eyebrow="Compare"
        title="Put two resorts head to head"
        description="Pick any two of the 499 resorts to see price, elevation, vertical drop and season side by side."
      />

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <ResortCombobox resorts={resorts} value={idA} onChange={setIdA} label="First resort" />
        <ResortCombobox resorts={resorts} value={idB} onChange={setIdB} label="Second resort" />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <ResortCard resort={a} rows={rows} side="a" />
        <ResortCard resort={b} rows={rows} side="b" />
      </div>
    </section>
  );
}
