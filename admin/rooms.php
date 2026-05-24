<?php
require_once 'includes/auth_check.php';
require_once '../api/config/db.php';

$database = new Database();
$db = $database->getConnection();

$message = '';
$error = '';

// Handle Form Submissions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action'])) {
        if ($_POST['action'] === 'add' || $_POST['action'] === 'edit') {
            $room_type = $_POST['room_type'];
            $room_number = $_POST['room_number'];
            $price = $_POST['price'];
            $capacity = $_POST['capacity'];
            $status = $_POST['status'];
            $image_url = $_POST['image_url'];
            $amenities = json_encode(array_map('trim', explode(',', $_POST['amenities'])));
            
            if ($_POST['action'] === 'add') {
                $query = "INSERT INTO rooms (room_type, room_number, price, capacity, status, image_url, amenities) VALUES (:type, :number, :price, :capacity, :status, :image_url, :amenities)";
                $stmt = $db->prepare($query);
            } else {
                $query = "UPDATE rooms SET room_type = :type, room_number = :number, price = :price, capacity = :capacity, status = :status, image_url = :image_url, amenities = :amenities WHERE id = :id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':id', $_POST['id']);
            }
            
            $stmt->bindParam(':type', $room_type);
            $stmt->bindParam(':number', $room_number);
            $stmt->bindParam(':price', $price);
            $stmt->bindParam(':capacity', $capacity);
            $stmt->bindParam(':status', $status);
            $stmt->bindParam(':image_url', $image_url);
            $stmt->bindParam(':amenities', $amenities);
            
            if ($stmt->execute()) {
                $message = "Room saved successfully.";
            } else {
                $error = "Failed to save room.";
            }
        } elseif ($_POST['action'] === 'delete') {
            $stmt = $db->prepare("DELETE FROM rooms WHERE id = :id");
            $stmt->bindParam(':id', $_POST['id']);
            if ($stmt->execute()) {
                $message = "Room deleted.";
            }
        }
    }
}

$rooms = $db->query("SELECT * FROM rooms ORDER BY room_number ASC")->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manage Rooms - Admin Portal</title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        .modal {
            display: none;
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8);
            justify-content: center; align-items: center;
            z-index: 1000;
        }
        .modal-content {
            background: var(--card-bg);
            padding: 2rem;
            border-radius: 1rem;
            width: 100%;
            max-width: 500px;
            border: 1px solid var(--border);
        }
    </style>
</head>
<body>
    <div class="admin-layout">
        <?php include 'includes/sidebar.php'; ?>

        <main class="main-content">
            <header class="page-header">
                <h1>Manage Rooms</h1>
                <button onclick="showAddModal()" class="btn-primary" style="width: auto; padding: 0.6rem 1.2rem;">
                    <i class="fas fa-plus"></i> Add New Room
                </button>
            </header>

            <?php if ($message): ?>
                <div style="background: rgba(16, 185, 129, 0.1); color: var(--accent-green); padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem; border: 1px solid rgba(16, 185, 129, 0.2);">
                    <?php echo $message; ?>
                </div>
            <?php endif; ?>

            <div class="card">
                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Type</th>
                                <th>Capacity</th>
                                <th>Price</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach($rooms as $room): ?>
                            <tr>
                                <td><strong><?php echo $room['room_number']; ?></strong></td>
                                <td style="text-transform: capitalize;"><?php echo $room['room_type']; ?></td>
                                <td><?php echo $room['capacity']; ?></td>
                                <td>$<?php echo number_format($room['price'], 2); ?></td>
                                <td>
                                    <span class="badge badge-<?php echo $room['status'] === 'available' ? 'green' : ($room['status'] === 'occupied' ? 'red' : 'blue'); ?>">
                                        <?php echo ucfirst($room['status']); ?>
                                    </span>
                                </td>
                                <td>
                                    <button onclick='editRoom(<?php echo json_encode($room); ?>)' class="action-btn"><i class="fas fa-edit"></i></button>
                                    <form method="POST" style="display:inline;" onsubmit="return confirm('Delete this room?')">
                                        <input type="hidden" name="action" value="delete">
                                        <input type="hidden" name="id" value="<?php echo $room['id']; ?>">
                                        <button type="submit" class="action-btn" style="color: var(--accent-red);"><i class="fas fa-trash"></i></button>
                                    </form>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    </div>

    <!-- Add/Edit Modal -->
    <div id="roomModal" class="modal">
        <div class="modal-content">
            <h2 id="modalTitle" style="margin-bottom: 1.5rem;">Add Room</h2>
            <form method="POST">
                <input type="hidden" name="action" id="formAction" value="add">
                <input type="hidden" name="id" id="roomId">
                
                <div class="form-group">
                    <label>Room Number</label>
                    <input type="number" name="room_number" id="roomNumber" class="form-control" required>
                </div>
                
                <div class="form-group">
                    <label>Room Type</label>
                    <select name="room_type" id="roomType" class="form-control" required>
                        <option value="standard">Standard</option>
                        <option value="deluxe">Deluxe</option>
                        <option value="sweet">Sweet</option>
                        <option value="executive">Executive</option>
                        <option value="family">Family</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Price per Night ($)</label>
                    <input type="number" step="0.01" name="price" id="roomPrice" class="form-control" required>
                </div>

                <div class="form-group">
                    <label>Capacity</label>
                    <input type="text" name="capacity" id="roomCapacity" class="form-control" placeholder="e.g. 2 guests" required>
                </div>

                <div class="form-group">
                    <label>Image URL</label>
                    <input type="url" name="image_url" id="roomImage" class="form-control" placeholder="https://images.unsplash.com/...">
                </div>

                <div class="form-group">
                    <label>Amenities (Comma separated)</label>
                    <input type="text" name="amenities" id="roomAmenities" class="form-control" placeholder="Free WiFi, TV, AC">
                </div>

                <div class="form-group">
                    <label>Status</label>
                    <select name="status" id="roomStatus" class="form-control">
                        <option value="available">Available</option>
                        <option value="occupied">Occupied</option>
                        <option value="maintenance">Maintenance</option>
                    </select>
                </div>

                <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                    <button type="submit" class="btn-primary">Save Room</button>
                    <button type="button" onclick="closeModal()" class="btn-primary" style="background: var(--border);">Cancel</button>
                </div>
            </form>
        </div>
    </div>

    <script>
        function showAddModal() {
            document.getElementById('modalTitle').innerText = 'Add Room';
            document.getElementById('formAction').value = 'add';
            document.getElementById('roomId').value = '';
            document.getElementById('roomNumber').value = '';
            document.getElementById('roomPrice').value = '';
            document.getElementById('roomCapacity').value = '';
            document.getElementById('roomImage').value = '';
            document.getElementById('roomAmenities').value = '';
            document.getElementById('roomModal').style.display = 'flex';
        }

        function closeModal() {
            document.getElementById('roomModal').style.display = 'none';
        }

        function editRoom(room) {
            document.getElementById('modalTitle').innerText = 'Edit Room ' + room.room_number;
            document.getElementById('formAction').value = 'edit';
            document.getElementById('roomId').value = room.id;
            document.getElementById('roomNumber').value = room.room_number;
            document.getElementById('roomType').value = room.room_type;
            document.getElementById('roomPrice').value = room.price;
            document.getElementById('roomCapacity').value = room.capacity;
            document.getElementById('roomStatus').value = room.status;
            document.getElementById('roomImage').value = room.image_url || '';
            
            // Handle amenities (JSON to comma separated string)
            let amenitiesArr = [];
            try {
                amenitiesArr = JSON.parse(room.amenities) || [];
            } catch(e) {
                amenitiesArr = [];
            }
            document.getElementById('roomAmenities').value = amenitiesArr.join(', ');
            
            document.getElementById('roomModal').style.display = 'flex';
        }
    </script>
</body>
</html>
