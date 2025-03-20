
<?php
// Include CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// For preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Database connection is optional for healthcheck
try {
    include_once '../connection.php';
    $status = "connected";
} catch (Exception $e) {
    $status = "no_db";
}

// Return a simple health status
header('Content-Type: application/json');
echo json_encode([
    'status' => 'ok',
    'timestamp' => date('Y-m-d H:i:s'),
    'database' => $status,
    'environment' => getenv('APP_ENV') ?: 'development'
]);
