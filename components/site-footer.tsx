import { MountainMark } from "@/components/mountain-mark";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 font-heading font-semibold text-foreground">
          <MountainMark className="size-5" />
          Alpenglow
        </div>
        <p className="max-w-md">
          Resort attributes from a 499-resort survey. Data stored in Supabase,
          charts by Recharts.
        </p>
      </div>
    </footer>
  );
}
