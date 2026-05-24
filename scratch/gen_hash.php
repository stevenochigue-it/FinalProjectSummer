<?php
$pass = 'admin123';
$hash = password_hash($pass, PASSWORD_BCRYPT);
echo "Password: $pass\n";
echo "Hash: $hash\n";
echo "Verify: " . (password_verify($pass, $hash) ? 'OK' : 'FAIL') . "\n";
?>
