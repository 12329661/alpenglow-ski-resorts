"use client";

import * as React from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  Tooltip,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { ChartFrame } from "@/components/chart-frame";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionHeading } from "@/components/section-heading";
import { CONTINENT_COLORS, CONTINENTS } from "@/lib/types";
import type { Continent, ResortEnriched } from "@/lib/types";
import { usd, metres } from "@/lib/format";

type Mode = "elevation" | "vertical";

const AXES: Record<
  Mode,
  { key: "elevation" | "vertical"; label: string; unit: string; fmt: (n: number | null) => string }
> = {
  elevation: { key: "elevation", label: "Summit elevation", unit: "m", fmt: metres },
  vertical: { key: "vertical", label: "Vertical drop", unit: "m", fmt: metres },
};

function regression(pts: { x: number; y: number }[]) {
  const n = pts.length;
  if (n < 2) return null;
  const sx = pts.reduce((a, p) => a + p.x, 0);
  const sy = pts.reduce((a, p) => a + p.y, 0);
  const sxy = pts.reduce((a, p) => a + p.x * p.y, 0);
  const sxx = pts.reduce((a, p) => a + p.x * p.x, 0);
  const d = n * sxx - sx * sx;
  if (d === 0) return null;
  const slope = (n * sxy - sx * sy) / d;
  const intercept = (sy - slope * sx) / n;
  const my = sy / n;
  const ssTot = pts.reduce((a, p) => a + (p.y - my) ** 2, 0);
  const ssRes = pts.reduce((a, p) => a + (p.y - (slope * p.x + intercept)) ** 2, 0);
  return { slope, intercept, r2: ssTot ? 1 - ssRes / ssTot : 0 };
}

function AnalysisTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: { resort: ResortEnriched } }[];
}) {
  if (!active || !payload?.length) return null;
  const r = payload[0].payload.resort;
  return (
    <div className="rounded-lg border border-border/60 bg-background/95 px-3 py-2 text-xs shadow-xl backdrop-blur">
      <div className="font-heading text-sm font-semibold">{r.name}</div>
      <div className="text-muted-foreground">
        {r.country} · {r.continent}
      </div>
      <dl className="mt-1.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 tabular-nums">
        <dt className="text-muted-foreground">Day pass</dt>
        <dd className="text-right font-medium">{usd(r.price)}</dd>
        <dt className="text-muted-foreground">Summit</dt>
        <dd className="text-right font-medium">{metres(r.elevation)}</dd>
        <dt className="text-muted-foreground">Vertical</dt>
        <dd className="text-right font-medium">{metres(r.vertical)}</dd>
      </dl>
    </div>
  );
}

export function Analysis({ resorts }: { resorts: ResortEnriched[] }) {
  const [mode, setMode] = React.useState<Mode>("elevation");
  const axis = AXES[mode];

  const series = React.useMemo(() => {
    const m = new Map<Continent, { x: number; y: number; resort: ResortEnriched }[]>();
    for (const c of CONTINENTS) m.set(c, []);
    for (const r of resorts) {
      const x = r[axis.key];
      if (x == null || r.price == null || r.price <= 0) continue;
      m.get(r.continent)?.push({ x, y: r.price, resort: r });
    }
    return m;
  }, [resorts, axis.key]);

  const all = React.useMemo(
    () => [...series.values()].flat().map((p) => ({ x: p.x, y: p.y })),
    [series],
  );
  const fit = React.useMemo(() => regression(all), [all]);
  const xExtent = React.useMemo(() => {
    const xs = all.map((p) => p.x);
    return [Math.min(...xs), Math.max(...xs)] as const;
  }, [all]);

  return (
    <section
      id="analysis"
      className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          eyebrow="Analysis"
          title="Does a pricier pass buy you more mountain?"
          description="Each dot is a resort, coloured by continent. The dashed line is a least-squares fit across all resorts shown."
        />
        <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
          <TabsList>
            <TabsTrigger value="elevation">Price vs elevation</TabsTrigger>
            <TabsTrigger value="vertical">Price vs vertical drop</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card className="mt-8 border-border/70 bg-card/70">
        <CardContent className="p-3 sm:p-5">
          <ChartFrame height={440}>
            {({ width, height }) => (
              <ScatterChart
                width={width}
                height={height}
                margin={{ top: 8, right: 16, bottom: 24, left: 8 }}
              >
                <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" opacity={0.6} />
                <XAxis
                  type="number"
                  dataKey="x"
                  domain={["dataMin", "dataMax"]}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  stroke="var(--border)"
                  tickFormatter={(v) => axis.fmt(v).replace(/,/g, "")}
                  label={{
                    value: `${axis.label} (${axis.unit})`,
                    position: "insideBottom",
                    offset: -14,
                    fontSize: 12,
                    fill: "var(--muted-foreground)",
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  stroke="var(--border)"
                  tickFormatter={(v) => `$${v}`}
                  width={48}
                  label={{
                    value: "Day pass",
                    angle: -90,
                    position: "insideLeft",
                    fontSize: 12,
                    fill: "var(--muted-foreground)",
                  }}
                />
                <Tooltip
                  content={<AnalysisTooltip />}
                  cursor={{ strokeDasharray: "3 3", stroke: "var(--border)" }}
                />
                {CONTINENTS.map((c) => (
                  <Scatter
                    key={c}
                    name={c}
                    data={series.get(c)}
                    fill={CONTINENT_COLORS[c]}
                    fillOpacity={0.72}
                  />
                ))}
                {fit && (
                  <ReferenceLine
                    ifOverflow="extendDomain"
                    stroke="var(--foreground)"
                    strokeDasharray="6 5"
                    strokeOpacity={0.55}
                    segment={[
                      { x: xExtent[0], y: fit.slope * xExtent[0] + fit.intercept },
                      { x: xExtent[1], y: fit.slope * xExtent[1] + fit.intercept },
                    ]}
                  />
                )}
              </ScatterChart>
            )}
          </ChartFrame>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4 text-xs">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {CONTINENTS.map((c) => (
                <div key={c} className="flex items-center gap-1.5">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: CONTINENT_COLORS[c] }}
                  />
                  <span className="text-muted-foreground">{c}</span>
                </div>
              ))}
            </div>
            {fit && (
              <div className="tabular-nums text-muted-foreground">
                R² = {fit.r2.toFixed(2)} · slope ${(fit.slope * 100).toFixed(2)} / 100 m
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
