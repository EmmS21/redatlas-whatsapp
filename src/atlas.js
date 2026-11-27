import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const capturePath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "captures",
  "session-queries.json",
);

const MARKETS = [
  { test: /carolina|isla verde|cangrejo/i, listings: "listings-carolina-house", stats: "stats-carolina-house", label: "Carolina houses" },
  { test: /bayam[oó]n/i, listings: "listings-bayamon-house", stats: "stats-bayamon-house", label: "Bayamón houses" },
  { test: /mayag[uü]ez/i, listings: "listings-mayaguez-house", stats: "stats-mayaguez-house", label: "Mayagüez houses" },
  { test: /caguas/i, listings: "listings-caguas-condo", stats: "stats-caguas-condo", label: "Caguas apartments" },
  { test: /san juan|santurce|condado|hato rey|viejo san juan/i, listings: null, stats: "stats-san-juan-condo", label: "San Juan apartments" },
  { test: /ponce/i, listings: null, stats: "stats-ponce-office", label: "Ponce offices" },
];

function loadCapture() {
  return JSON.parse(fs.readFileSync(capturePath, "utf8"));
}

export function comparableSales(address) {
  const capture = loadCapture();
  const byName = new Map(capture.succeeded.map((row) => [row.name, row]));
  const market = MARKETS.find((item) => item.test.test(address));
  if (!market) {
    return { address, effectiveDate: capture.capturedAt, marketLabel: null, rows: [], stats: null };
  }
  const listings = market.listings ? byName.get(market.listings) : null;
  const stats = market.stats ? byName.get(market.stats) : null;
  return {
    address,
    effectiveDate: capture.capturedAt,
    marketLabel: market.label,
    rows: listings?.rows || [],
    stats: stats
      ? {
          count: stats.totalCount ?? stats.total ?? 0,
          price: stats.price || null,
        }
      : null,
  };
}
