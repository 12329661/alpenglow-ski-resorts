"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { ResortEnriched } from "@/lib/types";

export function ResortCombobox({
  resorts,
  value,
  onChange,
  label,
}: {
  resorts: ResortEnriched[];
  value: number | null;
  onChange: (id: number) => void;
  label: string;
}) {
  const [open, setOpen] = React.useState(false);
  const selected = resorts.find((r) => r.id === value) ?? null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            aria-label={label}
            className="h-auto w-full justify-between py-2.5 text-left font-normal"
          />
        }
      >
        <span className="min-w-0 truncate">
          {selected ? (
            <>
              <span className="font-medium">{selected.name}</span>
              <span className="text-muted-foreground"> · {selected.country}</span>
            </>
          ) : (
            <span className="text-muted-foreground">Choose a resort…</span>
          )}
        </span>
        <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent
        className="w-[22rem] max-w-[92vw] p-0"
        align="start"
      >
        <Command
          filter={(val, search) =>
            val.toLowerCase().includes(search.toLowerCase().trim()) ? 1 : 0
          }
        >
          <CommandInput placeholder="Search resorts…" />
          <CommandList>
            <CommandEmpty>No resort found.</CommandEmpty>
            <CommandGroup>
              {resorts.map((r) => (
                <CommandItem
                  key={r.id}
                  value={`${r.name} ${r.country} #${r.id}`}
                  onSelect={() => {
                    onChange(r.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 size-4 shrink-0",
                      r.id === value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="truncate">
                    {r.name}
                    <span className="text-muted-foreground"> · {r.country}</span>
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
