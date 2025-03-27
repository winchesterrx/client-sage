
# Guia de Configuração do Supabase

Este guia irá ajudá-lo a configurar seu banco de dados Supabase para o sistema de gerenciamento de clientes.

## 1. Criar uma conta e projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta ou faça login.
2. Crie um novo projeto, dando um nome de sua escolha.
3. Aguarde a inicialização do banco de dados.
4. Anote a URL do projeto e a chave anon key (está na seção API > URL e API Key do painel do Supabase).

## 2. Configurar variáveis de ambiente

1. Crie um arquivo `.env.local` na raiz do projeto com o seguinte conteúdo:

```
VITE_SUPABASE_URL=sua_url_do_projeto
VITE_SUPABASE_ANON_KEY=sua_chave_anon
```

Substitua `sua_url_do_projeto` e `sua_chave_anon` pelos valores obtidos no painel do Supabase.

## 3. Criação das tabelas no Supabase

1. No painel do Supabase, navegue até "SQL Editor".
2. Clique em "New Query".
3. Abra o arquivo `src/supabase-schema.sql` no seu editor de código.
4. Copie todo o conteúdo do arquivo.
5. Cole o conteúdo no SQL Editor do Supabase (NÃO cole o nome do arquivo, apenas o conteúdo SQL).
6. Clique em "Run" para executar o script e criar todas as tabelas necessárias.

## 4. Configurar bucket de armazenamento

1. No painel do Supabase, vá para "Storage".
2. Clique em "Create new bucket".
3. Digite "attachments" como nome do bucket e marque "Public bucket" se desejar que os arquivos sejam acessíveis publicamente.
4. Clique em "Create bucket".

## 5. Testando a conexão

1. Reinicie a aplicação.
2. Verifique se a aplicação está conectada ao Supabase.
3. Tente criar um novo cliente para verificar se a inserção está funcionando.

Se tudo estiver funcionando corretamente, seus dados serão salvos no Supabase!
