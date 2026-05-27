<?php
require_once '../config/db.php';
require_once '../middleware/headers.php';

$database = new Database();
$db = $database->getConnection();

$email = isset($_GET['email']) ? $_GET['email'] : null;

if (!$email) {
    sendResponse(400, ["message" => "Email parameter is required."]);
}

try {
    // Join bookings with guests, rooms, and room_categories to fetch all booking details for the specific guest email
    $query = "SELECT b.id, b.check_in, b.check_out, b.total_price, b.status, b.created_at,
                     g.name as guest_name, g.email as guest_email, g.phone as guest_phone,
                     r.room_number, c.category_name as room_type
              FROM bookings b 
              JOIN guests g ON b.guest_id = g.id
              JOIN rooms r ON b.room_id = r.id 
              JOIN room_categories c ON r.category_id = c.id
              WHERE g.email = :email
              ORDER BY b.created_at DESC";
              
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email', $email);
    $stmt->execute();
    
    $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
    sendResponse(200, $bookings);
} catch (Throwable $e) {
    error_log("Error in bookings/track.php: " . $e->getMessage());
    sendResponse(500, [
        "message" => "Error tracking bookings: " . $e->getMessage()
    ]);
}
?>
