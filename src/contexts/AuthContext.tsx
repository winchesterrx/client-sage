import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types/database';
import { auth } from '@/lib/supabase/auth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  register: (user: Omit<User, 'id' | 'created_at' | 'updated_at' | 'reset_token' | 'reset_token_expires' | 'last_login' | 'active'>) => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = auth.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    try {
      const result = await auth.login(email, password);
      
      if (result.success && result.user) {
        setUser(result.user);
        toast({
          title: "Login bem-sucedido",
          description: "Bem-vindo de volta!",
        });
        navigate('/dashboard');
        return { success: true, message: "Login bem-sucedido" };
      } else {
        toast({
          title: "Falha no login",
          description: result.message,
          variant: "destructive",
        });
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro durante o login. Tente novamente.",
        variant: "destructive",
      });
      return { success: false, message: "Ocorreu um erro durante o login. Tente novamente." };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    auth.logout();
    setUser(null);
    toast({
      title: "Logout bem-sucedido",
      description: "Você saiu da sua conta.",
    });
    navigate('/login');
  };

  const register = async (userData: Omit<User, 'id' | 'created_at' | 'updated_at' | 'reset_token' | 'reset_token_expires' | 'last_login' | 'active'>): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await auth.register(userData);
      
      if (result.success) {
        toast({
          title: "Registro bem-sucedido",
          description: "Sua conta foi criada. Você pode fazer login agora.",
        });
        navigate('/login');
        return true;
      } else {
        toast({
          title: "Falha no registro",
          description: result.message,
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro durante o registro. Tente novamente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const requestPasswordReset = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await auth.requestPasswordReset(email);
      
      if (result.success) {
        toast({
          title: "Solicitação enviada",
          description: result.message,
        });
        return true;
      } else {
        toast({
          title: "Falha na solicitação",
          description: result.message,
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Password reset request error:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao solicitar a redefinição de senha. Tente novamente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await auth.resetPassword(token, newPassword);
      
      if (result.success) {
        toast({
          title: "Senha redefinida",
          description: result.message,
        });
        navigate('/login');
        return true;
      } else {
        toast({
          title: "Falha na redefinição",
          description: result.message,
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao redefinir a senha. Tente novamente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    requestPasswordReset,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
