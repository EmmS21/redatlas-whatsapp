import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { looksLikeAddress, addressQuery } from "./address.js";
import { comparableSales } from "./atlas.js";
import { FALLBACK, formatSales } from "./template.js";

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const app = express();
app.use(express.json());

app.post("/chat", (req, res) => {
  const text = addressQuery(req.body?.text || "");
  if (!looksLikeAddress(text)) {
    return res.json({ reply: FALLBACK, photos: [] });
  }
  const result = comparableSales(text);
  const photos = (result.rows || [])
    .flatMap((row) => (Array.isArray(row.photos) ? row.photos : []))
    .filter((url) => typeof url === "string" && url.startsWith("http"))
    .slice(0, 4);
  res.json({ reply: formatSales(result), photos });
});

app.use(express.static(path.join(rootDir, "public")));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
