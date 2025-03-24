
<?php
// Habilitar relatório de erros para depuração
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Configuração do banco de dados
$host = 'clientesowl-db.mysql.uhserver.com';
$dbname = 'clientesowl_db';
$username = 'gsilva1930';
$password = '@Saopaulop45';

try {
    // Criar conexão PDO
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    
    // Definir o modo de erro PDO para exceção
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Definir o modo de busca padrão para array associativo
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    
    // Usar declarações preparadas para segurança
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
    
    // Retornar a conexão
    return $pdo;
} catch (PDOException $e) {
    // Registrar o erro
    error_log("Erro de Conexão com o Banco de Dados: " . $e->getMessage());
    
    // Para endpoints de API, queremos retornar um erro adequado
    if (strpos($_SERVER['REQUEST_URI'], '/api/') !== false) {
        header('Content-Type: application/json');
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Falha na conexão com o banco de dados',
            'error' => $e->getMessage()
        ]);
        exit;
    }
    
    // Caso contrário, podemos lançar a exceção para que o aplicativo a trate
    throw new Exception("Falha na conexão com o banco de dados: " . $e->getMessage());
}

// Função para executar uma consulta SELECT
function select($query, $params = []) {
    global $pdo;
    try {
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        return $stmt->fetchAll();
    } catch(PDOException $e) {
        error_log("Erro na consulta: " . $e->getMessage());
        throw new Exception("Erro na consulta: " . $e->getMessage());
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
        error_log("Erro ao inserir dados: " . $e->getMessage());
        throw new Exception("Erro ao inserir dados: " . $e->getMessage());
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
        error_log("Erro ao atualizar dados: " . $e->getMessage());
        throw new Exception("Erro ao atualizar dados: " . $e->getMessage());
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
        error_log("Erro ao excluir dados: " . $e->getMessage());
        throw new Exception("Erro ao excluir dados: " . $e->getMessage());
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
