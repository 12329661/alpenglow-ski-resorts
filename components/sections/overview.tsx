import { MapPinned, CircleDollarSign, Mountain, Globe2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/section-heading";
import { CONTINENT_COLORS, CONTINENTS } from "@/lib/types";
import type { ResortData } from "@/lib/types";
import { usd, metres, num } from "@/lib/format";

export function Overview({ data }: { data: ResortData }) {
  const { stats, resorts } = data;

  const cards = [
    {
      icon: MapPinned,
      value: num(stats.count),
      label: "Ski resorts",
      hint: `across ${stats.continents} continents`,
    },
    {
      icon: CircleDollarSign,
      value: usd(stats.avgPrice),
      label: "Average day pass",
      hint: "adult single-day lift ticket",
    },
    {
      icon: Mountain,
      value: metres(stats.avgElevation),
      label: "Average summit",
      hint: "highest lift-served point",
    },
    {
      icon: Globe2,
      value: num(stats.countries),
      label: "Countries represented",
      hint: "from Andorra to New Zealand",
    },
  ];

  const byContinent = CONTINENTS.map((c) => ({
    continent: c,
    count: resorts.filter((r) => r.continent === c).length,
  })).sort((a, b) => b.count - a.count);

  return (
    <section id="overview" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <SectionHeading
        eyebrow="Overview"
        title="The dataset at a glance"
        description="Five hundred resorts across five continents, surveyed for lift-pass price, terrain, elevation and season."
      />

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="border-border/70 bg-card/60">
            <CardContent className="p-5">
              <c.icon className="size-5 text-primary" />
              <div className="mt-4 font-heading text-3xl font-bold tracking-tight">
                {c.value}
              </div>
              <div className="mt-1 text-sm font-medium">{c.label}</div>
              <div className="text-xs text-muted-foreground">{c.hint}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-4 border-border/70 bg-card/60">
        <CardContent className="p-5">
          <div className="flex items-baseline justify-between">
            <div className="text-sm font-medium">Resorts by continent</div>
            <div className="text-xs text-muted-foreground">
              {num(stats.count)} total
            </div>
          </div>
          <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full">
            {byContinent.map((d) => (
              <div
                key={d.continent}
                style={{
                  width: `${(d.count / stats.count) * 100}%`,
                  backgroundColor: CONTINENT_COLORS[d.continent],
                }}
                title={`${d.continent}: ${d.count}`}
              />
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs">
            {byContinent.map((d) => (
              <div key={d.continent} className="flex items-center gap-1.5">
                <span
                  className="size-2.5 rounded-[3px]"
                  style={{ backgroundColor: CONTINENT_COLORS[d.continent] }}
                />
                <span className="text-muted-foreground">{d.continent}</span>
                <span className="font-medium tabular-nums">{d.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
