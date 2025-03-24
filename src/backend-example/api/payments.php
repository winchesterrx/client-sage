
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
                $result = select("SELECT * FROM payments WHERE id = :id", ['id' => $id]);
                
                if (count($result) > 0) {
                    echo json_encode($result[0]);
                } else {
                    http_response_code(404);
                    echo json_encode(['message' => 'Pagamento não encontrado']);
                }
            } else if (isset($_GET['client_id'])) {
                // Buscar pagamentos por cliente
                $clientId = sanitize($_GET['client_id']);
                $result = select(
                    "SELECT * FROM payments WHERE client_id = :client_id ORDER BY due_date DESC",
                    ['client_id' => $clientId]
                );
                echo json_encode($result);
            } else if (isset($_GET['service_id'])) {
                // Buscar pagamentos por serviço
                $serviceId = sanitize($_GET['service_id']);
                $result = select(
                    "SELECT * FROM payments WHERE service_id = :service_id ORDER BY due_date DESC",
                    ['service_id' => $serviceId]
                );
                echo json_encode($result);
            } else {
                // Retornar todos os pagamentos
                $result = select("SELECT * FROM payments ORDER BY due_date DESC");
                echo json_encode($result);
            }
            break;
            
        case 'POST':
            // Validar dados de entrada
            if (!isset($data['client_id']) || !isset($data['service_id']) || !isset($data['amount']) || !isset($data['due_date'])) {
                http_response_code(400);
                echo json_encode(['message' => 'Dados incompletos']);
                break;
            }
            
            // Preparar dados para inserção
            $paymentData = [
                'client_id' => sanitize($data['client_id']),
                'service_id' => sanitize($data['service_id']),
                'amount' => floatval($data['amount']),
                'payment_date' => isset($data['payment_date']) ? sanitize($data['payment_date']) : null,
                'due_date' => sanitize($data['due_date']),
                'status' => isset($data['status']) ? sanitize($data['status']) : 'pending',
                'payment_method' => isset($data['payment_method']) ? sanitize($data['payment_method']) : null,
                'notes' => isset($data['notes']) ? sanitize($data['notes']) : null
            ];
            
            // Inserir pagamento
            $id = insert('payments', $paymentData);
            
            if ($id) {
                $payment = select("SELECT * FROM payments WHERE id = :id", ['id' => $id])[0];
                http_response_code(201);
                echo json_encode($payment);
            } else {
                http_response_code(500);
                echo json_encode(['message' => 'Erro ao cadastrar pagamento']);
            }
            break;
            
        case 'PUT':
            // Verificar se um ID foi informado
            if (!isset($_GET['id'])) {
                http_response_code(400);
                echo json_encode(['message' => 'ID do pagamento não informado']);
                break;
            }
            
            // Validar dados mínimos de entrada
            if (!isset($data['amount']) || !isset($data['due_date'])) {
                http_response_code(400);
                echo json_encode(['message' => 'Valor e data de vencimento são obrigatórios']);
                break;
            }
            
            $id = sanitize($_GET['id']);
            
            // Preparar dados para atualização
            $paymentData = [
                'amount' => floatval($data['amount']),
                'payment_date' => isset($data['payment_date']) ? sanitize($data['payment_date']) : null,
                'due_date' => sanitize($data['due_date']),
                'status' => isset($data['status']) ? sanitize($data['status']) : 'pending',
                'payment_method' => isset($data['payment_method']) ? sanitize($data['payment_method']) : null,
                'notes' => isset($data['notes']) ? sanitize($data['notes']) : null
            ];
            
            // Se client_id ou service_id estiverem presentes, atualize-os também
            if (isset($data['client_id'])) {
                $paymentData['client_id'] = sanitize($data['client_id']);
            }
            
            if (isset($data['service_id'])) {
                $paymentData['service_id'] = sanitize($data['service_id']);
            }
            
            // Atualizar pagamento
            $rowCount = update('payments', $paymentData, 'id = :id', ['id' => $id]);
            
            if ($rowCount > 0) {
                $payment = select("SELECT * FROM payments WHERE id = :id", ['id' => $id])[0];
                echo json_encode($payment);
            } else {
                http_response_code(404);
                echo json_encode(['message' => 'Pagamento não encontrado ou nenhuma alteração necessária']);
            }
            break;
            
        case 'DELETE':
            // Verificar se um ID foi informado
            if (!isset($_GET['id'])) {
                http_response_code(400);
                echo json_encode(['message' => 'ID do pagamento não informado']);
                break;
            }
            
            $id = sanitize($_GET['id']);
            
            // Excluir pagamento
            $rowCount = delete('payments', 'id = :id', ['id' => $id]);
            
            if ($rowCount > 0) {
                echo json_encode(['message' => 'Pagamento excluído com sucesso']);
            } else {
                http_response_code(404);
                echo json_encode(['message' => 'Pagamento não encontrado']);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['message' => 'Método não permitido']);
            break;
    }
} catch (Exception $e) {
    error_log("Error in payments.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['message' => 'Erro interno do servidor: ' . $e->getMessage()]);
}
?>
