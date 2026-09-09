export const usd = (n: number | null | undefined, digits = 0) =>
  n == null
    ? "—"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: digits,
      }).format(n);

export const metres = (n: number | null | undefined) =>
  n == null ? "—" : `${new Intl.NumberFormat("en-US").format(Math.round(n))} m`;

export const pct = (n: number | null | undefined, digits = 0) =>
  n == null ? "—" : `${n.toFixed(digits)}%`;

export const num = (n: number | null | undefined) =>
  n == null ? "—" : new Intl.NumberFormat("en-US").format(n);
