import { MountainRange } from "@/components/mountain-range";
import type { OverviewStats } from "@/lib/types";
import { usd, num } from "@/lib/format";

export function Hero({ stats }: { stats: OverviewStats }) {
  const chips = [
    { label: "resorts", value: num(stats.count) },
    { label: "countries", value: num(stats.countries) },
    { label: "continents", value: num(stats.continents) },
    { label: "avg day pass", value: usd(stats.avgPrice) },
  ];

  return (
    <section id="top" className="relative overflow-hidden border-b border-border/60">
      <div className="aurora pointer-events-none absolute inset-0 -z-10" />
      <div className="mx-auto max-w-7xl px-4 pb-40 pt-20 sm:px-6 sm:pt-28 lg:px-8">
        <p className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
          <span className="size-1.5 rounded-full bg-primary" />
          A global atlas of alpine skiing
        </p>
        <h1 className="mt-6 max-w-4xl text-balance font-heading text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
          Chase winter across{" "}
          <span className="bg-gradient-to-br from-primary to-[var(--continent-asia)] bg-clip-text text-transparent">
            five continents
          </span>
          .
        </h1>
        <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          {num(stats.count)} ski resorts, from the Andes to Hokkaido — every lift
          pass price, summit elevation and vertical drop, mapped and ready to
          compare.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          {chips.map((c) => (
            <div
              key={c.label}
              className="rounded-xl border border-border/70 bg-card/70 px-4 py-3 backdrop-blur"
            >
              <div className="font-heading text-xl font-bold">{c.value}</div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                {c.label}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-3 text-sm">
          <a
            href="#map"
            className="rounded-lg bg-primary px-5 py-2.5 font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Open the map
          </a>
          <a
            href="#directory"
            className="rounded-lg border border-border px-5 py-2.5 font-medium transition-colors hover:bg-accent"
          >
            Browse all resorts
          </a>
        </div>
      </div>
      <MountainRange className="pointer-events-none absolute inset-x-0 bottom-0 h-48 w-full sm:h-64" />
    </section>
  );
}
