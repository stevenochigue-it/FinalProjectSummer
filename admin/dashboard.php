<?php
require_once 'includes/auth_check.php';
require_once '../api/config/db.php';

$database = new Database();
$db = $database->getConnection();

// Fetch stats
$totalRooms = $db->query("SELECT COUNT(*) FROM rooms")->fetchColumn();
$availableRooms = $db->query("SELECT COUNT(*) FROM rooms WHERE status = 'available'")->fetchColumn();
$totalBookings = $db->query("SELECT COUNT(*) FROM bookings")->fetchColumn();
$totalRevenue = $db->query("SELECT SUM(total_price) FROM bookings WHERE status = 'confirmed'")->fetchColumn() ?: 0;
$occupancyRate = $totalRooms > 0 ? round(($db->query("SELECT COUNT(*) FROM rooms WHERE status = 'occupied'")->fetchColumn() / $totalRooms) * 100, 1) : 0;

$recentBookings = $db->query("SELECT b.*, r.room_number FROM bookings b JOIN rooms r ON b.room_id = r.id ORDER BY b.created_at DESC LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Admin Portal</title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <div class="admin-layout">
        <?php include 'includes/sidebar.php'; ?>

        <main class="main-content">
            <header class="page-header">
                <h1>Dashboard Overview</h1>
                <div class="user-info">
                    <span style="color: var(--text-muted);">Welcome,</span> <strong><?php echo $_SESSION['admin_user']; ?></strong>
                </div>
            </header>

            <div class="stats-grid">
                <div class="stat-card">
                    <h3>Total Rooms</h3>
                    <div class="value"><?php echo $totalRooms; ?></div>
                </div>
                <div class="stat-card">
                    <h3>Available</h3>
                    <div class="value" style="color: var(--accent-green);"><?php echo $availableRooms; ?></div>
                </div>
                <div class="stat-card">
                    <h3>Bookings</h3>
                    <div class="value" style="color: var(--accent-blue);"><?php echo $totalBookings; ?></div>
                </div>
                <div class="stat-card">
                    <h3>Revenue</h3>
                    <div class="value" style="color: var(--primary);">$<?php echo number_format($totalRevenue, 2); ?></div>
                </div>
                <div class="stat-card">
                    <h3>Occupancy</h3>
                    <div class="value" style="color: #f59e0b;"><?php echo $occupancyRate; ?>%</div>
                </div>
            </div>

            <div class="card">
                <div style="padding: 1.5rem; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
                    <h2 style="font-size: 1.25rem;">Recent Bookings</h2>
                    <a href="bookings.php" style="color: var(--primary); text-decoration: none; font-size: 0.875rem;">View All</a>
                </div>
                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Guest</th>
                                <th>Room</th>
                                <th>Check In</th>
                                <th>Check Out</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach($recentBookings as $booking): ?>
                            <tr>
                                <td>
                                    <div style="font-weight: 500;"><?php echo $booking['guest_name']; ?></div>
                                    <div style="font-size: 0.75rem; color: var(--text-muted);"><?php echo $booking['guest_email']; ?></div>
                                </td>
                                <td>Room #<?php echo $booking['room_number']; ?></td>
                                <td><?php echo date('M d, Y', strtotime($booking['check_in'])); ?></td>
                                <td><?php echo date('M d, Y', strtotime($booking['check_out'])); ?></td>
                                <td>
                                    <span class="badge badge-<?php echo $booking['status'] === 'confirmed' ? 'green' : ($booking['status'] === 'pending' ? 'blue' : 'red'); ?>">
                                        <?php echo ucfirst($booking['status']); ?>
                                    </span>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                            <?php if(empty($recentBookings)): ?>
                            <tr>
                                <td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-muted);">No recent bookings found.</td>
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
