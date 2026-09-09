import { cn } from "cn";

export function MountainMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={cn("size-6", className)}
    >
      <path
        d="M2 27 12 8l6 11 3-5 9 13H2Z"
        className="fill-primary"
      />
      <path
        d="m9.4 15.2 2.6-4.9 2.1 3.9-1.3 2.2-1.8-2-1.6.8ZM19.3 17.4l1.7-2.9 1.9 2.8-1.2 1.1-2.4-1Z"
        className="fill-background/85"
      />
    </svg>
  );
}
