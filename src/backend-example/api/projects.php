
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
                $result = select("SELECT * FROM projects WHERE id = :id", ['id' => $id]);
                
                if (count($result) > 0) {
                    echo json_encode($result[0]);
                } else {
                    http_response_code(404);
                    echo json_encode(['message' => 'Projeto não encontrado']);
                }
            } else if (isset($_GET['client_id'])) {
                // Buscar projetos por cliente
                $clientId = sanitize($_GET['client_id']);
                $result = select(
                    "SELECT * FROM projects WHERE client_id = :client_id ORDER BY start_date DESC",
                    ['client_id' => $clientId]
                );
                echo json_encode($result);
            } else {
                // Retornar todos os projetos
                $result = select("SELECT * FROM projects ORDER BY start_date DESC");
                echo json_encode($result);
            }
            break;
            
        case 'POST':
            // Validar dados de entrada
            if (!isset($data['client_id']) || !isset($data['name']) || !isset($data['start_date'])) {
                http_response_code(400);
                echo json_encode(['message' => 'Dados incompletos']);
                break;
            }
            
            // Preparar dados para inserção
            $projectData = [
                'client_id' => sanitize($data['client_id']),
                'name' => sanitize($data['name']),
                'description' => isset($data['description']) ? sanitize($data['description']) : null,
                'status' => isset($data['status']) ? sanitize($data['status']) : 'planning',
                'start_date' => sanitize($data['start_date']),
                'end_date' => isset($data['end_date']) ? sanitize($data['end_date']) : null
            ];
            
            // Inserir projeto
            $id = insert('projects', $projectData);
            
            if ($id) {
                $project = select("SELECT * FROM projects WHERE id = :id", ['id' => $id])[0];
                http_response_code(201);
                echo json_encode($project);
            } else {
                http_response_code(500);
                echo json_encode(['message' => 'Erro ao cadastrar projeto']);
            }
            break;
            
        case 'PUT':
            // Verificar se um ID foi informado
            if (!isset($_GET['id'])) {
                http_response_code(400);
                echo json_encode(['message' => 'ID do projeto não informado']);
                break;
            }
            
            // Validar dados mínimos de entrada
            if (!isset($data['name'])) {
                http_response_code(400);
                echo json_encode(['message' => 'Nome do projeto é obrigatório']);
                break;
            }
            
            $id = sanitize($_GET['id']);
            
            // Preparar dados para atualização
            $projectData = [
                'name' => sanitize($data['name']),
                'description' => isset($data['description']) ? sanitize($data['description']) : null,
                'status' => isset($data['status']) ? sanitize($data['status']) : 'planning',
                'start_date' => isset($data['start_date']) ? sanitize($data['start_date']) : null,
                'end_date' => isset($data['end_date']) ? sanitize($data['end_date']) : null
            ];
            
            // Se o client_id estiver presente, atualize-o também
            if (isset($data['client_id'])) {
                $projectData['client_id'] = sanitize($data['client_id']);
            }
            
            // Atualizar projeto
            $rowCount = update('projects', $projectData, 'id = :id', ['id' => $id]);
            
            if ($rowCount > 0) {
                $project = select("SELECT * FROM projects WHERE id = :id", ['id' => $id])[0];
                echo json_encode($project);
            } else {
                http_response_code(404);
                echo json_encode(['message' => 'Projeto não encontrado ou nenhuma alteração necessária']);
            }
            break;
            
        case 'DELETE':
            // Verificar se um ID foi informado
            if (!isset($_GET['id'])) {
                http_response_code(400);
                echo json_encode(['message' => 'ID do projeto não informado']);
                break;
            }
            
            $id = sanitize($_GET['id']);
            
            // Excluir projeto
            $rowCount = delete('projects', 'id = :id', ['id' => $id]);
            
            if ($rowCount > 0) {
                echo json_encode(['message' => 'Projeto excluído com sucesso']);
            } else {
                http_response_code(404);
                echo json_encode(['message' => 'Projeto não encontrado']);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['message' => 'Método não permitido']);
            break;
    }
} catch (Exception $e) {
    error_log("Error in projects.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['message' => 'Erro interno do servidor: ' . $e->getMessage()]);
}
?>
