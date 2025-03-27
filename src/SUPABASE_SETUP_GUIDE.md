
# Supabase Setup Guide

Este guia irá ajudá-lo a configurar seu banco de dados Supabase para o sistema de gerenciamento de clientes.

## 1. Criar uma conta e projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta ou faça login.
2. Crie um novo projeto, dando um nome de sua escolha.
3. Aguarde a inicialização do banco de dados.
4. Anote a URL do projeto e a chave anon key (está na seção API do painel do Supabase).

## 2. Configurar variáveis de ambiente

1. Crie um arquivo `.env.local` na raiz do projeto (ou use as variáveis de ambiente do seu serviço de hospedagem).
2. Adicione as seguintes variáveis:

```
VITE_SUPABASE_URL=sua_url_do_projeto
VITE_SUPABASE_ANON_KEY=sua_chave_anon
```

## 3. Criação das tabelas no Supabase

1. No painel do Supabase, navegue até "SQL Editor".
2. Crie uma nova consulta.
3. Cole o conteúdo do arquivo `src/supabase-schema.sql` no editor.
4. Execute a consulta para criar todas as tabelas necessárias.

## 4. Configurar bucket de armazenamento

1. No painel do Supabase, vá para "Storage".
2. Crie um novo bucket chamado "attachments".
3. Nas configurações do bucket, defina-o como público se desejar que os arquivos sejam acessíveis publicamente.
4. Configure políticas de acesso conforme necessário:
   - Para permitir leitura pública: `bucket_id = 'attachments'`
   - Para permitir que usuários autenticados façam upload: `bucket_id = 'attachments' AND auth.role() = 'authenticated'`

## 5. Políticas de segurança (RLS)

As políticas de Row Level Security (RLS) já foram configuradas no script SQL para permitir que usuários autenticados acessem todas as tabelas.

Se você precisar de políticas mais granulares:

1. Navegue até "Authentication" > "Policies" no painel do Supabase.
2. Selecione a tabela que deseja modificar.
3. Edite ou adicione novas políticas conforme necessário.

## 6. Testando a conexão

Para testar se a conexão com o Supabase está funcionando corretamente:

1. Acesse a página inicial do seu aplicativo.
2. Verifique se os dados estão sendo carregados corretamente.
3. Tente criar um novo cliente para verificar se a inserção funciona.

## 7. Migrando dados existentes

Se você já possui dados no sistema anterior, considere:

1. Exportar os dados do seu banco de dados MySQL como JSON ou CSV.
2. Importar os dados para o Supabase usando o "Table Editor" ou consultas SQL.
