# Backend API & Security Implementation Plan

## 1. API Architecture & Approach
The backend is structured as a modular RESTful API built with PHP, emphasizing a clear **Separation of Concerns (SoC)** to ensure maintainability and security.

### 1.1 File Organization
The project follows a directory-based routing and logic structure:
- **`api/config/`**: Contains core configuration files, specifically `db.php` for establishing a centralized PDO connection. This ensures that database credentials and connection logic are isolated from business logic.
- **`api/middleware/`**: Contains scripts that execute before the main endpoint logic.
    - `headers.php`: Manages global HTTP headers (CORS, Security, Content-Type).
    - `auth.php`: Handles session validation and access control for protected routes.
- **`api/[module]/`**: Categorized endpoints for specific features (e.g., `auth/`, `rooms/`, `bookings/`). Each file in these directories acts as a single API endpoint (e.g., `login.php`, `get_rooms.php`), making the routing predictable and easy to debug.

### 1.2 Serving as an API
PHP is configured to serve JSON exclusively. Every request is processed through the middleware layer to ensure headers are set correctly before any data is outputted.

---

## 2. Cross-Origin Resource Sharing (CORS) Strategy
During development, the frontend (typically running on Vite/React at port 5173) and the backend (XAMPP at port 80) run on different origins.

### 2.1 Implementation Strategy
In `api/middleware/headers.php`, we implement a dynamic CORS policy:
- **`Access-Control-Allow-Origin`**: Explicitly set to the frontend's URL (e.g., `http://localhost:5173`) rather than a wildcard `*` to maintain security.
- **`Access-Control-Allow-Methods`**: Restricted to necessary verbs: `GET, POST, OPTIONS`.
- **`Access-Control-Allow-Headers`**: Permits specific headers like `Content-Type` and `Authorization`.
- **Preflight Handling**: The system explicitly handles `OPTIONS` requests, returning a `200 OK` status before the actual request is processed.

---

## 3. Threat Mitigation Strategy

### 3.1 SQL Injection (SQLi) Defense
To defend against SQL injection, the system strictly forbids the use of raw query strings with user input.
- **Approach**: All database interactions utilize **PDO (PHP Data Objects)** with **Prepared Statements**.
- **Execution**: User inputs are never concatenated directly into SQL strings. Instead, named placeholders (e.g., `:id`, `:status`) are used. The database engine compiles the query structure first, and then user data is bound to these placeholders, ensuring data cannot be interpreted as executable SQL commands.

### 3.2 XSS & Content Sniffing Prevention
While the backend primary serves JSON, browsers can sometimes "sniff" content and misinterpret it as HTML or Scripting if headers are missing.
- **Content-Type Enforcement**: Every API response is strictly served with `header('Content-Type: application/json; charset=UTF-8');`.
- **X-Content-Type-Options**: We set the `X-Content-Type-Options: nosniff` header. This prevents modern browsers from ignoring the declared `Content-Type` and attempting to execute the response as something else.
- **XSS Mitigation**: 
    - Input is sanitized using `filter_var()` and `htmlspecialchars()` before being processed or stored.
    - By using `application/json`, the browser does not parse the content as an HTML document, significantly reducing the risk of Reflected XSS.

### 3.3 Additional Security Headers
- **`X-Frame-Options: DENY`**: Prevents clickjacking by ensuring the API cannot be embedded in frames/iframes.
- **`Strict-Transport-Security`**: (Planned for Production) Enforces HTTPS communication.

---

## 4. Database Schema Reference
The system utilizes the `hotel_management` database with the following primary tables:
- **`admins`**: Stores administrative credentials (hashed) and metadata.
- **`rooms`**: Tracks room types, pricing, and live availability status.
- **`bookings`**: Records guest details, check-in/out dates, and payment status.

## 5. Secure PHP API Code Snippets

The following snippets demonstrate the actual implementation of security principles in the PHP backend.

### 5.1 Secure Headers (Defense-in-Depth)
Included at the top of every API endpoint to protect against common web attacks.

```php
// Location: api/middleware/headers.php

// 1. Force JSON response
header("Content-Type: application/json; charset=UTF-8");

// 2. Prevent MIME-type sniffing (Defense against malformed uploads/responses)
header("X-Content-Type-Options: nosniff");

// 3. Prevent Clickjacking (Restrict embedding in frames/iframes)
header("X-Frame-Options: DENY");

// 4. Strict Transport Security (HSTS) - Enforce HTTPS communication
if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') {
    header("Strict-Transport-Security: max-age=31536000; includeSubDomains");
}
```

### 5.2 Secure Database Connection (PDO)
Utilizing PHP Data Objects with strict error handling.

```php
// Location: api/config/db.php

class Database {
    private $host = "localhost";
    private $db_name = "hotel_management";
    private $username = "root";
    private $password = "";
    public $conn;

    public function getConnection() {
        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            
            // Set error mode to exception (Strict Error Handling)
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            // Disable emulated prepared statements (Real SQLi protection)
            $this->conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
            
        } catch(PDOException $exception) {
            // Log internally, show generic error to user
            error_log("Connection error: " . $exception->getMessage());
            die(json_encode(["message" => "Database connection failed."]));
        }
        return $this->conn;
    }
}
```

### 5.3 Prepared Statements & Input Handling (3NF Implementation)
Example of reading JSON payloads and using JOINs or Transactions to maintain 3rd Normal Form integrity.

**Room Retrieval (with Category JOIN):**
```php
// Location: api/rooms/read.php
$query = "SELECT r.id, r.room_number, r.status, c.category_name as room_type, 
                 c.price, c.capacity, c.image_url, c.amenities
          FROM rooms r 
          JOIN room_categories c ON r.category_id = c.id
          WHERE r.id = :id";

$stmt = $db->prepare($query);
$stmt->bindValue(':id', $id, PDO::PARAM_INT);
$stmt->execute();
```

**Booking Creation (Transaction with Guest check):**
```php
// Location: api/bookings/create.php
$db->beginTransaction();

// 1. Check if guest exists (by email) or create new
$guestQuery = "SELECT id FROM guests WHERE email = :email LIMIT 1";
$guestStmt = $db->prepare($guestQuery);
$guestStmt->execute([':email' => $data->guest_email]);
$guest = $guestStmt->fetch();

$guest_id = $guest ? $guest['id'] : null;

if (!$guest_id) {
    $ins = $db->prepare("INSERT INTO guests (name, email) VALUES (?, ?)");
    $ins->execute([$data->guest_name, $data->guest_email]);
    $guest_id = $db->lastInsertId();
}

// 2. Create booking using guest_id
$stmt = $db->prepare("INSERT INTO bookings (room_id, guest_id, check_in, check_out, total_price) 
                      VALUES (:rid, :gid, :cin, :cout, :price)");
$stmt->execute([
    ':rid' => $data->room_id,
    ':gid' => $guest_id,
    ':cin' => $data->check_in,
    ':cout' => $data->check_out,
    ':price' => $data->total_price
]);

$db->commit();
```


### 5.4 Password Management (Registration & Verification)
Implementing standard hashing algorithms for credential security.

```php
// Registration Example (Creating an admin)
$password = "admin123";
$hashed_password = password_hash($password, PASSWORD_BCRYPT); // Secure Hashing

// Login Example (Verification)
if (password_verify($input_password, $stored_hash)) {
    // Authentication successful
} else {
    // Authentication failed
}
```
