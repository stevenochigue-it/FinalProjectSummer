<?php
require_once '../config/db.php';
require_once '../middleware/headers.php';

$database = new Database();
$db = $database->getConnection();

// Get posted data
$data = json_decode(file_get_contents("php://input"));

if (!empty($data->username) && !empty($data->password)) {
    
    $query = "SELECT id, username, password_hash FROM admins WHERE username = :username LIMIT 0,1";
    $stmt = $db->prepare($query);
    
    // Bind parameter (PDO handles escaping)
    $stmt->bindParam(':username', $data->username);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Verify password hash
        if (password_verify($data->password, $row['password_hash'])) {
            
            // In a real app, generate a JWT. For this "Simple" admin, we'll return a simple success.
            // We'll also return a mock token for the frontend to store.
            $token = base64_encode(bin2hex(random_bytes(32)));
            
            sendResponse(200, [
                "message" => "Login successful.",
                "token" => $token,
                "user" => [
                    "id" => $row['id'],
                    "username" => $row['username']
                ]
            ]);
        } else {
            sendResponse(401, ["message" => "Invalid credentials."]);
        }
    } else {
        sendResponse(401, ["message" => "Invalid credentials."]);
    }
} else {
    sendResponse(400, ["message" => "Incomplete data."]);
}
?>
