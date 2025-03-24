
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Incluir o arquivo de conexão
require_once '../connection.php';

// Obter o método HTTP
$method = $_SERVER['REQUEST_METHOD'];

// Obter dados do corpo da requisição
$data = json_decode(file_get_contents('php://input'), true);

// Log da requisição para depuração
error_log("Request Method: $method");
error_log("Request Data: " . json_encode($data));
error_log("Request Query: " . json_encode($_GET));

try {
    // Processar a requisição de acordo com o método HTTP
    switch ($method) {
        case 'GET':
            // Verificar se um ID foi informado
            if (isset($_GET['id'])) {
                $id = sanitize($_GET['id']);
                $result = select("SELECT * FROM tasks WHERE id = :id", ['id' => $id]);
                
                if (count($result) > 0) {
                    echo json_encode($result[0]);
                } else {
                    http_response_code(404);
                    echo json_encode(['message' => 'Tarefa não encontrada']);
                }
            } else if (isset($_GET['project_id'])) {
                // Buscar tarefas por projeto
                $projectId = sanitize($_GET['project_id']);
                $result = select(
                    "SELECT * FROM tasks WHERE project_id = :project_id ORDER BY priority DESC, due_date ASC",
                    ['project_id' => $projectId]
                );
                echo json_encode($result);
            } else {
                // Retornar todas as tarefas
                $result = select("SELECT * FROM tasks ORDER BY due_date ASC");
                echo json_encode($result);
            }
            break;
            
        case 'POST':
            // Validar dados de entrada
            if (!isset($data['project_id']) || !isset($data['name'])) {
                http_response_code(400);
                echo json_encode(['message' => 'Dados incompletos']);
                break;
            }
            
            // Preparar dados para inserção
            $taskData = [
                'project_id' => sanitize($data['project_id']),
                'name' => sanitize($data['name']),
                'description' => isset($data['description']) ? sanitize($data['description']) : null,
                'status' => isset($data['status']) ? sanitize($data['status']) : 'todo',
                'due_date' => isset($data['due_date']) ? sanitize($data['due_date']) : null,
                'priority' => isset($data['priority']) ? sanitize($data['priority']) : 'medium'
            ];
            
            // Inserir tarefa
            $id = insert('tasks', $taskData);
            
            if ($id) {
                $task = select("SELECT * FROM tasks WHERE id = :id", ['id' => $id])[0];
                http_response_code(201);
                echo json_encode($task);
            } else {
                http_response_code(500);
                echo json_encode(['message' => 'Erro ao cadastrar tarefa']);
            }
            break;
            
        case 'PUT':
            // Verificar se um ID foi informado
            if (!isset($_GET['id'])) {
                http_response_code(400);
                echo json_encode(['message' => 'ID da tarefa não informado']);
                break;
            }
            
            // Validar dados mínimos de entrada
            if (!isset($data['name'])) {
                http_response_code(400);
                echo json_encode(['message' => 'Nome da tarefa é obrigatório']);
                break;
            }
            
            $id = sanitize($_GET['id']);
            
            // Preparar dados para atualização
            $taskData = [
                'name' => sanitize($data['name']),
                'description' => isset($data['description']) ? sanitize($data['description']) : null,
                'status' => isset($data['status']) ? sanitize($data['status']) : 'todo',
                'due_date' => isset($data['due_date']) ? sanitize($data['due_date']) : null,
                'priority' => isset($data['priority']) ? sanitize($data['priority']) : 'medium'
            ];
            
            // Se o project_id estiver presente, atualize-o também
            if (isset($data['project_id'])) {
                $taskData['project_id'] = sanitize($data['project_id']);
            }
            
            // Atualizar tarefa
            $rowCount = update('tasks', $taskData, 'id = :id', ['id' => $id]);
            
            if ($rowCount > 0) {
                $task = select("SELECT * FROM tasks WHERE id = :id", ['id' => $id])[0];
                echo json_encode($task);
            } else {
                http_response_code(404);
                echo json_encode(['message' => 'Tarefa não encontrada ou nenhuma alteração necessária']);
            }
            break;
            
        case 'DELETE':
            // Verificar se um ID foi informado
            if (!isset($_GET['id'])) {
                http_response_code(400);
                echo json_encode(['message' => 'ID da tarefa não informado']);
                break;
            }
            
            $id = sanitize($_GET['id']);
            
            // Excluir tarefa
            $rowCount = delete('tasks', 'id = :id', ['id' => $id]);
            
            if ($rowCount > 0) {
                echo json_encode(['message' => 'Tarefa excluída com sucesso']);
            } else {
                http_response_code(404);
                echo json_encode(['message' => 'Tarefa não encontrada']);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['message' => 'Método não permitido']);
            break;
    }
} catch (Exception $e) {
    error_log("Error in tasks.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['message' => 'Erro interno do servidor: ' . $e->getMessage()]);
}
?>
