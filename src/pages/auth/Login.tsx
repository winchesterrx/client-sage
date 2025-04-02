
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
import { Eye, EyeOff, User } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { checkSupabaseConnection } from '@/lib/supabase/client';
import SetupGuide from '@/components/supabase/SetupGuide';

const loginSchema = z.object({
  email: z.string().email('Digite um email válido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

const Login = () => {
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const [loginError, setLoginError] = useState('');
  const [attemptedEmail, setAttemptedEmail] = useState('');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean | null>(null);
  
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Check Supabase connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      const isConnected = await checkSupabaseConnection();
      setIsSupabaseConnected(isConnected);
      
      if (!isConnected) {
        setConnectionError(
          'Não foi possível conectar ao Supabase. Verifique se suas credenciais estão configuradas corretamente.'
        );
      }
    };
    
    checkConnection();
  }, []);

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setLoginError('');
    setConnectionError(null);
    setAttemptedEmail(values.email);
    console.log('Attempting login with:', values.email);
    
    try {
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      {isSupabaseConnected === false && <SetupGuide />}
      
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
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
              <div className="font-bold mb-1">Erro de Conexão:</div>
              {connectionError}
              <div className="mt-2 text-xs">
                Dica: Verifique se suas credenciais do Supabase estão configuradas corretamente.
                <pre className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto text-xs">
                  {`VITE_SUPABASE_URL=https://cfukngxrvrajjhiagktj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`}
                </pre>
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
                    <p>Dica: Verifique se sua tabela "users" no Supabase está configurada corretamente.</p>
                    <p>Use o SQL abaixo para verificar se o usuário master existe:</p>
                    <pre className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto">
                      {`SELECT * FROM users WHERE email = 'master@sistema.com';`}
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
              Para acessar como Master: master@sistema.com / 1930
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
