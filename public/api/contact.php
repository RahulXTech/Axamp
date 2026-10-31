<?php
/*
 * POST /api/contact on Hostinger (routed here by .htaccess) — the PHP twin
 * of api/contact.js, which only runs under `npm run dev` / `npm run preview`.
 * Emails a contact-form lead to AXAMP via Resend's HTTP API.
 * Other forms post here too and name themselves in `source` (e.g. the lead
 * loss report's "Find the reason" form); it goes in the subject line. A form
 * can also send `report` — sections of [label, value, note?] rows — which
 * the email lays out as tables in place of the contact form's project details.
 * A lead with a report is also added to the Google Sheet as one row (a column
 * per report row; sheets.php), when the sheet is set up; it counts as received
 * if either the email or the sheet gets it.
 *
 * Settings come from config.php next to this file, which `npm run build`
 * writes from .env:
 *   RESEND_API_KEY      required (unless only the sheet is wanted)
 *   CONTACT_TO_EMAIL    optional, where leads go (comma-separate several)
 *   CONTACT_FROM_EMAIL  optional, e.g. "AXAMP Website <leads@axamp.com>"
 *                       (needs a domain verified in Resend; until then the
 *                       resend.dev sender can only email the Resend account's
 *                       own address)
 *   GOOGLE_SHEETS_WEB_APP_URL, GOOGLE_SHEETS_SECRET
 *                       optional, the Google Sheet's Apps Script web app (see sheets.php)
 */

require __DIR__ . '/sheets.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function reply($code, $data)
{
    http_response_code($code);
    echo json_encode($data);
    exit;
}

function setting($config, $name, $fallback = '')
{
    $value = isset($config[$name]) ? $config[$name] : getenv($name);
    return is_string($value) && trim($value) !== '' ? trim($value) : $fallback;
}

function clean($value, $max = 200)
{
    $value = trim(is_scalar($value) ? (string) $value : '');
    return function_exists('mb_substr') ? mb_substr($value, 0, $max) : substr($value, 0, $max);
}

// Visitors' text goes into HTML — escape it
function esc($value)
{
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    reply(405, ['success' => false, 'message' => 'Method not allowed']);
}

$config = is_file(__DIR__ . '/config.php') ? require __DIR__ . '/config.php' : [];
$apiKey = setting($config, 'RESEND_API_KEY');
$to = array_values(array_filter(array_map('trim', explode(',', setting($config, 'CONTACT_TO_EMAIL', 'info@axamp.com')))));
$from = setting($config, 'CONTACT_FROM_EMAIL', 'AXAMP Website <onboarding@resend.dev>');

$body = json_decode(file_get_contents('php://input'), true);
if (!is_array($body)) {
    reply(400, ['success' => false, 'message' => 'Invalid request']);
}

$name = clean($body['name'] ?? '', 100);
$phone = clean($body['phone'] ?? '', 30);
$email = clean($body['email'] ?? '', 120);
$business = clean($body['business'] ?? '', 120);
$industry = clean($body['industry'] ?? '', 80);
$budget = clean($body['budget'] ?? '', 80);
$method = clean($body['method'] ?? '', 30);
$message = clean($body['message'] ?? '', 3000);
$source = clean($body['source'] ?? '', 80);
// Optional report, as sections of [label, value, note?] rows (the lead loss report's form sends one)
$report = [];
if (isset($body['report']) && is_array($body['report'])) {
    foreach (array_slice($body['report'], 0, 8) as $section) {
        if (!is_array($section)) {
            continue;
        }
        $rows = [];
        foreach (array_slice(isset($section['rows']) && is_array($section['rows']) ? $section['rows'] : [], 0, 20) as $r) {
            if (!is_array($r)) {
                continue;
            }
            $cells = array_map(function ($c) {
                return clean($c, 400);
            }, array_slice(array_values($r), 0, 3));
            if (($cells[0] ?? '') !== '') {
                $rows[] = $cells;
            }
        }
        $title = clean($section['title'] ?? '', 120);
        if ($title !== '' && $rows) {
            $report[] = ['title' => $title, 'rows' => $rows];
        }
    }
}
$needs = [];
if (isset($body['needs']) && is_array($body['needs'])) {
    $needs = array_slice(array_values(array_filter(array_map(function ($n) {
        return clean($n, 80);
    }, $body['needs']))), 0, 20);
}

$digits = preg_replace('/\D/', '', $phone);
if ($name === '' || strlen($digits) < 10 || strlen($digits) > 13) {
    reply(400, ['success' => false, 'message' => 'Please add your name and a valid phone number.']);
}
if (!preg_match('/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/', $email)) {
    reply(400, ['success' => false, 'message' => 'Please add a valid email address.']);
}

$emailOn = $apiKey !== '';
$sheetOn = $report && sheet_configured($config);
if (!$emailOn && !$sheetOn) {
    error_log('Contact form: RESEND_API_KEY is not set');
    reply(500, ['success' => false, 'message' => 'Email is not configured on the server']);
}

// One row: when, who, then a column per report row (its note on a new line in the same cell)
$saved = false;
if ($sheetOn) {
    $columns = [
        ['Submitted at', (new DateTime('now', new DateTimeZone('Asia/Kolkata')))->format('j M Y, g:i a')],
        ['Name', $name],
        ['Email', $email],
        ['Mobile', $phone],
    ];
    foreach ($report as $section) {
        foreach ($section['rows'] as $cells) {
            $columns[] = [$cells[0], implode("\n", array_filter([($cells[1] ?? '') !== '' ? $cells[1] : '—', $cells[2] ?? '']))];
        }
    }
    $columns[] = ['Message', $message];
    $columns[] = ['Source', $source !== '' ? $source : 'contact form'];
    $saved = sheet_append($config, $columns);
}

function row($label, $value)
{
    return '
    <tr>
      <td style="padding:8px 12px;color:#6b7280;font-size:13px;white-space:nowrap;vertical-align:top">' . $label . '</td>
      <td style="padding:8px 12px;color:#111827;font-size:14px;font-weight:600">' . ($value !== '' ? esc($value) : '—') . '</td>
    </tr>';
}

$services = implode(', ', $needs);

// A report row: the label can be a whole question, so it wraps; a note sits under the value
function reportRow($cells)
{
    $value = $cells[1] ?? '';
    $note = $cells[2] ?? '';
    return '
    <tr>
      <td style="padding:8px 12px;color:#6b7280;font-size:13px;vertical-align:top;width:48%;border-top:1px solid #f3f4f6">' . esc($cells[0]) . '</td>
      <td style="padding:8px 12px;color:#111827;font-size:14px;font-weight:600;vertical-align:top;border-top:1px solid #f3f4f6">' . ($value !== '' ? esc($value) : '—')
        . ($note !== '' ? '<div style="margin-top:2px;color:#6b7280;font-size:12px;font-weight:400">' . esc($note) . '</div>' : '') . '</td>
    </tr>';
}

if ($report) {
    $detailsHtml = '';
    foreach ($report as $section) {
        $detailsHtml .= '
      <h3 style="margin:20px 0 4px">' . esc($section['title']) . '</h3>
      <table style="border-collapse:collapse;width:100%">' . implode('', array_map('reportRow', $section['rows'])) . '
      </table>';
    }
} else {
    $detailsHtml = '
      <h3 style="margin:16px 0 4px">Project details</h3>
      <table style="border-collapse:collapse;width:100%">'
        . row('Industry', $industry) . row('Services', $services) . row('Marketing budget (excl. ads)', $budget) . '
      </table>';
}

$html = '
    <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;max-width:600px;margin:0 auto">
      <h2 style="margin:0 0 4px">New AXAMP website lead</h2>
      <p style="margin:0 0 16px;color:#6b7280">' . esc($name) . ($business !== '' ? ' · ' . esc($business) : '') . '</p>

      <h3 style="margin:16px 0 4px">Contact details</h3>
      <table style="border-collapse:collapse;width:100%">'
    . row('Name', $name) . row('Phone', $phone) . row('Email', $email)
    // The "Find the reason" form (it sends a report) doesn't ask for these
    . ($report ? '' : row('Business', $business) . row('Preferred contact', $method)) . '
      </table>
' . $detailsHtml . '

      <h3 style="margin:16px 0 4px">Message</h3>
      <p style="margin:0;white-space:pre-wrap">' . ($message !== '' ? esc($message) : 'No additional message.') . '</p>

      <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb" />
      <p style="margin:0;color:#9ca3af;font-size:12px">Submitted from the AXAMP website ' . ($source !== '' ? esc($source) : 'contact form') . '.</p>
    </div>';

$or = function ($v) {
    return $v !== '' ? $v : '—';
};
$detailsText = [];
if ($report) {
    foreach ($report as $section) {
        $detailsText[] = '';
        $detailsText[] = $section['title'] . ':';
        foreach ($section['rows'] as $cells) {
            $detailsText[] = '- ' . $cells[0] . ': ' . $or($cells[1] ?? '');
            if (($cells[2] ?? '') !== '') {
                $detailsText[] = '  (' . $cells[2] . ')';
            }
        }
    }
} else {
    $detailsText = ['Industry: ' . $or($industry), 'Services: ' . $or($services), 'Marketing budget (excl. ads): ' . $or($budget)];
}

$text = implode("\n", array_merge([
    'New AXAMP website lead',
    '',
    'Name: ' . $name,
    'Phone: ' . $phone,
    'Email: ' . $or($email),
], $report ? [] : [
    'Business: ' . $or($business),
    'Preferred contact: ' . $or($method),
], $detailsText, [
    '',
    'Message: ' . ($message !== '' ? $message : 'No additional message.'),
    '',
    'Submitted from the AXAMP website ' . ($source !== '' ? $source : 'contact form') . '.',
]));

if (!$emailOn) {
    $saved
        ? reply(200, ['success' => true, 'message' => 'Lead received', 'mailed' => false, 'saved' => true])
        : reply(502, ['success' => false, 'message' => 'Your details could not be sent']);
}

$ch = curl_init('https://api.resend.com/emails');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 20,
    CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . $apiKey, 'Content-Type: application/json'],
    CURLOPT_POSTFIELDS => json_encode([
        'from' => $from,
        'to' => $to,
        // Hitting "Reply" in your inbox answers the visitor directly
        'reply_to' => $email,
        'subject' => $source !== '' ? $source . ' — ' . $name : 'New AXAMP lead — ' . ($business !== '' ? $business : $name),
        'html' => $html,
        'text' => $text,
    ]),
]);
$response = curl_exec($ch);
$status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
$curlError = curl_error($ch);

$mailed = $response !== false && $status >= 200 && $status < 300;
if (!$mailed) {
    error_log('Resend error: ' . $status . ' ' . ($curlError !== '' ? $curlError : $response));
}
if (!$mailed && !$saved) {
    reply(502, ['success' => false, 'message' => 'Your details could not be sent']);
}

reply(200, ['success' => true, 'message' => 'Lead received', 'mailed' => $mailed, 'saved' => $saved]);
