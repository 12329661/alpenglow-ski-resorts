export function MountainRange({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1440 320"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`pointer-events-none ${className ?? ""}`}
    >
      <path
        className="fill-primary/15"
        d="M0 320V190l120-70 110 60 130-110 120 90 140-130 150 120 130-70 120 80 130-50 100 60V320Z"
      />
      <path
        className="fill-primary/25"
        d="M0 320V240l160-90 120 70 140-80 130 90 150-110 140 100 150-60 130 70 150-40V320Z"
      />
      <path
        className="fill-primary/40"
        d="M0 320V270l180-70 150 60 160-50 150 70 170-60 160 60 160-30 170 50V320Z"
      />
    </svg>
  );
}
