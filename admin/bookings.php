<?php
require_once 'includes/auth_check.php';
require_once '../api/config/db.php';

$database = new Database();
$db = $database->getConnection();

$message = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action']) && $_POST['action'] === 'update_status') {
        $stmt = $db->prepare("UPDATE bookings SET status = :status WHERE id = :id");
        $stmt->bindParam(':status', $_POST['status']);
        $stmt->bindParam(':id', $_POST['id']);
        if ($stmt->execute()) {
            $message = "Booking status updated.";
        }
    }
}

$bookings = $db->query("SELECT b.*, r.room_number, r.room_type FROM bookings b JOIN rooms r ON b.room_id = r.id ORDER BY b.created_at DESC")->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manage Bookings - Admin Portal</title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <div class="admin-layout">
        <?php include 'includes/sidebar.php'; ?>

        <main class="main-content">
            <header class="page-header">
                <h1>Manage Reservations</h1>
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
                                <th>Booking Date</th>
                                <th>Guest Info</th>
                                <th>Room Details</th>
                                <th>Duration</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach($bookings as $booking): ?>
                            <tr>
                                <td style="font-size: 0.875rem; color: var(--text-muted);">
                                    <?php echo date('M d, Y H:i', strtotime($booking['created_at'])); ?>
                                </td>
                                <td>
                                    <div style="font-weight: 600;"><?php echo $booking['guest_name']; ?></div>
                                    <div style="font-size: 0.75rem; color: var(--text-muted);"><?php echo $booking['guest_email']; ?></div>
                                </td>
                                <td>
                                    <div>Room #<?php echo $booking['room_number']; ?></div>
                                    <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: capitalize;"><?php echo $booking['room_type']; ?></div>
                                </td>
                                <td style="font-size: 0.875rem;">
                                    <?php echo date('M d', strtotime($booking['check_in'])); ?> - <?php echo date('M d, Y', strtotime($booking['check_out'])); ?>
                                </td>
                                <td style="font-weight: 700; color: var(--primary);">
                                    $<?php echo number_format($booking['total_price'], 2); ?>
                                </td>
                                <td>
                                    <span class="badge badge-<?php echo $booking['status'] === 'confirmed' ? 'green' : ($booking['status'] === 'pending' ? 'blue' : 'red'); ?>">
                                        <?php echo ucfirst($booking['status']); ?>
                                    </span>
                                </td>
                                <td>
                                    <form method="POST" style="display: flex; gap: 0.5rem;">
                                        <input type="hidden" name="action" value="update_status">
                                        <input type="hidden" name="id" value="<?php echo $booking['id']; ?>">
                                        <select name="status" class="form-control" style="padding: 0.25rem; font-size: 0.75rem; width: auto;" onchange="this.form.submit()">
                                            <option value="pending" <?php echo $booking['status'] === 'pending' ? 'selected' : ''; ?>>Pending</option>
                                            <option value="confirmed" <?php echo $booking['status'] === 'confirmed' ? 'selected' : ''; ?>>Confirmed</option>
                                            <option value="cancelled" <?php echo $booking['status'] === 'cancelled' ? 'selected' : ''; ?>>Cancelled</option>
                                        </select>
                                    </form>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                            <?php if(empty($bookings)): ?>
                            <tr>
                                <td colspan="7" style="text-align: center; padding: 3rem; color: var(--text-muted);">
                                    <i class="fas fa-calendar-times" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                                    No reservations found in the database.
                                </td>
                            </tr>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    </div>
</body>
</html>
