
# Client Manager

Um sistema moderno para gerenciamento de clientes, serviços, projetos e finanças.

## Visão Geral

Este aplicativo permite que desenvoledores web gerenciem seus clientes e projetos de forma eficiente. Com uma interface moderna e intuitiva, é possível cadastrar clientes, controlar serviços ativos, gerenciar projetos e acompanhar pagamentos.

## Funcionalidades

- **Gestão de Clientes**: Cadastro e gerenciamento de clientes com nome, cidade, telefone e email.
- **Gestão de Serviços**: Cadastro de serviços por cliente, com tipo de serviço, preço, link de acesso e credenciais.
- **Controle de Pagamentos**: Registro e acompanhamento de pagamentos por serviço.
- **Gestão de Projetos**: Criação e acompanhamento de projetos por cliente.
- **Tarefas**: Criação e gerenciamento de tarefas por projeto.

## Tecnologias Utilizadas

### Frontend
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Query
- React Router

### Backend (Instruções de Implementação)
- PHP
- MySQL

## Estrutura do Banco de Dados

O sistema utiliza um banco de dados MySQL com as seguintes tabelas:

- `clients`: Armazena os dados dos clientes
- `services`: Armazena os serviços associados aos clientes
- `payments`: Registra os pagamentos de serviços
- `projects`: Armazena os projetos por cliente
- `tasks`: Armazena as tarefas por projeto
- `attachments`: Armazena anexos para clientes, projetos, etc.

## Configuração do Banco de Dados

```sql
-- Estrutura do banco de dados
-- Clients table
CREATE TABLE clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Services table
CREATE TABLE services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  service_type VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  access_link VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  status ENUM('active', 'inactive', 'pending') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Payments table
CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  service_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_date DATE,
  due_date DATE NOT NULL,
  status ENUM('paid', 'pending', 'overdue') DEFAULT 'pending',
  payment_method VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

-- Projects table
CREATE TABLE projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('planning', 'in_progress', 'completed', 'on_hold') DEFAULT 'planning',
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Tasks table
CREATE TABLE tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('todo', 'in_progress', 'completed') DEFAULT 'todo',
  due_date DATE,
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Attachments table
CREATE TABLE attachments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  related_id INT NOT NULL,
  related_type ENUM('client', 'project', 'service', 'task') NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_size INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Conexão com o Banco de Dados

Informações de conexão:
- Host: clientesowl-db.mysql.uhserver.com
- Database: clientesowl_db
- Username: gsilva1930
- Password: @Saopaulop45

## Implementação do Backend

1. Configure um servidor PHP com suporte a MySQL.
2. Crie a estrutura do banco de dados usando o script SQL fornecido.
3. Copie os arquivos PHP da pasta `src/backend-example` para o seu servidor.
4. Atualize a URL da API no arquivo `src/services/api.ts` para apontar para o seu servidor.

## Execução do Frontend

Para executar o frontend localmente:

```sh
# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

## Licença

Este projeto é fornecido com a licença MIT.
