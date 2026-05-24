<?php
class Database {
    private $host = "localhost";
    private $db_name = "hotel_management";
    private $username = "root";
    private $password = "";
    public $conn;

    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->exec("set names utf8");
            // Set error mode to exception for defense-in-depth debugging (log errors, don't show to user in production)
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            // Disable emulated prepared statements for real SQL injection protection
            $this->conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
        } catch(PDOException $exception) {
            // Log error internally, don't leak database details to client
            error_log("Connection error: " . $exception->getMessage());
            http_response_code(500);
            echo json_encode(["message" => "Internal Server Error. Please try again later."]);
            exit;
        }

        return $this->conn;
    }
}
?>
