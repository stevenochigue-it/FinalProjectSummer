<?php
require_once '../config/db.php';
require_once '../middleware/headers.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id)) {
    try {
        // Find current status to ensure the booking exists
        $checkQuery = "SELECT status FROM bookings WHERE id = :id";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindValue(':id', $data->id, PDO::PARAM_INT);
        $checkStmt->execute();
        $booking = $checkStmt->fetch(PDO::FETCH_ASSOC);

        if (!$booking) {
            sendResponse(404, ["message" => "Booking not found."]);
        }

        // Update status to confirmed (paid)
        $query = "UPDATE bookings SET status = 'confirmed' WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindValue(':id', $data->id, PDO::PARAM_INT);
        
        if ($stmt->execute()) {
            sendResponse(200, ["message" => "Booking payment confirmed successfully."]);
        } else {
            sendResponse(500, ["message" => "Unable to confirm payment."]);
        }
    } catch (Throwable $e) {
        error_log("Error in pay.php: " . $e->getMessage());
        sendResponse(500, ["message" => "Database error: " . $e->getMessage()]);
    }
} else {
    sendResponse(400, ["message" => "Missing booking ID."]);
}
?>
