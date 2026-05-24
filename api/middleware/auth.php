<?php
/**
 * Authentication Middleware
 * Checks for a valid session or Authorization token
 */

function checkAuth() {
    // 1. Check Session (for Admin Dashboard PHP calls)
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    if (isset($_SESSION['admin_id'])) {
        return true;
    }

    // 2. Check Authorization Header (for React/External calls)
    $authHeader = null;
    
    // Try to get Authorization header from various sources
    if (isset($_SERVER['Authorization'])) {
        $authHeader = $_SERVER['Authorization'];
    } elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    } elseif (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        error_log("Apache headers: " . print_r($requestHeaders, true));
        // Check for 'Authorization' or 'authorization'
        if (isset($requestHeaders['Authorization'])) {
            $authHeader = $requestHeaders['Authorization'];
        } elseif (isset($requestHeaders['authorization'])) {
            $authHeader = $requestHeaders['authorization'];
        }
    }
    
    error_log("Final authHeader: " . ($authHeader ?? 'NULL'));

    if ($authHeader) {
        $token = str_replace('Bearer ', '', $authHeader);
        // In a real app, you would verify the JWT or lookup the token in DB.
        // For this demo, we'll accept any non-empty token as "authorized"
        if (!empty($token)) {
            return true;
        }
    }

    // If neither, return unauthorized
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized access. Please provide a valid token."]);
    exit;
}
?>
