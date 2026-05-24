<?php
require_once '../config/db.php';
require_once '../middleware/headers.php';
require_once '../middleware/auth.php';

// Secure endpoint
checkAuth();

$database = new Database();
$db = $database->getConnection();

try {
    // 3NF Update: Join with guests and room_categories to get all details
    $query = "SELECT b.id, b.check_in, b.check_out, b.total_price, b.status, b.created_at,
                     g.name as guest_name, g.email as guest_email, g.phone as guest_phone,
                     r.room_number, c.category_name as room_type
              FROM bookings b 
              JOIN guests g ON b.guest_id = g.id
              JOIN rooms r ON b.room_id = r.id 
              JOIN room_categories c ON r.category_id = c.id
              ORDER BY b.created_at DESC";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
    sendResponse(200, $bookings);
} catch (Throwable $e) {
    error_log("Error in bookings/list.php: " . $e->getMessage());
    sendResponse(500, [
        "message" => "Error fetching bookings: " . $e->getMessage()
    ]);
}
?>

