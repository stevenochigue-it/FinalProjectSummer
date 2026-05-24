<?php
require_once '../config/db.php';
require_once '../middleware/headers.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (
    !empty($data->room_type) &&
    !empty($data->room_number)
) {
    try {
        // 1. Resolve room_type to category_id
        $catQuery = "SELECT id FROM room_categories WHERE category_name = :room_type LIMIT 1";
        $catStmt = $db->prepare($catQuery);
        $catStmt->bindValue(':room_type', $data->room_type);
        $catStmt->execute();
        $category = $catStmt->fetch(PDO::FETCH_ASSOC);

        if (!$category) {
            sendResponse(400, ["message" => "Invalid room type: " . $data->room_type]);
        }
        $category_id = $category['id'];

        // 2. Check if room number already exists
        $checkQuery = "SELECT id FROM rooms WHERE room_number = :room_number";
        $checkStmt = $db->prepare($checkQuery);
        $room_num = intval($data->room_number);
        $checkStmt->bindParam(':room_number', $room_num);
        $checkStmt->execute();

        if ($checkStmt->rowCount() > 0) {
            sendResponse(400, ["message" => "Room number " . $room_num . " already exists."]);
        }

        $query = "INSERT INTO rooms SET 
                    category_id = :category_id, 
                    room_number = :room_number, 
                    status = :status,
                    amenities = :amenities";
        
        $stmt = $db->prepare($query);
        $status = !empty($data->status) ? htmlspecialchars(strip_tags($data->status)) : 'available';
        $amenities = !empty($data->amenities) ? json_encode($data->amenities) : null;
        
        $stmt->bindParam(':category_id', $category_id);
        $stmt->bindParam(':room_number', $room_num);
        $stmt->bindParam(':status', $status);
        $stmt->bindParam(':amenities', $amenities);
        
        if ($stmt->execute()) {
            sendResponse(201, ["message" => "Room created successfully.", "id" => $db->lastInsertId()]);
        } else {
            sendResponse(500, ["message" => "Unable to create room."]);
        }
    } catch (PDOException $e) {
        sendResponse(500, ["message" => "Database error: " . $e->getMessage()]);
    }
} else {
    sendResponse(400, ["message" => "Incomplete data. Room type and number are required."]);
}
?>

