<?php
/*
 * POST /api/contact on Hostinger (routed here by .htaccess) — the PHP twin
 * of api/contact.js, which only runs under `npm run dev` / `npm run preview`.
 * Emails a contact-form lead to AXAMP via Resend's HTTP API.
 *
 * Settings come from config.php next to this file, which `npm run build`
 * writes from .env:
 *   RESEND_API_KEY      required
 *   CONTACT_TO_EMAIL    optional, where leads go (comma-separate several)
 *   CONTACT_FROM_EMAIL  optional, e.g. "AXAMP Website <leads@axamp.com>"
 *                       (needs a domain verified in Resend; until then the
 *                       resend.dev sender can only email the Resend account's
 *                       own address)
 */

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

if ($apiKey === '') {
    error_log('Contact form: RESEND_API_KEY is not set');
    reply(500, ['success' => false, 'message' => 'Email is not configured on the server']);
}

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

function row($label, $value)
{
    return '
    <tr>
      <td style="padding:8px 12px;color:#6b7280;font-size:13px;white-space:nowrap;vertical-align:top">' . $label . '</td>
      <td style="padding:8px 12px;color:#111827;font-size:14px;font-weight:600">' . ($value !== '' ? esc($value) : '—') . '</td>
    </tr>';
}

$services = implode(', ', $needs);

$html = '
    <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;max-width:600px;margin:0 auto">
      <h2 style="margin:0 0 4px">New AXAMP website lead</h2>
      <p style="margin:0 0 16px;color:#6b7280">' . esc($name) . ($business !== '' ? ' · ' . esc($business) : '') . '</p>

      <h3 style="margin:16px 0 4px">Contact details</h3>
      <table style="border-collapse:collapse;width:100%">'
    . row('Name', $name) . row('Phone', $phone) . row('Email', $email) . row('Business', $business) . row('Preferred contact', $method) . '
      </table>

      <h3 style="margin:16px 0 4px">Project details</h3>
      <table style="border-collapse:collapse;width:100%">'
    . row('Industry', $industry) . row('Services', $services) . row('Monthly budget', $budget) . '
      </table>

      <h3 style="margin:16px 0 4px">Message</h3>
      <p style="margin:0;white-space:pre-wrap">' . ($message !== '' ? esc($message) : 'No additional message.') . '</p>

      <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb" />
      <p style="margin:0;color:#9ca3af;font-size:12px">Submitted from the AXAMP website contact form.</p>
    </div>';

$or = function ($v) {
    return $v !== '' ? $v : '—';
};
$text = implode("\n", [
    'New AXAMP website lead',
    '',
    'Name: ' . $name,
    'Phone: ' . $phone,
    'Email: ' . $or($email),
    'Business: ' . $or($business),
    'Preferred contact: ' . $or($method),
    'Industry: ' . $or($industry),
    'Services: ' . $or($services),
    'Monthly budget: ' . $or($budget),
    '',
    'Message: ' . ($message !== '' ? $message : 'No additional message.'),
]);

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
        'subject' => 'New AXAMP lead — ' . ($business !== '' ? $business : $name),
        'html' => $html,
        'text' => $text,
    ]),
]);
$response = curl_exec($ch);
$status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
$curlError = curl_error($ch);

if ($response === false || $status < 200 || $status >= 300) {
    error_log('Resend error: ' . $status . ' ' . ($curlError !== '' ? $curlError : $response));
    reply(502, ['success' => false, 'message' => 'Email could not be sent']);
}

$data = json_decode($response, true);
reply(200, ['success' => true, 'message' => 'Email sent successfully', 'id' => $data['id'] ?? null]);
