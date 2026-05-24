<?php
require_once '../config/db.php';
require_once '../middleware/headers.php';
require_once '../middleware/auth.php';

// Robust Authorization check
$authHeader = null;
if (isset($_SERVER['Authorization'])) {
    $authHeader = $_SERVER['Authorization'];
} elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
} elseif (function_exists('apache_request_headers')) {
    $requestHeaders = apache_request_headers();
    if (isset($requestHeaders['Authorization'])) {
        $authHeader = $requestHeaders['Authorization'];
    } elseif (isset($requestHeaders['authorization'])) {
        $authHeader = $requestHeaders['authorization'];
    }
}

if (!$authHeader) {
    sendResponse(401, ["message" => "Unauthorized access."]);
}

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id)) {
    try {
        $query = "DELETE FROM rooms WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $data->id);
        
        if ($stmt->execute()) {
            sendResponse(200, ["message" => "Room deleted successfully."]);
        } else {
            sendResponse(500, ["message" => "Unable to delete room."]);
        }
    } catch (Throwable $e) {
        error_log("Error in delete.php: " . $e->getMessage());
        sendResponse(500, ["message" => "Database error: " . $e->getMessage()]);
    }
} else {
    sendResponse(400, ["message" => "Missing room ID."]);
}
?>
