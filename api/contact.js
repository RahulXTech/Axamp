import { Resend } from "resend";

import { appendLead, sheetConfigured } from "./_sheets.js";

/*
 * POST /api/contact — emails a contact-form lead to AXAMP via Resend.
 * Other forms post here too and name themselves in `source` (e.g. the lead
 * loss report's "Find the reason" form); it goes in the subject line. A form
 * can also send `report` — sections of [label, value, note?] rows — which
 * the email lays out as tables in place of the contact form's project details.
 * A lead with a report is also added to the Google Sheet as one row (a column
 * per report row), when the sheet is set up; it counts as received if either
 * the email or the sheet gets it.
 *
 * Env (in .env locally, and in the hosting dashboard in production):
 *   RESEND_API_KEY      required (unless only the sheet is wanted)
 *   CONTACT_TO_EMAIL    optional, where leads go (comma-separate several)
 *   CONTACT_FROM_EMAIL  optional, e.g. "AXAMP Website <leads@yourdomain.com>"
 *                       (needs a domain verified in Resend; until then the
 *                       resend.dev sender can only email the Resend account's
 *                       own address)
 *   GOOGLE_SHEETS_WEB_APP_URL, GOOGLE_SHEETS_SECRET
 *                       optional, the Google Sheet's Apps Script web app (see api/_sheets.js)
 */

const TO = (process.env.CONTACT_TO_EMAIL || "info@axamp.com")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const FROM = process.env.CONTACT_FROM_EMAIL || "AXAMP Website <onboarding@resend.dev>";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Visitors' text goes into HTML — escape it
const esc = (v) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const clean = (v, max = 200) => String(v ?? "").trim().slice(0, max);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  // Some hosts hand over the raw string instead of parsed JSON
  let body = req.body ?? {};
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }
  }

  const name = clean(body.name, 100);
  const phone = clean(body.phone, 30);
  const email = clean(body.email, 120);
  const business = clean(body.business, 120);
  const industry = clean(body.industry, 80);
  const budget = clean(body.budget, 80);
  const method = clean(body.method, 30);
  const message = clean(body.message, 3000);
  const source = clean(body.source, 80);
  // Optional report, as sections of [label, value, note?] rows (the lead loss report's form sends one)
  const report = Array.isArray(body.report)
    ? body.report
        .slice(0, 8)
        .map((s) => ({
          title: clean(s?.title, 120),
          rows: Array.isArray(s?.rows)
            ? s.rows
                .slice(0, 20)
                .filter(Array.isArray)
                .map((r) => r.slice(0, 3).map((c) => clean(c, 400)))
                .filter((r) => r[0])
            : [],
        }))
        .filter((s) => s.title && s.rows.length)
    : [];
  const needs = Array.isArray(body.needs) ? body.needs.map((n) => clean(n, 80)).filter(Boolean).slice(0, 20) : [];

  const digits = phone.replace(/\D/g, "");
  if (!name || digits.length < 10 || digits.length > 13) {
    return res.status(400).json({ success: false, message: "Please add your name and a valid phone number." });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ success: false, message: "Please add a valid email address." });
  }

  const emailOn = Boolean(process.env.RESEND_API_KEY);
  const sheetOn = report.length > 0 && sheetConfigured();
  if (!emailOn && !sheetOn) {
    console.error("Contact form: RESEND_API_KEY is not set");
    return res.status(500).json({ success: false, message: "Email is not configured on the server" });
  }

  const row = (label, value) => `
    <tr>
      <td style="padding:8px 12px;color:#6b7280;font-size:13px;white-space:nowrap;vertical-align:top">${label}</td>
      <td style="padding:8px 12px;color:#111827;font-size:14px;font-weight:600">${value ? esc(value) : "—"}</td>
    </tr>`;

  // A report row: the label can be a whole question, so it wraps; a note sits under the value
  const reportRow = ([label, value, note]) => `
    <tr>
      <td style="padding:8px 12px;color:#6b7280;font-size:13px;vertical-align:top;width:48%;border-top:1px solid #f3f4f6">${esc(label)}</td>
      <td style="padding:8px 12px;color:#111827;font-size:14px;font-weight:600;vertical-align:top;border-top:1px solid #f3f4f6">${value ? esc(value) : "—"}${
        note ? `<div style="margin-top:2px;color:#6b7280;font-size:12px;font-weight:400">${esc(note)}</div>` : ""
      }</td>
    </tr>`;

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;max-width:600px;margin:0 auto">
      <h2 style="margin:0 0 4px">New AXAMP website lead</h2>
      <p style="margin:0 0 16px;color:#6b7280">${esc(name)}${business ? ` · ${esc(business)}` : ""}</p>

      <h3 style="margin:16px 0 4px">Contact details</h3>
      <table style="border-collapse:collapse;width:100%">
        ${row("Name", name)}
        ${row("Phone", phone)}
        ${row("Email", email)}${
          // The "Find the reason" form (it sends a report) doesn't ask for these
          report.length ? "" : `${row("Business", business)}${row("Preferred contact", method)}`
        }
      </table>

      ${
        report.length
          ? report
              .map(
                (s) => `
      <h3 style="margin:20px 0 4px">${esc(s.title)}</h3>
      <table style="border-collapse:collapse;width:100%">${s.rows.map(reportRow).join("")}
      </table>`,
              )
              .join("")
          : `
      <h3 style="margin:16px 0 4px">Project details</h3>
      <table style="border-collapse:collapse;width:100%">
        ${row("Industry", industry)}
        ${row("Services", needs.join(", "))}
        ${row("Marketing budget (excl. ads)", budget)}
      </table>`
      }

      <h3 style="margin:16px 0 4px">Message</h3>
      <p style="margin:0;white-space:pre-wrap">${message ? esc(message) : "No additional message."}</p>

      <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb" />
      <p style="margin:0;color:#9ca3af;font-size:12px">Submitted from the AXAMP website ${source ? esc(source) : "contact form"}.</p>
    </div>`;

  const text = [
    "New AXAMP website lead",
    "",
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Email: ${email || "—"}`,
    ...(report.length ? [] : [`Business: ${business || "—"}`, `Preferred contact: ${method || "—"}`]),
    ...(report.length
      ? report.flatMap((s) => ["", `${s.title}:`, ...s.rows.flatMap(([label, value, note]) => [`- ${label}: ${value || "—"}`, ...(note ? [`  (${note})`] : [])])])
      : [`Industry: ${industry || "—"}`, `Services: ${needs.join(", ") || "—"}`, `Marketing budget (excl. ads): ${budget || "—"}`]),
    "",
    `Message: ${message || "No additional message."}`,
    "",
    `Submitted from the AXAMP website ${source || "contact form"}.`,
  ].join("\n");

  const sendEmail = async () => {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { error } = await resend.emails.send({
        from: FROM,
        to: TO,
        // Hitting "Reply" in your inbox answers the visitor directly
        replyTo: email,
        subject: source ? `${source} — ${name}` : `New AXAMP lead — ${business || name}`,
        html,
        text,
      });
      if (error) {
        console.error("Resend error:", error);
        return false;
      }
      return true;
    } catch (err) {
      console.error("Contact form error:", err);
      return false;
    }
  };

  // One row: when, who, then a column per report row (its note on a new line in the same cell)
  const saveToSheet = () =>
    appendLead([
      ["Submitted at", new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true })],
      ["Name", name],
      ["Email", email],
      ["Mobile", phone],
      ...report.flatMap((s) => s.rows.map(([label, value, note]) => [label, [value || "—", note].filter(Boolean).join("\n")])),
      ["Message", message],
      ["Source", source || "contact form"],
    ]).then(
      () => true,
      (err) => {
        console.error("Google Sheet error:", err);
        return false;
      },
    );

  const [mailed, saved] = await Promise.all([emailOn && sendEmail(), sheetOn && saveToSheet()]);
  if (!mailed && !saved) {
    return res.status(502).json({ success: false, message: "Your details could not be sent" });
  }
  return res.status(200).json({ success: true, message: "Lead received", mailed, saved });
}
