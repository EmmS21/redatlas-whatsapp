const SQFT_PER_SQM = 10.76391041671;

function money(n) {
  const value = Number(n);
  if (!Number.isFinite(value)) return "n/a";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function sqft(sqm) {
  const value = Number(sqm) * SQFT_PER_SQM;
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.round(value);
}

function perSqft(price, areaSqm) {
  const area = sqft(areaSqm);
  const ask = Number(price);
  if (!area || !Number.isFinite(ask)) return null;
  return Math.round(ask / area);
}

function effectiveDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const local = new Date(d.getTime() - 4 * 60 * 60 * 1000);
  return `${local.getUTCDate()} ${months[local.getUTCMonth()]} ${local.getUTCFullYear()}`;
}

export const FALLBACK = "Text a property address to see comparable sales.";

export function formatSales(result) {
  const date = effectiveDate(result.effectiveDate);
  const lines = [
    "*Subject property*",
    result.address,
    "",
  ];
  if (date) lines.push(`*Effective date* ${date}`);

  if (!result.marketLabel) {
    lines.push("No capture for this municipality. On file: San Juan, Carolina, Bayamón, Caguas, Mayagüez, Ponce.");
    return lines.join("\n");
  }

  const count = result.stats?.count;
  const avg = result.stats?.price?.avg;
  if (count != null) {
    const avgBit = Number.isFinite(Number(avg)) ? ` Average ask ${money(avg)}.` : "";
    lines.push(`*Market conditions* ${count} offered.${avgBit}`);
  }

  const comps = (result.rows || []).slice(0, 4).map((row, i) => {
    const gla = sqft(row.builtArea);
    const psf = perSqft(row.price, row.builtArea);
    const bits = [`*${money(row.price)}*`];
    if (gla) bits.push(`GLA ${gla.toLocaleString("en-US")} sf`);
    if (psf) bits.push(`*${money(psf)}/sf*`);
    if (row.rooms) bits.push(`${row.rooms} bed`);
    return `${i + 1}. ${bits.join(" · ")}`;
  });

  if (comps.length) {
    lines.push("", "*Comparable sales*", ...comps);
  }

  const min = result.stats?.price?.min;
  const max = result.stats?.price?.max;
  if (Number.isFinite(Number(min)) && Number.isFinite(Number(max)) && Number(max) > 0) {
    lines.push("", `*Adjusted value range* ${money(min)}–${money(max)}, before time or condition adjustments.`);
  } else if (!comps.length) {
    lines.push("No comparables in this capture.");
  }

  return lines.join("\n");
}
