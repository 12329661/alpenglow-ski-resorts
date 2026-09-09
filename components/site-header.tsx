import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import { MountainMark } from "@/components/mountain-mark";

const NAV = [
  { href: "#overview", label: "Overview" },
  { href: "#map", label: "Map" },
  { href: "#analysis", label: "Analysis" },
  { href: "#directory", label: "Directory" },
  { href: "#compare", label: "Compare" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="#top" className="flex items-center gap-2 font-heading text-base font-bold">
          <MountainMark />
          Alpenglow
        </Link>
        <nav className="hidden items-center gap-1 text-sm text-muted-foreground md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-1.5 transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto">
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
