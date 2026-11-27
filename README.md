# RED Atlas local chat

A local stand-in for the WhatsApp thread. You type a Puerto Rico property address. The reply is the same appraisal note as before, built from `captures/session-queries.json` by `src/template.js`. No Meta, no Twilio, no live RED Atlas call.

The captured rows have no photo URLs. If a row includes `photos`, the chat shows those thumbnails under the note.

## Run

```bash
npm install
npm start
```

Open http://localhost:3000. Try `145 Calle Loiza, Carolina`. A message that is not an address gets: `Text a property address to see comparable sales.`

`PORT` is optional and defaults to 3000.
