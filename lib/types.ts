export type Continent =
  | "Europe"
  | "North America"
  | "Asia"
  | "Oceania"
  | "South America";

export type Resort = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  continent: Continent;
  price: number | null;
  season: string | null;
  highest_point: number | null;
  lowest_point: number | null;
  /** Text flags from the source table: "Yes" / "No" / null. */
  nightskiing: string | null;
  summer_skiing: string | null;
  snowparks: string | null;
  child_friendly: string | null;
};

/** The yes/no amenity flags the directory can filter on. */
export type ResortFlag =
  | "nightskiing"
  | "summerSkiing"
  | "snowparks"
  | "childFriendly";

export const RESORT_FLAGS: { key: ResortFlag; label: string }[] = [
  { key: "nightskiing", label: "Night skiing" },
  { key: "summerSkiing", label: "Summer skiing" },
  { key: "snowparks", label: "Snowparks" },
  { key: "childFriendly", label: "Child friendly" },
];

export type ResortEnriched = Resort & {
  /** Highest lift-served point, metres. */
  elevation: number | null;
  /** Highest minus lowest point, metres. */
  vertical: number | null;
  /** Parsed yes/no amenity flags, keyed as in RESORT_FLAGS. */
  flags: Record<ResortFlag, boolean>;
};

export type Superlatives = {
  bestValueId: number | null;
  highestPeakId: number | null;
};

export type OverviewStats = {
  count: number;
  avgPrice: number | null;
  avgElevation: number | null;
  countries: number;
  continents: number;
};

export type ResortData = {
  resorts: ResortEnriched[];
  superlatives: Superlatives;
  stats: OverviewStats;
};

export const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

export const CONTINENTS: Continent[] = [
  "Europe",
  "North America",
  "Asia",
  "Oceania",
  "South America",
];

export const CONTINENT_COLORS: Record<Continent, string> = {
  Europe: "var(--continent-europe)",
  "North America": "var(--continent-north-america)",
  Asia: "var(--continent-asia)",
  Oceania: "var(--continent-oceania)",
  "South America": "var(--continent-south-america)",
};
