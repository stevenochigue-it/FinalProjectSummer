<?php
require_once 'api/config/db.php';
$db = (new Database())->getConnection();
$hash = '$2y$10$RbPpOwWHBMZRptNixsIgoOYZLAHGPlV/vrIUdzlrBHRYl8QpNu0ti';
$sql = "UPDATE admins SET password_hash = :hash WHERE username = 'admin'";
$stmt = $db->prepare($sql);
if ($stmt->execute([':hash' => $hash])) {
    echo "Successfully updated admin password hash.";
} else {
    echo "Failed to update admin password hash.";
}
?>
