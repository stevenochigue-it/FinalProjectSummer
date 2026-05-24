<?php
/**
 * Database Setup Script
 * Run this script to initialize the database and tables.
 */

$host = "localhost";
$username = "root";
$password = "";
$db_name = "hotel_management";

try {
    $pdo = new PDO("mysql:host=$host", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Create Database
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$db_name` CHARACTER SET utf8 COLLATE utf8_general_ci");
    echo "Database created or already exists.<br>";

    $pdo->exec("USE `$db_name` ");

    // Get schema file
    $sql = file_get_contents('../database/schema.sql');
    
    // Execute schema
    $pdo->exec($sql);
    echo "Tables created and initial data inserted successfully.<br>";
    echo "<strong>Admin Credentials:</strong> admin / admin123<br>";

} catch (PDOException $e) {
    die("Error during setup: " . $e->getMessage());
}
?>
