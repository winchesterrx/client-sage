
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
                $result = select("SELECT * FROM services WHERE id = :id", ['id' => $id]);
                
                if (count($result) > 0) {
                    echo json_encode($result[0]);
                } else {
                    http_response_code(404);
                    echo json_encode(['message' => 'Serviço não encontrado']);
                }
            } else if (isset($_GET['client_id'])) {
                // Buscar serviços por cliente
                $clientId = sanitize($_GET['client_id']);
                $result = select(
                    "SELECT * FROM services WHERE client_id = :client_id ORDER BY created_at DESC",
                    ['client_id' => $clientId]
                );
                echo json_encode($result);
            } else {
                // Retornar todos os serviços
                $result = select("SELECT * FROM services ORDER BY created_at DESC");
                echo json_encode($result);
            }
            break;
            
        case 'POST':
            // Validar dados de entrada
            if (!isset($data['client_id']) || !isset($data['service_type']) || !isset($data['price'])) {
                http_response_code(400);
                echo json_encode(['message' => 'Dados incompletos']);
                break;
            }
            
            // Preparar dados para inserção
            $serviceData = [
                'client_id' => sanitize($data['client_id']),
                'service_type' => sanitize($data['service_type']),
                'price' => floatval($data['price']),
                'access_link' => isset($data['access_link']) ? sanitize($data['access_link']) : '',
                'username' => isset($data['username']) ? sanitize($data['username']) : '',
                'password' => isset($data['password']) ? sanitize($data['password']) : '',
                'status' => isset($data['status']) ? sanitize($data['status']) : 'active'
            ];
            
            // Inserir serviço
            $id = insert('services', $serviceData);
            
            if ($id) {
                $service = select("SELECT * FROM services WHERE id = :id", ['id' => $id])[0];
                http_response_code(201);
                echo json_encode($service);
            } else {
                http_response_code(500);
                echo json_encode(['message' => 'Erro ao cadastrar serviço']);
            }
            break;
            
        case 'PUT':
            // Verificar se um ID foi informado
            if (!isset($_GET['id'])) {
                http_response_code(400);
                echo json_encode(['message' => 'ID do serviço não informado']);
                break;
            }
            
            // Validar dados mínimos de entrada
            if (!isset($data['service_type']) || !isset($data['price'])) {
                http_response_code(400);
                echo json_encode(['message' => 'Dados incompletos']);
                break;
            }
            
            $id = sanitize($_GET['id']);
            
            // Preparar dados para atualização
            $serviceData = [
                'service_type' => sanitize($data['service_type']),
                'price' => floatval($data['price']),
                'access_link' => isset($data['access_link']) ? sanitize($data['access_link']) : '',
                'username' => isset($data['username']) ? sanitize($data['username']) : '',
                'password' => isset($data['password']) ? sanitize($data['password']) : '',
                'status' => isset($data['status']) ? sanitize($data['status']) : 'active'
            ];
            
            // Se o client_id estiver presente, atualize-o também
            if (isset($data['client_id'])) {
                $serviceData['client_id'] = sanitize($data['client_id']);
            }
            
            // Atualizar serviço
            $rowCount = update('services', $serviceData, 'id = :id', ['id' => $id]);
            
            if ($rowCount > 0) {
                $service = select("SELECT * FROM services WHERE id = :id", ['id' => $id])[0];
                echo json_encode($service);
            } else {
                http_response_code(404);
                echo json_encode(['message' => 'Serviço não encontrado ou nenhuma alteração necessária']);
            }
            break;
            
        case 'DELETE':
            // Verificar se um ID foi informado
            if (!isset($_GET['id'])) {
                http_response_code(400);
                echo json_encode(['message' => 'ID do serviço não informado']);
                break;
            }
            
            $id = sanitize($_GET['id']);
            
            // Excluir serviço
            $rowCount = delete('services', 'id = :id', ['id' => $id]);
            
            if ($rowCount > 0) {
                echo json_encode(['message' => 'Serviço excluído com sucesso']);
            } else {
                http_response_code(404);
                echo json_encode(['message' => 'Serviço não encontrado']);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['message' => 'Método não permitido']);
            break;
    }
} catch (Exception $e) {
    error_log("Error in services.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['message' => 'Erro interno do servidor: ' . $e->getMessage()]);
}
?>
