<?php
require_once 'api/config/db.php';
$database = new Database();
$db = $database->getConnection();

$username = 'admin';
$password = 'admin123';
$hash = password_hash($password, PASSWORD_DEFAULT);

$query = "UPDATE admins SET password_hash = :hash WHERE username = :username";
$stmt = $db->prepare($query);
$stmt->bindParam(':hash', $hash);
$stmt->bindParam(':username', $username);

if($stmt->execute()) {
    echo "Password updated successfully for $username\n";
    echo "New hash: $hash\n";
} else {
    echo "Failed to update password.\n";
}
?>
