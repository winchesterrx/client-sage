
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import ConnectionChecker from './ConnectionChecker';

const SetupGuide = () => {
  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <ConnectionChecker />
      
      <Card>
        <CardHeader>
          <CardTitle>Configure o Supabase</CardTitle>
          <CardDescription>
            Você precisa configurar o Supabase para que o sistema funcione corretamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">1. Crie um projeto no Supabase</h3>
            <p className="text-sm text-gray-500">
              Acesse o site do Supabase, crie uma conta e um novo projeto.
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold">2. Atualize as variáveis de ambiente</h3>
            <p className="text-sm text-gray-500">
              Edite o arquivo .env.local na raiz do projeto e adicione as suas credenciais do Supabase:
            </p>
            <pre className="bg-gray-100 p-2 rounded text-xs">
              VITE_SUPABASE_URL=https://seu-projeto.supabase.co<br/>
              VITE_SUPABASE_ANON_KEY=sua-chave-anon-key
            </pre>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold">3. Execute o script SQL</h3>
            <p className="text-sm text-gray-500">
              No painel do Supabase, vá para o SQL Editor e execute o script SQL para criar a tabela de usuários:
            </p>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
{`-- Criar a tabela users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) CHECK (role IN ('admin', 'master', 'manager', 'user')) DEFAULT 'user',
  invitation_status VARCHAR(20) CHECK (invitation_status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  active BOOLEAN DEFAULT FALSE,
  reset_token VARCHAR(255),
  reset_token_expires TIMESTAMP WITH TIME ZONE,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inserir o usuário master
INSERT INTO users (name, email, password, role, invitation_status, active)
VALUES ('Master Admin', 'master@sistema.com', '1930', 'master', 'accepted', TRUE)
ON CONFLICT (email) DO NOTHING;`}
            </pre>
          </div>
          
          <div className="flex justify-end space-x-4 mt-4">
            <Button asChild variant="outline">
              <a 
                href="https://supabase.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <span>Acessar Supabase</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
            <Button asChild>
              <a 
                href="https://docs.lovable.dev/integrations/supabase/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <span>Documentação</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SetupGuide;
