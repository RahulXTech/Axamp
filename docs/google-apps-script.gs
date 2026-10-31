/**
 * AXAMP website → Google Sheet
 *
 * Adds each lead from the lead loss report's "Find the reason" form to the
 * "Leads" tab as one row. The website's server (api/_sheets.js locally,
 * public/api/sheets.php on Hostinger) posts:
 *   { "secret": "...", "columns": [["Submitted at", "30 Oct 2026, 6:38 pm"], ["Name", "..."], ...] }
 * and gets back { "ok": true } or { "ok": false, "error": "..." }.
 *
 * Setup (full steps in README.md → "Google Sheet"):
 *   1. In the sheet: Extensions → Apps Script, paste this file in place of Code.gs.
 *   2. Project Settings → Script Properties → add AXAMP_SECRET (same value as
 *      GOOGLE_SHEETS_SECRET in the website's .env).
 *   3. Deploy → New deployment → Web app: Execute as "Me", Who has access "Anyone".
 *      The ".../exec" URL goes in GOOGLE_SHEETS_WEB_APP_URL.
 *   After changing this code: Deploy → Manage deployments → edit → Version: New version.
 */

const SHEET_NAME = 'Leads';
// Leave empty when this script was opened from the sheet (Extensions → Apps Script);
// for a standalone script, put the sheet's ID here
const SPREADSHEET_ID = '';

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const secret = PropertiesService.getScriptProperties().getProperty('AXAMP_SECRET');
    if (!secret || body.secret !== secret) return reply({ ok: false, error: 'unauthorized' });

    const columns = Array.isArray(body.columns) ? body.columns.filter((c) => Array.isArray(c) && c.length === 2) : [];
    if (!columns.length) return reply({ ok: false, error: 'no data' });

    // One write at a time, so two leads at once can't both add the headings
    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      const ss = SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
      if (sheet.getLastRow() === 0) sheet.appendRow(columns.map((c) => asText(c[0])));
      sheet.appendRow(columns.map((c) => asText(c[1])));
    } finally {
      lock.releaseLock();
    }
    return reply({ ok: true });
  } catch (err) {
    return reply({ ok: false, error: String((err && err.message) || err) });
  }
}

// Open the /exec URL in a browser to check the deployment works
function doGet() {
  return reply({ ok: true, service: 'AXAMP leads' });
}

// A value starting with = + - @ would be read as a formula ("+91 98765 43210" too);
// a leading ' keeps it as plain text
function asText(value) {
  const s = String(value == null ? '' : value);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function reply(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
