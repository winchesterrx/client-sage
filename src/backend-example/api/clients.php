
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
                $result = select("SELECT * FROM clients WHERE id = :id", ['id' => $id]);
                
                if (count($result) > 0) {
                    echo json_encode($result[0]);
                } else {
                    http_response_code(404);
                    echo json_encode(['message' => 'Cliente não encontrado']);
                }
            } else if (isset($_GET['search'])) {
                // Pesquisa por nome, cidade ou email
                $search = '%' . sanitize($_GET['search']) . '%';
                $result = select(
                    "SELECT * FROM clients WHERE name LIKE :search OR city LIKE :search OR email LIKE :search ORDER BY name",
                    ['search' => $search]
                );
                echo json_encode($result);
            } else {
                // Retornar todos os clientes
                $result = select("SELECT * FROM clients ORDER BY name");
                echo json_encode($result);
            }
            break;
            
        case 'POST':
            // Validar dados de entrada
            if (!isset($data['name']) || !isset($data['city']) || !isset($data['phone'])) {
                http_response_code(400);
                echo json_encode(['message' => 'Dados incompletos']);
                break;
            }
            
            // Preparar dados para inserção
            $clientData = [
                'name' => sanitize($data['name']),
                'city' => sanitize($data['city']),
                'phone' => sanitize($data['phone']),
                'email' => isset($data['email']) ? sanitize($data['email']) : null
            ];
            
            // Inserir cliente
            $id = insert('clients', $clientData);
            
            if ($id) {
                $client = select("SELECT * FROM clients WHERE id = :id", ['id' => $id])[0];
                http_response_code(201);
                echo json_encode($client);
            } else {
                http_response_code(500);
                echo json_encode(['message' => 'Erro ao cadastrar cliente']);
            }
            break;
            
        case 'PUT':
            // Verificar se um ID foi informado
            if (!isset($_GET['id'])) {
                http_response_code(400);
                echo json_encode(['message' => 'ID do cliente não informado']);
                break;
            }
            
            // Validar dados de entrada
            if (!isset($data['name']) || !isset($data['city']) || !isset($data['phone'])) {
                http_response_code(400);
                echo json_encode(['message' => 'Dados incompletos']);
                break;
            }
            
            $id = sanitize($_GET['id']);
            
            // Preparar dados para atualização
            $clientData = [
                'name' => sanitize($data['name']),
                'city' => sanitize($data['city']),
                'phone' => sanitize($data['phone']),
                'email' => isset($data['email']) ? sanitize($data['email']) : null
            ];
            
            // Atualizar cliente
            $rowCount = update('clients', $clientData, 'id = :id', ['id' => $id]);
            
            if ($rowCount > 0) {
                $client = select("SELECT * FROM clients WHERE id = :id", ['id' => $id])[0];
                echo json_encode($client);
            } else {
                http_response_code(404);
                echo json_encode(['message' => 'Cliente não encontrado ou nenhuma alteração necessária']);
            }
            break;
            
        case 'DELETE':
            // Verificar se um ID foi informado
            if (!isset($_GET['id'])) {
                http_response_code(400);
                echo json_encode(['message' => 'ID do cliente não informado']);
                break;
            }
            
            $id = sanitize($_GET['id']);
            
            // Excluir cliente
            $rowCount = delete('clients', 'id = :id', ['id' => $id]);
            
            if ($rowCount > 0) {
                echo json_encode(['message' => 'Cliente excluído com sucesso']);
            } else {
                http_response_code(404);
                echo json_encode(['message' => 'Cliente não encontrado']);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['message' => 'Método não permitido']);
            break;
    }
} catch (Exception $e) {
    error_log("Error in clients.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['message' => 'Erro interno do servidor: ' . $e->getMessage()]);
}
?>
