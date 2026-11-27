// A message counts as an address when it has a street number and either a
// street word or enough tokens to be a place line. Anything else is fallback.
const STREET = /\b(calle|cll|cl|ave|avenida|av|street|st|road|rd|blvd|boulevard|km|urb|urbanizaci[oó]n|cond|condominio|apt|apto|suite|ste|#)\b/i;

export function looksLikeAddress(text) {
  const t = String(text || "").trim();
  if (t.length < 8 || t.length > 180) return false;
  if (!/\d/.test(t)) return false;
  const tokens = t.split(/\s+/).filter(Boolean);
  if (STREET.test(t)) return true;
  return tokens.length >= 3 && /,\s*\p{L}/u.test(t);
}

export function addressQuery(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}
