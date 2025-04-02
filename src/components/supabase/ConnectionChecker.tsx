
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle, RefreshCw, Database, Table } from 'lucide-react';
import { checkSupabaseConnection, detectUserTable, supabase } from '@/lib/supabase/client';
import { toast } from '@/hooks/use-toast';

const ConnectionChecker = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null);
  const [usersTableStatus, setUsersTableStatus] = useState<boolean | null>(null);
  const [userTableName, setUserTableName] = useState<string | null>(null);
  const [masterUserStatus, setMasterUserStatus] = useState<boolean | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [dbSchema, setDbSchema] = useState<any[]>([]);
  
  const checkConnection = async () => {
    setIsChecking(true);
    setErrorDetails(null);
    setDbSchema([]);
    
    try {
      // Check basic connection
      const isConnected = await checkSupabaseConnection();
      setConnectionStatus(isConnected);
      
      if (!isConnected) {
        setErrorDetails('Failed to connect to Supabase. Check your URL and API key.');
        setIsChecking(false);
        return;
      }
      
      // Detect which table to use
      const tableName = await detectUserTable();
      setUserTableName(tableName);
      
      if (!tableName) {
        setUsersTableStatus(false);
        setErrorDetails('Could not detect a valid users table (neither "users" nor "usuarios" found)');
        setIsChecking(false);
        return;
      }
      
      setUsersTableStatus(true);
      
      // Check if the master user exists
      const { data: masterUser, error: masterError } = await supabase
        .from(tableName)
        .select('*')
        .eq('email', 'master@sistema.com')
        .maybeSingle();
      
      if (masterError) {
        setMasterUserStatus(false);
        setErrorDetails(`Master user query error: ${masterError.message}`);
      } else if (!masterUser) {
        setMasterUserStatus(false);
        setErrorDetails(`Master user does not exist in the "${tableName}" table.`);
      } else {
        setMasterUserStatus(true);
        console.log('Master user found:', masterUser);
      }
      
      // Get table schema
      const { data: schemaData, error: schemaError } = await supabase
        .rpc('get_table_schema', { table_name: tableName });
        
      if (!schemaError && schemaData) {
        setDbSchema(schemaData);
        console.log('Table schema:', schemaData);
      } else {
        console.error('Error getting table schema:', schemaError);
        
        // Fallback: try to get some data from the table to infer schema
        const { data: sampleData, error: sampleError } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
          
        if (!sampleError && sampleData && sampleData.length > 0) {
          const inferredSchema = Object.keys(sampleData[0]).map(column => ({
            column_name: column,
            data_type: typeof sampleData[0][column]
          }));
          
          setDbSchema(inferredSchema);
          console.log('Inferred schema from data:', inferredSchema);
        }
      }
    } catch (error: any) {
      setErrorDetails(`Unexpected error: ${error.message}`);
    } finally {
      setIsChecking(false);
    }
  };
  
  useEffect(() => {
    checkConnection();
  }, []);
  
  const createRpcFunction = async () => {
    try {
      toast({
        title: "Criando função auxiliar",
        description: "Tentando criar função RPC no Supabase...",
      });
      
      // Create RPC function for getting table schema
      const { error } = await supabase.rpc('create_schema_function');
      
      if (error) {
        console.error('Error creating schema function:', error);
        toast({
          title: "Erro",
          description: `Não foi possível criar a função: ${error.message}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sucesso",
          description: "Função RPC criada com sucesso. Tente verificar a conexão novamente.",
        });
      }
    } catch (error: any) {
      console.error('Exception creating schema function:', error);
      toast({
        title: "Erro",
        description: `Exceção ao criar função: ${error.message}`,
        variant: "destructive",
      });
    }
  };
  
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Status da Conexão Supabase</CardTitle>
        <CardDescription>
          Verifique se sua aplicação está conectada corretamente ao Supabase
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
            <span>Conexão básica com Supabase:</span>
            {isChecking ? (
              <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
            ) : connectionStatus === null ? (
              <span>Verificando...</span>
            ) : connectionStatus ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
          </div>
          
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
            <span>Tabela de usuários detectada:</span>
            {isChecking ? (
              <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
            ) : usersTableStatus === null ? (
              <span>Verificando...</span>
            ) : usersTableStatus ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-500">{userTableName}</span>
              </div>
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
          </div>
          
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
            <span>Usuário master existe:</span>
            {isChecking ? (
              <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
            ) : masterUserStatus === null ? (
              <span>Verificando...</span>
            ) : masterUserStatus ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
          </div>
        </div>
        
        {errorDetails && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Erro Detectado</AlertTitle>
            <AlertDescription className="text-sm">
              {errorDetails}
              
              <div className="mt-2 text-xs bg-gray-800 text-white p-3 rounded overflow-x-auto">
                <p>Verifique suas variáveis de ambiente:</p>
                <pre className="mt-1">VITE_SUPABASE_URL=https://cfukngxrvrajjhiagktj.supabase.co</pre>
                <pre>VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</pre>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {dbSchema.length > 0 && (
          <div className="mt-4 border rounded-md overflow-hidden">
            <div className="bg-gray-100 p-2 flex items-center gap-2">
              <Table className="h-4 w-4" />
              <span className="font-semibold">Estrutura da Tabela {userTableName}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">Coluna</th>
                    <th className="px-4 py-2 text-left">Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  {dbSchema.map((column, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-2 border-t">{column.column_name}</td>
                      <td className="px-4 py-2 border-t">{column.data_type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        <div className="flex justify-end gap-2 mt-4">
          <Button 
            variant="outline" 
            onClick={createRpcFunction} 
            disabled={isChecking}
            className="flex items-center gap-2"
          >
            <Database className="h-4 w-4" />
            <span>Criar Funções Auxiliares</span>
          </Button>
          
          <Button onClick={checkConnection} disabled={isChecking} className="flex items-center gap-2">
            {isChecking ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span>{isChecking ? 'Verificando...' : 'Verificar Conexão'}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectionChecker;
