<?php
require_once '../config/db.php';
require_once '../middleware/headers.php';

$database = new Database();
$db = $database->getConnection();

$check_in = isset($_GET['check_in']) ? $_GET['check_in'] : null;
$check_out = isset($_GET['check_out']) ? $_GET['check_out'] : null;

if (!$check_in || !$check_out) {
    sendResponse(400, ["message" => "Please provide check_in and check_out dates."]);
}

try {
    // Select rooms that are manually set to 'available' AND do NOT have overlapping bookings
    $query = "SELECT r.id, r.room_number, r.status, c.category_name as room_type, 
                     c.price, c.capacity, c.image_url, c.amenities
              FROM rooms r 
              JOIN room_categories c ON r.category_id = c.id
              WHERE r.status = 'available'
              AND r.id NOT IN (
                SELECT b.room_id FROM bookings b 
                WHERE b.status != 'cancelled'
                AND (
                    (b.check_in < :check_out AND b.check_out > :check_in)
                )
              )
              ORDER BY r.room_number ASC";
              
    $stmt = $db->prepare($query);
    $stmt->bindParam(':check_in', $check_in);
    $stmt->bindParam(':check_out', $check_out);
    $stmt->execute();
    
    $rooms = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($rooms as &$room) {
        if (isset($room['amenities']) && is_string($room['amenities'])) {
            $room['amenities'] = json_decode($room['amenities']);
        }
    }
    
    sendResponse(200, $rooms);
} catch (Throwable $e) {
    error_log("Error in available.php: " . $e->getMessage());
    sendResponse(500, ["message" => "Database error: " . $e->getMessage()]);
}
?>

