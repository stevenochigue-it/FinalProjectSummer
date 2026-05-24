<?php
header('Content-Type: text/plain');
$password = 'admin123';
$hash = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
if (password_verify($password, $hash)) {
    echo "Match! admin123 works.";
} else {
    echo "No match. Trying 'password'...";
    if (password_verify('password', $hash)) {
        echo " Match! The password is 'password'.";
    } else {
        echo " Neither worked.";
    }
}
?>
