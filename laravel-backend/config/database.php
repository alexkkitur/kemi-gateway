<?php

return [
    'default' => env('DB_CONNECTION', 'mysql'),
    'connections' => [
        'mysql' => [
            'driver' => 'mysql',
            'host' => env('DB_HOST', 'mysql-20c016ac-al-2d1d.h.aivencloud.com'),
            'port' => env('DB_PORT', '22205'),
            'database' => env('DB_DATABASE', 'defaultdb'),
            'username' => env('DB_USERNAME', 'avnadmin'),
            'password' => env('DB_PASSWORD', 'AVNS_F5bzi4Y-esbSsAxq_YH'),
            'unix_socket' => env('DB_SOCKET', ''),
            'charset' => 'utf8mb4',
            'collation' => 'utf8mb4_unicode_ci',
            'prefix' => '',
            'prefix_indexes' => true,
            'strict' => true,
            'engine' => null,
            'options' => [
                PDO::MYSQL_ATTR_SSL_CA => base_path('ca.pem'),
                PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT => false,
            ],
        ],
        'sqlite' => [
            'driver' => 'sqlite',
            'database' => env('DB_DATABASE', database_path('database.sqlite')),
            'prefix' => '',
            'foreign_key_constraints' => true,
        ],
    ],
    'migrations' => 'migrations',
    'redis' => [
        'client' => 'phpredis',
        'default' => [
            'host' => env('REDIS_HOST', '127.0.0.1'),
            'password' => env('REDIS_PASSWORD'),
            'port' => env('REDIS_PORT', '6379'),
            'database' => env('REDIS_DB', '0'),
        ],
    ],
];
