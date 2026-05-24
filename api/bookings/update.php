<?php
require_once '../config/db.php';
require_once '../middleware/headers.php';
require_once '../middleware/auth.php';

// Secure endpoint
checkAuth();

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id) && !empty($data->status)) {
    try {
        $query = "UPDATE bookings SET status = :status WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':status', $data->status);
        $stmt->bindParam(':id', $data->id);
        
        if ($stmt->execute()) {
            sendResponse(200, ["message" => "Booking updated successfully."]);
        } else {
            sendResponse(500, ["message" => "Unable to update booking."]);
        }
    } catch (Throwable $e) {
        error_log("Error in update.php (bookings): " . $e->getMessage());
        sendResponse(500, ["message" => "Database error: " . $e->getMessage()]);
    }
} else {
    sendResponse(400, ["message" => "Missing booking ID or status."]);
}
?>
