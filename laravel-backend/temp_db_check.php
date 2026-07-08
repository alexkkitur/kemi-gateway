<?php
try {
    $pdo = new PDO('mysql:host=127.0.0.1;port=3306;dbname=kemi_portal', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $stmt = $pdo->query('SELECT VERSION() as v');
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    echo 'CONNECTED: ' . ($row['v'] ?? 'unknown');
} catch (Exception $e) {
    echo 'ERROR: ' . $e->getMessage();
}
