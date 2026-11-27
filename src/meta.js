const GRAPH = "https://graph.facebook.com/v22.0";

export function verifySubscription(query) {
  const mode = query["hub.mode"];
  const token = query["hub.verify_token"];
  const challenge = query["hub.challenge"];
  if (mode === "subscribe" && token && token === process.env.META_VERIFY_TOKEN) {
    return { ok: true, challenge };
  }
  return { ok: false };
}

export function inboundTexts(body) {
  const found = [];
  for (const entry of body?.entry || []) {
    for (const change of entry.changes || []) {
      for (const message of change.value?.messages || []) {
        if (message.type === "text" && message.text?.body && message.from) {
          found.push({
            from: message.from,
            id: message.id,
            text: message.text.body,
          });
        }
      }
    }
  }
  return found;
}

export async function sendText(to, body) {
  const phoneNumberId = process.env.META_PHONE_NUMBER_ID;
  const token = process.env.META_ACCESS_TOKEN;
  if (!phoneNumberId || !token) {
    throw new Error("META_PHONE_NUMBER_ID and META_ACCESS_TOKEN are required to reply");
  }
  const res = await fetch(`${GRAPH}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: body.slice(0, 4000) },
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(`Meta send failed ${res.status}`);
    err.body = json;
    throw err;
  }
  return json;
}
