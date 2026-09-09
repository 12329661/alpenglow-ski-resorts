import { AlertTriangle } from "lucide-react";
import { getResortData } from "@/lib/data";
import { Hero } from "@/components/sections/hero";
import { Overview } from "@/components/sections/overview";
import { ResortMap } from "@/components/sections/resort-map";
import { Analysis } from "@/components/sections/analysis";
import { Directory } from "@/components/sections/directory";
import { Compare } from "@/components/sections/compare";
import { Card, CardContent } from "@/components/ui/card";

export const revalidate = 300;

export default async function HomePage() {
  let data;
  try {
    data = await getResortData();
  } catch (err) {
    return <SetupNotice message={err instanceof Error ? err.message : String(err)} />;
  }

  if (data.resorts.length === 0) {
    return <SetupNotice message="The resorts table is empty." />;
  }

  return (
    <>
      <Hero stats={data.stats} />
      <Overview data={data} />
      <ResortMap resorts={data.resorts} />
      <Analysis resorts={data.resorts} />
      <Directory data={data} />
      <Compare data={data} />
    </>
  );
}

function SetupNotice({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24">
      <Card className="border-amber-500/40 bg-amber-500/5">
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center gap-2 font-heading text-lg font-semibold">
            <AlertTriangle className="size-5 text-amber-500" />
            Database not ready
          </div>
          <p className="text-sm text-muted-foreground">
            Couldn&rsquo;t load resort data from Supabase:
          </p>
          <pre className="overflow-x-auto rounded-md border border-border bg-muted/50 p-3 text-xs">
            {message}
          </pre>
          <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
            <li>
              Open the Supabase project&rsquo;s <strong>SQL Editor</strong>.
            </li>
            <li>
              Paste the contents of <code>supabase/setup.sql</code> and run it.
            </li>
            <li>Reload this page.</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
