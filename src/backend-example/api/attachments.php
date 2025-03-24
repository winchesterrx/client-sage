
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

// Log da requisição para depuração
error_log("Request Method: $method");
error_log("Request Query: " . json_encode($_GET));

try {
    // Processar a requisição de acordo com o método HTTP
    switch ($method) {
        case 'GET':
            // Verificar se um ID foi informado
            if (isset($_GET['id'])) {
                $id = sanitize($_GET['id']);
                $result = select("SELECT * FROM attachments WHERE id = :id", ['id' => $id]);
                
                if (count($result) > 0) {
                    echo json_encode($result[0]);
                } else {
                    http_response_code(404);
                    echo json_encode(['message' => 'Anexo não encontrado']);
                }
            } else if (isset($_GET['related_type']) && isset($_GET['related_id'])) {
                // Buscar anexos por tipo e ID relacionado
                $relatedType = sanitize($_GET['related_type']);
                $relatedId = sanitize($_GET['related_id']);
                $result = select(
                    "SELECT * FROM attachments WHERE related_type = :related_type AND related_id = :related_id ORDER BY created_at DESC",
                    ['related_type' => $relatedType, 'related_id' => $relatedId]
                );
                echo json_encode($result);
            } else {
                // Retornar todos os anexos
                $result = select("SELECT * FROM attachments ORDER BY created_at DESC");
                echo json_encode($result);
            }
            break;
            
        case 'POST':
            // Este é um exemplo simplificado para upload de arquivo
            // Em uma implementação real, você precisaria lidar com o upload do arquivo real
            
            // Verificar se os dados necessários foram enviados
            if (!isset($_POST['related_type']) || !isset($_POST['related_id'])) {
                http_response_code(400);
                echo json_encode(['message' => 'Dados incompletos']);
                break;
            }
            
            // Verificar se um arquivo foi enviado
            if (!isset($_FILES['file']) || $_FILES['file']['error'] !== 0) {
                http_response_code(400);
                echo json_encode(['message' => 'Nenhum arquivo válido enviado']);
                break;
            }
            
            $file = $_FILES['file'];
            $relatedType = sanitize($_POST['related_type']);
            $relatedId = sanitize($_POST['related_id']);
            
            // Criar diretório para uploads se não existir
            $uploadDir = '../uploads/' . $relatedType . '/' . $relatedId . '/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            
            // Gerar nome de arquivo único
            $fileName = uniqid() . '_' . sanitize($file['name']);
            $filePath = $uploadDir . $fileName;
            
            // Mover o arquivo para o diretório de uploads
            if (move_uploaded_file($file['tmp_name'], $filePath)) {
                // Preparar dados para inserção
                $attachmentData = [
                    'related_id' => $relatedId,
                    'related_type' => $relatedType,
                    'file_name' => sanitize($file['name']),
                    'file_path' => $filePath,
                    'file_type' => sanitize($file['type']),
                    'file_size' => $file['size']
                ];
                
                // Inserir registro de anexo no banco de dados
                $id = insert('attachments', $attachmentData);
                
                if ($id) {
                    $attachment = select("SELECT * FROM attachments WHERE id = :id", ['id' => $id])[0];
                    http_response_code(201);
                    echo json_encode($attachment);
                } else {
                    // Se falhar ao inserir no banco de dados, excluir o arquivo
                    unlink($filePath);
                    http_response_code(500);
                    echo json_encode(['message' => 'Erro ao salvar informações do anexo']);
                }
            } else {
                http_response_code(500);
                echo json_encode(['message' => 'Erro ao fazer upload do arquivo']);
            }
            break;
            
        case 'DELETE':
            // Verificar se um ID foi informado
            if (!isset($_GET['id'])) {
                http_response_code(400);
                echo json_encode(['message' => 'ID do anexo não informado']);
                break;
            }
            
            $id = sanitize($_GET['id']);
            
            // Obter informações do anexo para excluir o arquivo
            $attachment = select("SELECT * FROM attachments WHERE id = :id", ['id' => $id]);
            
            if (count($attachment) === 0) {
                http_response_code(404);
                echo json_encode(['message' => 'Anexo não encontrado']);
                break;
            }
            
            // Excluir o arquivo físico
            $filePath = $attachment[0]['file_path'];
            if (file_exists($filePath)) {
                unlink($filePath);
            }
            
            // Excluir registro do banco de dados
            $rowCount = delete('attachments', 'id = :id', ['id' => $id]);
            
            if ($rowCount > 0) {
                echo json_encode(['message' => 'Anexo excluído com sucesso']);
            } else {
                http_response_code(500);
                echo json_encode(['message' => 'Erro ao excluir anexo do banco de dados']);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['message' => 'Método não permitido']);
            break;
    }
} catch (Exception $e) {
    error_log("Error in attachments.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['message' => 'Erro interno do servidor: ' . $e->getMessage()]);
}
?>
