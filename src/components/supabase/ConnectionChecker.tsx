
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { checkSupabaseConnection } from '@/lib/supabase/client';
import { supabase } from '@/lib/supabase/client';

const ConnectionChecker = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null);
  const [usersTableStatus, setUsersTableStatus] = useState<boolean | null>(null);
  const [masterUserStatus, setMasterUserStatus] = useState<boolean | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  
  const checkConnection = async () => {
    setIsChecking(true);
    setErrorDetails(null);
    
    try {
      // Check basic connection
      const isConnected = await checkSupabaseConnection();
      setConnectionStatus(isConnected);
      
      if (!isConnected) {
        setErrorDetails('Failed to connect to Supabase. Check your URL and API key.');
        setIsChecking(false);
        return;
      }
      
      // Check if users table exists
      const { data: tableExists, error: tableError } = await supabase
        .from('users')
        .select('id')
        .limit(1);
      
      if (tableError) {
        setUsersTableStatus(false);
        setErrorDetails(`Users table error: ${tableError.message}`);
      } else {
        setUsersTableStatus(true);
      }
      
      // Check if master user exists
      const { data: masterUser, error: masterError } = await supabase
        .from('users')
        .select('*')
        .eq('email', 'master@sistema.com')
        .maybeSingle();
      
      if (masterError) {
        setMasterUserStatus(false);
        setErrorDetails(`Master user query error: ${masterError.message}`);
      } else if (!masterUser) {
        setMasterUserStatus(false);
        setErrorDetails('Master user does not exist in the users table.');
      } else {
        setMasterUserStatus(true);
        console.log('Master user found:', masterUser);
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
            <span>Tabela 'users' existe:</span>
            {isChecking ? (
              <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
            ) : usersTableStatus === null ? (
              <span>Verificando...</span>
            ) : usersTableStatus ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
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
        
        <div className="flex justify-end mt-4">
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
