<?php
$data = [
    'username' => 'admin',
    'password' => 'admin123'
];

$options = [
    'http' => [
        'header'  => "Content-type: application/json\r\n",
        'method'  => 'POST',
        'content' => json_encode($data),
    ],
];

$context  = stream_context_create($options);
$result = file_get_contents('http://localhost/Final_ITE203-main/api/auth/login.php', false, $context);

echo "Response: " . $result . "\n";
?>
