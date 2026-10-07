import { Resend } from "resend";

/*
 * POST /api/contact — emails a contact-form lead to AXAMP via Resend.
 *
 * Env (in .env locally, and in the hosting dashboard in production):
 *   RESEND_API_KEY      required
 *   CONTACT_TO_EMAIL    optional, where leads go (comma-separate several)
 *   CONTACT_FROM_EMAIL  optional, e.g. "AXAMP Website <leads@yourdomain.com>"
 *                       (needs a domain verified in Resend; until then the
 *                       resend.dev sender can only email the Resend account's
 *                       own address)
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

  if (!process.env.RESEND_API_KEY) {
    console.error("Contact form: RESEND_API_KEY is not set");
    return res.status(500).json({ success: false, message: "Email is not configured on the server" });
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
  const needs = Array.isArray(body.needs) ? body.needs.map((n) => clean(n, 80)).filter(Boolean).slice(0, 20) : [];

  const digits = phone.replace(/\D/g, "");
  if (!name || digits.length < 10 || digits.length > 13) {
    return res.status(400).json({ success: false, message: "Please add your name and a valid phone number." });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ success: false, message: "Please add a valid email address." });
  }

  const row = (label, value) => `
    <tr>
      <td style="padding:8px 12px;color:#6b7280;font-size:13px;white-space:nowrap;vertical-align:top">${label}</td>
      <td style="padding:8px 12px;color:#111827;font-size:14px;font-weight:600">${value ? esc(value) : "—"}</td>
    </tr>`;

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;max-width:600px;margin:0 auto">
      <h2 style="margin:0 0 4px">New AXAMP website lead</h2>
      <p style="margin:0 0 16px;color:#6b7280">${esc(name)}${business ? ` · ${esc(business)}` : ""}</p>

      <h3 style="margin:16px 0 4px">Contact details</h3>
      <table style="border-collapse:collapse;width:100%">
        ${row("Name", name)}
        ${row("Phone", phone)}
        ${row("Email", email)}
        ${row("Business", business)}
        ${row("Preferred contact", method)}
      </table>

      <h3 style="margin:16px 0 4px">Project details</h3>
      <table style="border-collapse:collapse;width:100%">
        ${row("Industry", industry)}
        ${row("Services", needs.join(", "))}
        ${row("Monthly budget", budget)}
      </table>

      <h3 style="margin:16px 0 4px">Message</h3>
      <p style="margin:0;white-space:pre-wrap">${message ? esc(message) : "No additional message."}</p>

      <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb" />
      <p style="margin:0;color:#9ca3af;font-size:12px">Submitted from the AXAMP website contact form.</p>
    </div>`;

  const text = [
    "New AXAMP website lead",
    "",
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Email: ${email || "—"}`,
    `Business: ${business || "—"}`,
    `Preferred contact: ${method || "—"}`,
    `Industry: ${industry || "—"}`,
    `Services: ${needs.join(", ") || "—"}`,
    `Monthly budget: ${budget || "—"}`,
    "",
    `Message: ${message || "No additional message."}`,
  ].join("\n");

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: TO,
      // Hitting "Reply" in your inbox answers the visitor directly
      replyTo: email,
      subject: `New AXAMP lead — ${business || name}`,
      html,
      text,
    });

    if (error) {
      console.error("Resend error:", error);
      return res.status(502).json({ success: false, message: "Email could not be sent" });
    }

    return res.status(200).json({ success: true, message: "Email sent successfully", id: data?.id });
  } catch (err) {
    console.error("Contact form error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
}
