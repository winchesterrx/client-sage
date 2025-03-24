
<?php
// Página inicial para o backend
header('Content-Type: text/html; charset=utf-8');
?>

<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API do Sistema de Gerenciamento de Clientes</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        h1, h2 {
            color: #333;
        }
        code {
            background: #f4f4f4;
            padding: 5px;
            border-radius: 4px;
        }
        .endpoint {
            margin-bottom: 20px;
            padding: 10px;
            border-left: 3px solid #0066cc;
            background-color: #f8f8f8;
        }
        .method {
            font-weight: bold;
            color: #0066cc;
        }
    </style>
</head>
<body>
    <h1>API do Sistema de Gerenciamento de Clientes</h1>
    <p>Esta é a documentação básica da API para o sistema de gerenciamento de clientes, serviços e projetos.</p>
    
    <h2>Endpoints Disponíveis</h2>
    
    <div class="endpoint">
        <h3>Clientes</h3>
        <p><span class="method">GET</span> /api/clients.php - Listar todos os clientes</p>
        <p><span class="method">GET</span> /api/clients.php?id=1 - Obter cliente específico</p>
        <p><span class="method">POST</span> /api/clients.php - Criar novo cliente</p>
        <p><span class="method">PUT</span> /api/clients.php?id=1 - Atualizar cliente</p>
        <p><span class="method">DELETE</span> /api/clients.php?id=1 - Excluir cliente</p>
    </div>
    
    <div class="endpoint">
        <h3>Serviços</h3>
        <p><span class="method">GET</span> /api/services.php - Listar todos os serviços</p>
        <p><span class="method">GET</span> /api/services.php?id=1 - Obter serviço específico</p>
        <p><span class="method">GET</span> /api/services.php?client_id=1 - Listar serviços por cliente</p>
        <p><span class="method">POST</span> /api/services.php - Criar novo serviço</p>
        <p><span class="method">PUT</span> /api/services.php?id=1 - Atualizar serviço</p>
        <p><span class="method">DELETE</span> /api/services.php?id=1 - Excluir serviço</p>
    </div>
    
    <div class="endpoint">
        <h3>Projetos</h3>
        <p><span class="method">GET</span> /api/projects.php - Listar todos os projetos</p>
        <p><span class="method">GET</span> /api/projects.php?id=1 - Obter projeto específico</p>
        <p><span class="method">GET</span> /api/projects.php?client_id=1 - Listar projetos por cliente</p>
        <p><span class="method">POST</span> /api/projects.php - Criar novo projeto</p>
        <p><span class="method">PUT</span> /api/projects.php?id=1 - Atualizar projeto</p>
        <p><span class="method">DELETE</span> /api/projects.php?id=1 - Excluir projeto</p>
    </div>
    
    <div class="endpoint">
        <h3>Tarefas</h3>
        <p><span class="method">GET</span> /api/tasks.php - Listar todas as tarefas</p>
        <p><span class="method">GET</span> /api/tasks.php?id=1 - Obter tarefa específica</p>
        <p><span class="method">GET</span> /api/tasks.php?project_id=1 - Listar tarefas por projeto</p>
        <p><span class="method">POST</span> /api/tasks.php - Criar nova tarefa</p>
        <p><span class="method">PUT</span> /api/tasks.php?id=1 - Atualizar tarefa</p>
        <p><span class="method">DELETE</span> /api/tasks.php?id=1 - Excluir tarefa</p>
    </div>
    
    <div class="endpoint">
        <h3>Pagamentos</h3>
        <p><span class="method">GET</span> /api/payments.php - Listar todos os pagamentos</p>
        <p><span class="method">GET</span> /api/payments.php?id=1 - Obter pagamento específico</p>
        <p><span class="method">GET</span> /api/payments.php?client_id=1 - Listar pagamentos por cliente</p>
        <p><span class="method">GET</span> /api/payments.php?service_id=1 - Listar pagamentos por serviço</p>
        <p><span class="method">POST</span> /api/payments.php - Criar novo pagamento</p>
        <p><span class="method">PUT</span> /api/payments.php?id=1 - Atualizar pagamento</p>
        <p><span class="method">DELETE</span> /api/payments.php?id=1 - Excluir pagamento</p>
    </div>
    
    <div class="endpoint">
        <h3>Anexos</h3>
        <p><span class="method">GET</span> /api/attachments.php - Listar todos os anexos</p>
        <p><span class="method">GET</span> /api/attachments.php?id=1 - Obter anexo específico</p>
        <p><span class="method">GET</span> /api/attachments.php?related_type=client&related_id=1 - Listar anexos por tipo e ID relacionado</p>
        <p><span class="method">POST</span> /api/attachments.php - Fazer upload de novo anexo</p>
        <p><span class="method">DELETE</span> /api/attachments.php?id=1 - Excluir anexo</p>
    </div>
    
    <h2>Status da API</h2>
    <p>Para verificar o status da API, acesse: <a href="/api/healthcheck.php">/api/healthcheck.php</a></p>
    
    <h2>Implementação</h2>
    <p>Para implementar este backend:</p>
    <ol>
        <li>Faça upload desses arquivos para o seu servidor PHP</li>
        <li>Certifique-se de que o servidor tem suporte a PDO e MySQL</li>
        <li>Configure as credenciais do banco de dados no arquivo <code>connection.php</code></li>
        <li>Crie as tabelas necessárias no banco de dados conforme o esquema fornecido</li>
        <li>Atualize a URL da API no frontend para apontar para este backend</li>
    </ol>
</body>
</html>
