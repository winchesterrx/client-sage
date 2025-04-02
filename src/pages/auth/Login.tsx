
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, User, RefreshCw } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { checkSupabaseConnection, detectUserTable, supabase } from '@/lib/supabase/client';
import SetupGuide from '@/components/supabase/SetupGuide';
import ConnectionChecker from '@/components/supabase/ConnectionChecker';

const loginSchema = z.object({
  email: z.string().email('Digite um email válido'),
  password: z.string().min(1, 'A senha é obrigatória'),
});

const Login = () => {
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const [loginError, setLoginError] = useState('');
  const [attemptedEmail, setAttemptedEmail] = useState('');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean | null>(null);
  const [userTableName, setUserTableName] = useState<string | null>(null);
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Check Supabase connection on component mount
  useEffect(() => {
    checkConnection();
  }, []);
  
  const checkConnection = async () => {
    setIsCheckingConnection(true);
    setConnectionError(null);
    
    try {
      const isConnected = await checkSupabaseConnection();
      setIsSupabaseConnected(isConnected);
      
      if (!isConnected) {
        setConnectionError(
          'Não foi possível conectar ao Supabase. Verifique se suas credenciais estão configuradas corretamente.'
        );
      } else {
        // Detect which table to use
        const tableName = await detectUserTable();
        setUserTableName(tableName);
        
        if (!tableName) {
          setConnectionError(
            'Conexão estabelecida, mas não foi possível encontrar a tabela de usuários (nem "users" nem "usuarios").'
          );
        } else {
          console.log(`Detected user table: ${tableName}`);
          
          // Try to get the master user
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .eq('email', 'master@sistema.com')
            .maybeSingle();
            
          if (error) {
            console.error('Error checking for master user:', error);
            setConnectionError(
              `Tabela "${tableName}" encontrada, mas ocorreu um erro ao buscar o usuário master: ${error.message}`
            );
          } else if (!data) {
            console.warn('Master user not found');
            setConnectionError(
              `Tabela "${tableName}" encontrada, mas o usuário master não foi encontrado.`
            );
          } else {
            console.log('Master user found:', data);
            
            // Pre-fill the form with master credentials
            form.setValue('email', 'master@sistema.com');
            form.setValue('password', data.password || data.senha || '193045');
          }
        }
      }
    } catch (error: any) {
      console.error('Error checking connection:', error);
      setConnectionError(`Erro ao verificar conexão: ${error.message}`);
    } finally {
      setIsCheckingConnection(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setLoginError('');
    setConnectionError(null);
    setAttemptedEmail(values.email);
    console.log('Attempting login with:', values.email);
    
    try {
      // First try direct Supabase query to check if user exists
      const { data: userData, error: userError } = await supabase
        .from(userTableName || 'usuarios')
        .select('*')
        .eq('email', values.email)
        .maybeSingle();
      
      if (userError) {
        console.error('Error checking user directly:', userError);
        toast({
          title: "Erro de consulta",
          description: `Erro ao consultar usuário: ${userError.message}`,
          variant: "destructive",
        });
      } else {
        console.log('Direct query result:', userData);
        
        if (!userData) {
          toast({
            title: "Usuário não encontrado",
            description: `Não foi encontrado usuário com email ${values.email}`,
            variant: "destructive",
          });
        } else {
          console.log('User found in database, proceeding with login');
        }
      }
      
      // Proceed with normal login flow
      const result = await login(values.email, values.password);
      
      if (!result.success) {
        setLoginError(result.message);
        console.log('Login failed:', result.message);
        toast({
          title: "Falha no login",
          description: result.message,
          variant: "destructive",
        });
      } else {
        console.log('Login successful');
        toast({
          title: "Login bem-sucedido",
          description: "Bem-vindo de volta!",
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setConnectionError('Erro de conexão com o servidor. Verifique sua conexão com a internet ou se o servidor Supabase está disponível.');
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor. Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      {(isSupabaseConnected === false || connectionError) && <ConnectionChecker />}
      
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-lg">
              <User className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
          <CardDescription className="text-center">
            Entre com seu email e senha para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {connectionError && (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded mb-4 text-sm">
              <div className="font-bold mb-1">Aviso de Conexão:</div>
              {connectionError}
              <div className="mt-2 text-xs">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs mt-1 bg-amber-100 hover:bg-amber-200"
                  onClick={checkConnection}
                  disabled={isCheckingConnection}
                >
                  {isCheckingConnection ? (
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3 w-3 mr-1" />
                  )}
                  {isCheckingConnection ? 'Verificando...' : 'Verificar Novamente'}
                </Button>
              </div>
            </div>
          )}
          
          {loginError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
              {loginError}
              {loginError.includes('Email não encontrado') && attemptedEmail && (
                <div className="mt-2">
                  <div className="font-bold">Email tentado: {attemptedEmail}</div>
                  <div className="text-xs mt-1">
                    <p>Dica: Verifique se sua tabela "{userTableName || 'usuarios'}" no Supabase está configurada corretamente.</p>
                    <p>Use o SQL abaixo para verificar se o usuário existe:</p>
                    <pre className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto text-xs">
                      {`SELECT * FROM ${userTableName || 'usuarios'} WHERE email = '${attemptedEmail}';`}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="seu@email.com"
                        type="email"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="******"
                          type={showPassword ? "text" : "password"}
                          disabled={isLoading}
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full pr-3 text-gray-400"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Checkbox id="remember" />
                  <label
                    htmlFor="remember"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Lembrar-me
                  </label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-current border-r-transparent rounded-full inline-block animate-spin"></span>
                    <span>Entrando...</span>
                  </div>
                ) : (
                  <span>Entrar</span>
                )}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            <p>
              Não tem uma conta?{" "}
              <Link to="/register" className="text-blue-600 hover:text-blue-500 font-medium">
                Registre-se
              </Link>
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Para acessar como Master: master@sistema.com / 193045
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
