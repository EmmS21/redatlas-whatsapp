import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { looksLikeAddress, addressQuery } from "./address.js";
import { comparableSales } from "./atlas.js";
import { FALLBACK, formatSales } from "./template.js";
import { verifySubscription, inboundTexts, sendText } from "./meta.js";

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv() {
  const file = path.join(rootDir, ".env");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const name = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[name] == null) process.env[name] = value;
  }
}

loadEnv();

const app = express();
app.use(express.json());

app.get("/", (_req, res) => {
  res
    .type("text/plain")
    .send(
      "Red Atlas WhatsApp demo — text a Puerto Rico property address to this number on WhatsApp to see comparable sales.\n",
    );
});

const publicDir = path.join(rootDir, "public");
app.use(express.static(publicDir));

const seen = new Set();

function firstTime(id) {
  if (!id) return true;
  if (seen.has(id)) return false;
  seen.add(id);
  if (seen.size > 500) seen.delete(seen.values().next().value);
  return true;
}

async function replyTo(message) {
  const text = addressQuery(message.text);
  const body = looksLikeAddress(text) ? formatSales(comparableSales(text)) : FALLBACK;
  await sendText(message.from, body);
}

app.get("/webhook", (req, res) => {
  const result = verifySubscription(req.query);
  if (!result.ok) return res.sendStatus(403);
  res.status(200).type("text/plain").send(result.challenge);
});

app.post("/webhook", (req, res) => {
  res.sendStatus(200);
  for (const message of inboundTexts(req.body)) {
    if (!firstTime(message.id)) continue;
    replyTo(message).catch((err) => {
      console.error("reply failed", message.from, err.message, err.body || "");
    });
  }
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, atlasToken: Boolean(process.env.RED_ATLAS_TOKEN) });
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
