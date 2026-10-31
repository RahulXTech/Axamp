/*
 * Adds a lead to the Google Sheet as one row, through a Google Apps Script
 * web app on the sheet (docs/google-apps-script.gs) — no Google keys needed.
 * api/contact.js uses it for forms that send a `report` (the lead loss
 * report's "Find the reason" form). The leading "_" keeps Vercel from
 * serving this file as an endpoint.
 *
 * Env (server side only — not VITE_-prefixed, so never in the browser bundle):
 *   GOOGLE_SHEETS_WEB_APP_URL  the web app's ".../exec" URL
 *   GOOGLE_SHEETS_SECRET       the same value as the script's AXAMP_SECRET Script Property
 */

const env = (key) => (process.env[key] || "").trim();

export const sheetConfigured = () => Boolean(env("GOOGLE_SHEETS_WEB_APP_URL") && env("GOOGLE_SHEETS_SECRET"));

// `columns` is [[heading, value], …] — the script puts the headings in row 1 of a blank tab
export async function appendLead(columns) {
  // Google answers with a redirect to the script's reply; fetch follows it as a GET, as Google expects
  const res = await fetch(env("GOOGLE_SHEETS_WEB_APP_URL"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret: env("GOOGLE_SHEETS_SECRET"), columns }),
    redirect: "follow",
    signal: AbortSignal.timeout(20000),
  });
  const raw = await res.text();
  let data = null;
  try {
    data = JSON.parse(raw);
  } catch {
    // A sign-in page or Google error page instead of the script's JSON
  }
  if (!res.ok || !data?.ok) {
    throw new Error(
      `Apps Script (${res.status}): ${
        data ? data.error || "row not saved" : 'no JSON reply — is the web app deployed with "Who has access: Anyone"?'
      }`,
    );
  }
}
