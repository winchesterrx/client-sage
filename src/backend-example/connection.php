<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Database configuration
$host = getenv('DB_HOST') ?: 'localhost';
$dbname = getenv('DB_NAME') ?: 'client_sage';
$username = getenv('DB_USER') ?: 'root';
$password = getenv('DB_PASSWORD') ?: '';

try {
    // Create PDO connection
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    
    // Set the PDO error mode to exception
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Set default fetch mode to associative array
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    
    // Use prepared statements for security
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
    
    // Return the connection
    return $pdo;
} catch (PDOException $e) {
    // Log the error
    error_log("Database Connection Error: " . $e->getMessage());
    
    // For API endpoints, we might want to return a proper error
    if (strpos($_SERVER['REQUEST_URI'], '/api/') !== false) {
        header('Content-Type: application/json');
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Database connection failed',
            'error' => $e->getMessage()
        ]);
        exit;
    }
    
    // Otherwise, we might want to throw the exception for the application to handle
    throw new Exception("Database connection failed: " . $e->getMessage());
}

// Função para executar uma consulta SELECT
function select($query, $params = []) {
    global $pdo;
    try {
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        return $stmt->fetchAll();
    } catch(PDOException $e) {
        die("Erro na consulta: " . $e->getMessage());
    }
}

// Função para executar uma consulta INSERT
function insert($table, $data) {
    global $pdo;
    $columns = implode(', ', array_keys($data));
    $placeholders = ':' . implode(', :', array_keys($data));
    
    $query = "INSERT INTO $table ($columns) VALUES ($placeholders)";
    
    try {
        $stmt = $pdo->prepare($query);
        $stmt->execute($data);
        return $pdo->lastInsertId();
    } catch(PDOException $e) {
        die("Erro ao inserir dados: " . $e->getMessage());
    }
}

// Função para executar uma consulta UPDATE
function update($table, $data, $where, $whereParams = []) {
    global $pdo;
    $setClauses = [];
    
    foreach(array_keys($data) as $column) {
        $setClauses[] = "$column = :$column";
    }
    
    $setClause = implode(', ', $setClauses);
    $query = "UPDATE $table SET $setClause WHERE $where";
    
    try {
        $stmt = $pdo->prepare($query);
        $stmt->execute(array_merge($data, $whereParams));
        return $stmt->rowCount();
    } catch(PDOException $e) {
        die("Erro ao atualizar dados: " . $e->getMessage());
    }
}

// Função para executar uma consulta DELETE
function delete($table, $where, $params = []) {
    global $pdo;
    $query = "DELETE FROM $table WHERE $where";
    
    try {
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        return $stmt->rowCount();
    } catch(PDOException $e) {
        die("Erro ao excluir dados: " . $e->getMessage());
    }
}

// Função para sanitizar dados de entrada
function sanitize($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}
?>
