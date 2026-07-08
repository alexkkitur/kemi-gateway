<?php
try {
    $pdo = new PDO('mysql:host=127.0.0.1;port=3306;dbname=kemi_portal', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $sql = "ALTER TABLE personal_access_tokens MODIFY tokenable_id VARCHAR(255) NOT NULL";
    $pdo->exec($sql);
    echo "OK: column modified\n";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
