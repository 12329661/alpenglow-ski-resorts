"use client";

import * as React from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  ReferenceLine,
  Tooltip,
  Cell,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { ChartFrame } from "@/components/chart-frame";
import { WorldMapLayer } from "@/components/world-map-layer";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionHeading } from "@/components/section-heading";
import { CONTINENT_COLORS, CONTINENTS } from "@/lib/types";
import type { Continent, ResortEnriched } from "@/lib/types";
import { usd, metres } from "@/lib/format";

const PRICE_STOPS = [
  { max: 30, color: "oklch(0.82 0.06 230)", label: "< $30" },
  { max: 45, color: "oklch(0.7 0.1 234)", label: "$30–45" },
  { max: 60, color: "oklch(0.58 0.13 244)", label: "$45–60" },
  { max: 80, color: "oklch(0.47 0.14 260)", label: "$60–80" },
  { max: Infinity, color: "oklch(0.38 0.15 285)", label: "$80+" },
];

function priceColor(price: number | null) {
  if (price == null) return "var(--muted-foreground)";
  return PRICE_STOPS.find((s) => price < s.max)!.color;
}

type Point = {
  x: number;
  y: number;
  z: number;
  resort: ResortEnriched;
};

function MapTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: Point }[];
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

export function ResortMap({ resorts }: { resorts: ResortEnriched[] }) {
  const [mode, setMode] = React.useState<"continent" | "price">("continent");

  const points: Point[] = React.useMemo(
    () =>
      resorts.map((r) => ({
        x: r.longitude,
        y: r.latitude,
        z: r.vertical ?? 400,
        resort: r,
      })),
    [resorts],
  );

  const byContinent = React.useMemo(() => {
    const m = new Map<Continent, Point[]>();
    for (const c of CONTINENTS) m.set(c, []);
    for (const p of points) m.get(p.resort.continent)?.push(p);
    return m;
  }, [points]);

  return (
    <section
      id="map"
      className="scroll-mt-20 border-y border-border/60 bg-muted/30"
    >
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="The map"
            title="Where the mountains are"
            description="Every resort placed by longitude and latitude. Marker size tracks vertical drop; switch the colour scheme between continent and lift-pass price."
          />
          <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
            <TabsList>
              <TabsTrigger value="continent">By continent</TabsTrigger>
              <TabsTrigger value="price">By price</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Card className="mt-8 border-border/70 bg-card/70">
          <CardContent className="p-3 sm:p-5">
            <ChartFrame height={500}>
              {({ width, height }) => (
                <ScatterChart
                  width={width}
                  height={height}
                  margin={{ top: 8, right: 12, bottom: 8, left: 0 }}
                >
                  <CartesianGrid
                    stroke="var(--border)"
                    strokeDasharray="2 4"
                    opacity={0.6}
                  />
                  <WorldMapLayer />
                  <XAxis
                    type="number"
                    dataKey="x"
                    domain={[-170, 180]}
                    ticks={[-150, -100, -50, 0, 50, 100, 150]}
                    tickFormatter={(v) => `${v}°`}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    stroke="var(--border)"
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    domain={[-60, 85]}
                    ticks={[-45, 0, 45]}
                    tickFormatter={(v) => `${v}°`}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    stroke="var(--border)"
                    width={44}
                  />
                  <ZAxis type="number" dataKey="z" range={[24, 190]} />
                  <ReferenceLine y={0} stroke="var(--border)" strokeWidth={1} />
                  <Tooltip
                    content={<MapTooltip />}
                    cursor={{ strokeDasharray: "3 3", stroke: "var(--border)" }}
                  />
                  {mode === "continent"
                    ? CONTINENTS.map((c) => (
                        <Scatter
                          key={c}
                          name={c}
                          data={byContinent.get(c)}
                          fill={CONTINENT_COLORS[c]}
                          fillOpacity={0.78}
                          stroke={CONTINENT_COLORS[c]}
                          strokeWidth={0.5}
                        />
                      ))
                    : (
                      <Scatter data={points} fillOpacity={0.8}>
                        {points.map((p, i) => (
                          <Cell key={i} fill={priceColor(p.resort.price)} />
                        ))}
                      </Scatter>
                    )}
                </ScatterChart>
              )}
            </ChartFrame>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border/60 pt-4 text-xs">
              {mode === "continent"
                ? CONTINENTS.map((c) => (
                    <div key={c} className="flex items-center gap-1.5">
                      <span
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: CONTINENT_COLORS[c] }}
                      />
                      <span className="text-muted-foreground">{c}</span>
                    </div>
                  ))
                : PRICE_STOPS.map((s) => (
                    <div key={s.label} className="flex items-center gap-1.5">
                      <span
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: s.color }}
                      />
                      <span className="text-muted-foreground">{s.label}</span>
                    </div>
                  ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
