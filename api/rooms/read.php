<?php
require_once '../config/db.php';
require_once '../middleware/headers.php';

$database = new Database();
$db = $database->getConnection();

// Get ID if provided
$id = isset($_GET['id']) ? $_GET['id'] : null;

date_default_timezone_set('Asia/Manila');
$today = date('Y-m-d');

try {
    if ($id) {
        $query = "SELECT r.id, r.room_number, r.status, c.category_name as room_type, 
                         c.price, c.capacity, c.image_url, COALESCE(r.amenities, c.amenities) as amenities,
                  (SELECT COUNT(*) FROM bookings b 
                   WHERE b.room_id = r.id 
                   AND b.status IN ('confirmed', 'pending') 
                   AND :today1 >= b.check_in 
                   AND :today2 < b.check_out) as is_occupied,
                  (SELECT COUNT(*) FROM bookings b 
                   WHERE b.room_id = r.id 
                   AND b.status = 'confirmed' 
                   AND :today3 >= b.check_in 
                   AND :today4 < b.check_out) as is_paid_occupied
                  FROM rooms r 
                  JOIN room_categories c ON r.category_id = c.id
                  WHERE r.id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->bindValue(':today1', $today, PDO::PARAM_STR);
        $stmt->bindValue(':today2', $today, PDO::PARAM_STR);
        $stmt->bindValue(':today3', $today, PDO::PARAM_STR);
        $stmt->bindValue(':today4', $today, PDO::PARAM_STR);
        $stmt->execute();
        
        $room = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($room) {
            if (isset($room['amenities'])) {
                if (is_string($room['amenities'])) {
                    $room['amenities'] = json_decode($room['amenities']) ?: [];
                }
            } else {
                $room['amenities'] = [];
            }
            
            $room['is_reserved'] = (intval($room['is_occupied']) > 0);
            $room['is_paid_occupied'] = (intval($room['is_paid_occupied']) > 0);
            unset($room['is_occupied']);
            sendResponse(200, $room);
        } else {
            sendResponse(404, ["message" => "Room not found."]);
        }
    } else {
        $query = "SELECT r.id, r.room_number, r.status, c.category_name as room_type, 
                         c.price, c.capacity, c.image_url, COALESCE(r.amenities, c.amenities) as amenities,
                  (SELECT COUNT(*) FROM bookings b 
                   WHERE b.room_id = r.id 
                   AND b.status IN ('confirmed', 'pending') 
                   AND :today1 >= b.check_in 
                   AND :today2 < b.check_out) as is_occupied,
                  (SELECT COUNT(*) FROM bookings b 
                   WHERE b.room_id = r.id 
                   AND b.status = 'confirmed' 
                   AND :today3 >= b.check_in 
                   AND :today4 < b.check_out) as is_paid_occupied
                  FROM rooms r 
                  JOIN room_categories c ON r.category_id = c.id
                  ORDER BY r.room_number ASC";
        $stmt = $db->prepare($query);
        $stmt->bindValue(':today1', $today, PDO::PARAM_STR);
        $stmt->bindValue(':today2', $today, PDO::PARAM_STR);
        $stmt->bindValue(':today3', $today, PDO::PARAM_STR);
        $stmt->bindValue(':today4', $today, PDO::PARAM_STR);
        $stmt->execute();
        
        $rooms = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($rooms as &$room) {
            if (isset($room['amenities'])) {
                if (is_string($room['amenities'])) {
                    $room['amenities'] = json_decode($room['amenities']) ?: [];
                }
            } else {
                $room['amenities'] = [];
            }

            $room['is_reserved'] = (intval($room['is_occupied']) > 0);
            $room['is_paid_occupied'] = (intval($room['is_paid_occupied']) > 0);
            unset($room['is_occupied']);
        }
        
        sendResponse(200, $rooms);
    }
} catch (Throwable $e) {
    error_log("CRITICAL ERROR in read.php: " . $e->getMessage() . "\n" . $e->getTraceAsString());
    sendResponse(500, [
        "message" => "Server Error: " . $e->getMessage()
    ]);
}
?>

