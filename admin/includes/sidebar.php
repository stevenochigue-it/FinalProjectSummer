<?php
$current_page = basename($_SERVER['PHP_SELF']);
?>
<aside class="sidebar">
    <a href="dashboard.php" class="sidebar-brand">HotelAdmin</a>
    <ul class="nav-menu">
        <li class="nav-item">
            <a href="dashboard.php" class="nav-link <?php echo $current_page === 'dashboard.php' ? 'active' : ''; ?>">
                <i class="fas fa-chart-line" style="margin-right: 10px;"></i> Dashboard
            </a>
        </li>
        <li class="nav-item">
            <a href="rooms.php" class="nav-link <?php echo $current_page === 'rooms.php' ? 'active' : ''; ?>">
                <i class="fas fa-bed" style="margin-right: 10px;"></i> Manage Rooms
            </a>
        </li>
        <li class="nav-item">
            <a href="bookings.php" class="nav-link <?php echo $current_page === 'bookings.php' ? 'active' : ''; ?>">
                <i class="fas fa-calendar-check" style="margin-right: 10px;"></i> Bookings
            </a>
        </li>
        <li class="nav-item" style="margin-top: auto; padding-top: 2rem;">
            <a href="logout.php" class="nav-link" style="color: var(--accent-red);">
                <i class="fas fa-sign-out-alt" style="margin-right: 10px;"></i> Logout
            </a>
        </li>
    </ul>
</aside>
