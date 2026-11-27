# RED Atlas on WhatsApp

Distribution-layer demo. WhatsApp is the reach mechanism: an appraiser texts a Puerto Rico address and gets recent comparable sales back. No account, no menu, no model.

Two layers:

1. **Meta Cloud API** webhook receives the message and sends the reply.
2. A fixed template turns the captured RED Atlas JSON in `captures/session-queries.json` into a short appraisal note. No live API call.

An inbound text that does not look like an address gets one line: `Text a property address to see comparable sales.`

The capture has for-sale listings and market stats for San Juan, Carolina, Bayamón, Caguas, Mayagüez, and Ponce. The note names the subject, the effective date of the capture, gross living area, price per square foot, and the unadjusted asking range. Closed sales, permits, and taxes were not in the capture.

## Env vars

Copy `.env.example` to `.env`.

| Name | Where it comes from |
|---|---|
| `META_ACCESS_TOKEN` | App Dashboard → WhatsApp → API Setup. The temporary token lasts about 24 hours. |
| `META_PHONE_NUMBER_ID` | Same page, under the test number. This is the id, not the phone number people dial. |
| `META_VERIFY_TOKEN` | A string you invent. The same value is pasted when you register the webhook. |
| `RED_ATLAS_TOKEN` | The signed-in RED Atlas session (`ra_access`). The demo does not send it to the API. Render keeps it as an environment variable. |
| `PORT` | Optional. Defaults to 3000. Render sets this. |

## Add the five test recipients

Meta’s test number only messages numbers you verify, and only five of them.

1. Open [developers.facebook.com](https://developers.facebook.com), your app, then **WhatsApp → API Setup**.
2. Use the **From** number Meta assigned. That is the test line. There is no Twilio number and no per-message fee on this test setup.
3. Under **To**, add a recipient in international format. Meta sends a code. Enter the code. Repeat for up to five numbers.
4. Only those five can text the test line and receive replies.

## Run

```bash
npm install
npm start
```

Meta cannot reach `localhost`. Expose port 3000 with a tunnel, then in **WhatsApp → Configuration**:

- Callback URL: `https://<your-host>/webhook`
- Verify token: the same value as `META_VERIFY_TOKEN`
- Subscribe to the **messages** field

Open the landing page at `http://localhost:3000` (or open `public/index.html`). It has the headline, one sentence, and a button. Replace `YOUR_TEST_NUMBER` in `public/index.html` with the test line’s digits, country code, no plus sign, so the button is `https://wa.me/15551234567`.

Text that number a street address, for example `145 Calle Loiza, Carolina`.
