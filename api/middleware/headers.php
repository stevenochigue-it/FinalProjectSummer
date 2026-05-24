<?php
/**
 * Security Headers & CORS Middleware
 * Implements Defense-in-Depth strategies
 */

// Allow from any origin for development (Restrict in production)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// --- Defense-in-Depth Headers ---

// Prevent MIME-type sniffing
header("X-Content-Type-Options: nosniff");

// Prevent Clickjacking
header("X-Frame-Options: DENY");

// Enable Browser XSS filtering
header("X-XSS-Protection: 1; mode=block");

// Referrer Policy
header("Referrer-Policy: strict-origin-when-cross-origin");

// HSTS (Only for HTTPS)
if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') {
    header("Strict-Transport-Security: max-age=31536000; includeSubDomains");
}

// Handle Preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

/**
 * Utility to send JSON response
 */
function sendResponse($code, $data) {
    http_response_code($code);
    echo json_encode($data);
    exit;
}
?>
