
-- Verify if the usuarios table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'usuarios'
);

-- Verify if the users table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'users'
);

-- Check if the master user exists in usuarios
SELECT * FROM usuarios WHERE email = 'master@sistema.com';

-- If the usuarios table doesn't exist or is incorrectly set up, you can run the following:
/*
-- Create the usuarios table
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  papel VARCHAR(20) CHECK (papel IN ('admin', 'master', 'gerente', 'usuario')) DEFAULT 'usuario',
  status_do_convite VARCHAR(20) CHECK (status_do_convite IN ('pendente', 'aceito', 'rejeitado')) DEFAULT 'pendente',
  ativo BOOLEAN DEFAULT FALSE,
  token_redefinicao VARCHAR(255),
  token_redefinicao_expira TIMESTAMP WITH TIME ZONE,
  ultimo_login TIMESTAMP WITH TIME ZONE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert the master user
INSERT INTO usuarios (nome, email, senha, papel, status_do_convite, ativo)
VALUES ('Master Admin', 'master@sistema.com', '193045', 'master', 'aceito', TRUE)
ON CONFLICT (email) DO NOTHING;
*/

-- Alternative SQL to create the table with the exact same schema as in the screenshot
/*
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  papel VARCHAR(20) DEFAULT 'usuario',
  status_do_cor VARCHAR(20) DEFAULT 'pendente',
  ativo BOOLEAN DEFAULT FALSE,
  token_de_reir VARCHAR(255),
  reset_token_e VARCHAR(255),
  ultimo_login TIMESTAMP WITH TIME ZONE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert the master user with the exact same values as in the screenshot
INSERT INTO usuarios (id, nome, email, senha, papel, status_do_cor, ativo)
VALUES (1, 'Mestre Admin', 'master@sistema.com', '193045', 'mestre', 'aceito', TRUE)
ON CONFLICT (id) DO NOTHING;
*/
