<?php
require_once '../config/db.php';
require_once '../middleware/headers.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (
    !empty($data->room_id) &&
    !empty($data->guest_name) &&
    !empty($data->guest_email) &&
    !empty($data->check_in) &&
    !empty($data->check_out) &&
    !empty($data->total_price)
) {
    try {
        $db->beginTransaction();

        // 1. Check for overlapping bookings
        $overlapQuery = "SELECT COUNT(*) as count FROM bookings 
                         WHERE room_id = :room_id 
                         AND status != 'cancelled'
                         AND (
                            (check_in < :check_out AND check_out > :check_in)
                         )";
        $overlapStmt = $db->prepare($overlapQuery);
        $overlapStmt->bindParam(':room_id', $data->room_id);
        $overlapStmt->bindParam(':check_in', $data->check_in);
        $overlapStmt->bindParam(':check_out', $data->check_out);
        $overlapStmt->execute();
        $overlap = $overlapStmt->fetch(PDO::FETCH_ASSOC);

        if ($overlap['count'] > 0) {
            $db->rollBack();
            sendResponse(400, ["message" => "This room is already reserved for the selected dates."]);
        }

        // 2. Check room availability status
        $checkQuery = "SELECT status FROM rooms WHERE id = :room_id";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(':room_id', $data->room_id);
        $checkStmt->execute();
        $room = $checkStmt->fetch(PDO::FETCH_ASSOC);

        if (!$room || $room['status'] !== 'available') {
            $db->rollBack();
            sendResponse(400, ["message" => "This room is currently unavailable for booking."]);
        }

        // 3. Handle Guest (3NF: Check if guest exists or create new)
        $guestQuery = "SELECT id FROM guests WHERE email = :email LIMIT 1";
        $guestStmt = $db->prepare($guestQuery);
        $guestStmt->bindParam(':email', $data->guest_email);
        $guestStmt->execute();
        $existingGuest = $guestStmt->fetch(PDO::FETCH_ASSOC);

        if ($existingGuest) {
            $guest_id = $existingGuest['id'];
        } else {
            $createGuestQuery = "INSERT INTO guests (name, email) VALUES (:name, :email)";
            $createGuestStmt = $db->prepare($createGuestQuery);
            $createGuestStmt->bindParam(':name', $data->guest_name);
            $createGuestStmt->bindParam(':email', $data->guest_email);
            $createGuestStmt->execute();
            $guest_id = $db->lastInsertId();
        }

        // 4. Create the booking referencing the guest_id
        $query = "INSERT INTO bookings SET 
                    room_id = :room_id, 
                    guest_id = :guest_id, 
                    check_in = :check_in, 
                    check_out = :check_out, 
                    total_price = :total_price, 
                    status = 'pending'";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':room_id', $data->room_id);
        $stmt->bindParam(':guest_id', $guest_id);
        $stmt->bindParam(':check_in', $data->check_in);
        $stmt->bindParam(':check_out', $data->check_out);
        $stmt->bindParam(':total_price', $data->total_price);
        
        if ($stmt->execute()) {
            $booking_id = $db->lastInsertId();
            $db->commit();
            sendResponse(201, ["message" => "Booking successful.", "id" => $booking_id]);
        } else {
            $db->rollBack();
            sendResponse(500, ["message" => "Unable to create booking."]);
        }
    } catch (Throwable $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        error_log("Error creating booking: " . $e->getMessage());
        sendResponse(500, ["message" => "Database error: " . $e->getMessage()]);
    }
} else {
    sendResponse(400, ["message" => "Incomplete booking data."]);
}
?>

