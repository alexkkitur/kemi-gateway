<?php
try {
    $pdo = new PDO('mysql:host=127.0.0.1;port=3306;dbname=kemi_portal', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $migration = '2026_07_08_120000_alter_personal_access_tokens_tokenable_id_to_string';

    // Ensure migrations table exists
    $stmt = $pdo->query("SELECT COUNT(*) as c FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'migrations'");
    $exists = (int)$stmt->fetch(PDO::FETCH_ASSOC)['c'];
    if (!$exists) {
        echo "migrations table does not exist\n";
        exit(1);
    }

    $stmt = $pdo->prepare('SELECT COUNT(*) as c FROM migrations WHERE migration = ?');
    $stmt->execute([$migration]);
    if ($stmt->fetch(PDO::FETCH_ASSOC)['c'] > 0) {
        echo "migration already recorded\n";
        exit(0);
    }

    $stmt = $pdo->query('SELECT COALESCE(MAX(batch), 0) as maxb FROM migrations');
    $maxb = (int)$stmt->fetch(PDO::FETCH_ASSOC)['maxb'];
    $batch = $maxb + 1;

    $ins = $pdo->prepare('INSERT INTO migrations (migration, batch) VALUES (?, ?)');
    $ins->execute([$migration, $batch]);
    echo "inserted migration with batch $batch\n";
} catch (Exception $e) {
    echo 'ERROR: ' . $e->getMessage() . "\n";
}
