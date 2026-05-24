<?php
require_once '../config/db.php';
require_once '../middleware/headers.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id)) {
    try {
        // 1. Resolve room_type to category_id
        $category_id = null;
        if (!empty($data->room_type)) {
            $catQuery = "SELECT id FROM room_categories WHERE category_name = :room_type LIMIT 1";
            $catStmt = $db->prepare($catQuery);
            $catStmt->bindValue(':room_type', $data->room_type);
            $catStmt->execute();
            $category = $catStmt->fetch(PDO::FETCH_ASSOC);
            if (!$category) {
                sendResponse(400, ["message" => "Invalid room type."]);
            }
            $category_id = $category['id'];
        }

        // 2. Check if new room number is already taken
        if (!empty($data->room_number)) {
            $checkQuery = "SELECT id FROM rooms WHERE room_number = :room_number AND id != :id";
            $checkStmt = $db->prepare($checkQuery);
            $checkStmt->bindParam(':room_number', $data->room_number);
            $checkStmt->bindParam(':id', $data->id);
            $checkStmt->execute();
            if ($checkStmt->rowCount() > 0) {
                sendResponse(400, ["message" => "Room number already exists."]);
            }
        }

        // 3. Construct update query
        $query = "UPDATE rooms SET 
                    category_id = COALESCE(:category_id, category_id), 
                    room_number = COALESCE(:room_number, room_number), 
                    status = COALESCE(:status, status),
                    amenities = :amenities
                  WHERE id = :id";
        
        $stmt = $db->prepare($query);
        $amenities = !empty($data->amenities) ? json_encode($data->amenities) : null;
        
        $stmt->bindParam(':category_id', $category_id);
        $stmt->bindParam(':room_number', $data->room_number);
        $stmt->bindParam(':status', $data->status);
        $stmt->bindParam(':amenities', $amenities);
        $stmt->bindParam(':id', $data->id);
        
        if ($stmt->execute()) {
            sendResponse(200, ["message" => "Room updated successfully."]);
        } else {
            sendResponse(500, ["message" => "Unable to update room."]);
        }
    } catch (Throwable $e) {
        error_log("Error in update.php: " . $e->getMessage());
        sendResponse(500, ["message" => "Database error: " . $e->getMessage()]);
    }
} else {
    sendResponse(400, ["message" => "Missing room ID."]);
}
?>

