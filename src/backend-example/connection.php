
<?php
// Configuração do banco de dados
$host = 'clientesowl-db.mysql.uhserver.com'; // Host do banco de dados
$dbname = 'clientesowl_db'; // Nome do banco de dados
$username = 'gsilva1930'; // Nome de usuário do MySQL
$password = '@Saopaulop45'; // Senha do MySQL

// Tentar estabelecer a conexão com o banco de dados
try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    // Definir o modo de erro do PDO para exceção
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // Definir o modo de busca padrão para retornar um array associativo
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch(PDOException $e) {
    // Em caso de erro na conexão, exibir mensagem de erro
    die("Falha na conexão com o banco de dados: " . $e->getMessage());
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
