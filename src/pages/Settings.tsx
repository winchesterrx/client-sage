
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { databaseSchema } from '@/types/database';

const Settings = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-500 mt-1">Gerencie as configurações do sistema</p>
      </div>
      
      <Card className="bg-white shadow-sm border">
        <CardHeader>
          <CardTitle>Informações do Banco de Dados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Host</h3>
                <p>clientesowl-db.mysql.uhserver.com</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Nome do Banco</h3>
                <p>clientesowl_db</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Usuário</h3>
                <p>gsilva1930</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Conectado (Simulado)</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white shadow-sm border">
        <CardHeader>
          <CardTitle>Schema SQL do Banco de Dados</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            Caso seja necessário recriar o banco de dados, utilize o script SQL abaixo.
          </p>
          <pre className="bg-gray-900 text-white p-4 rounded-md overflow-auto text-xs">
            {databaseSchema}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
