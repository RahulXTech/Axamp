<?php
/*
 * Adds a lead to the Google Sheet as one row — the PHP twin of api/_sheets.js,
 * used by contact.php on Hostinger. Posts to a Google Apps Script web app on
 * the sheet (docs/google-apps-script.gs) — no Google keys needed. Only
 * defines functions; .htaccess also blocks it from being opened directly.
 *
 * Settings (config.php, written by `npm run build` from .env):
 *   GOOGLE_SHEETS_WEB_APP_URL  the web app's ".../exec" URL
 *   GOOGLE_SHEETS_SECRET       the same value as the script's AXAMP_SECRET Script Property
 */

function sheet_configured($config)
{
    return setting($config, 'GOOGLE_SHEETS_WEB_APP_URL') !== '' && setting($config, 'GOOGLE_SHEETS_SECRET') !== '';
}

// $columns is [[heading, value], …] — the script puts the headings in row 1 of a blank tab.
// Returns true once the script says the row is saved; logs why and returns false otherwise.
function sheet_append($config, $columns)
{
    $ch = curl_init(setting($config, 'GOOGLE_SHEETS_WEB_APP_URL'));
    curl_setopt_array($ch, [
        // CURLOPT_POST, not a custom "POST" method: Google answers with a 302 to the
        // script's reply, and curl then fetches that with a GET, as Google expects
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode(
            ['secret' => setting($config, 'GOOGLE_SHEETS_SECRET'), 'columns' => $columns],
            JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE
        ),
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS => 5,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 20,
    ]);
    $response = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $curlError = curl_error($ch);
    $data = is_string($response) ? json_decode($response, true) : null;

    if ($response === false || $status !== 200 || !is_array($data) || empty($data['ok'])) {
        error_log('Google Sheet error: ' . ($curlError !== '' ? $curlError : $status . ' ' . (is_array($data)
            ? ($data['error'] ?? 'row not saved')
            : 'no JSON reply — is the web app deployed with "Who has access: Anyone"?')));
        return false;
    }
    return true;
}
