
import { supabase } from './client';
import { User } from '@/types/database';
import { toast } from '@/hooks/use-toast';

export const auth = {
  // Register a new user
  register: async (user: Omit<User, 'id' | 'created_at' | 'updated_at' | 'reset_token' | 'reset_token_expires' | 'last_login' | 'active'>): Promise<{ success: boolean; message: string; data?: User }> => {
    try {
      // Check if email already exists
      const { data: existingUsers } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email);
      
      if (existingUsers && existingUsers.length > 0) {
        return { success: false, message: 'Email já está em uso.' };
      }
      
      // Insert the new user with pending invitation status
      const { data, error } = await supabase
        .from('users')
        .insert({
          ...user,
          invitation_status: 'pending',
          active: false
        })
        .select();
      
      if (error) {
        throw error;
      }
      
      return { 
        success: true, 
        message: 'Usuário registrado com sucesso! Aguardando aprovação do administrador.', 
        data: data[0] as User 
      };
    } catch (error: any) {
      console.error('Error registering user:', error);
      return { 
        success: false, 
        message: `Erro ao registrar usuário: ${error.message}` 
      };
    }
  },
  
  // Login a user
  login: async (email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> => {
    try {
      console.log('Tentando login com:', { email });
      
      // Primeiro, vamos verificar se o usuário existe, sem verificar a senha
      const { data: userCheck, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (userError || !userCheck) {
        console.log('Usuário não encontrado:', userError);
        return { 
          success: false, 
          message: 'Email não encontrado no sistema.' 
        };
      }
      
      console.log('Usuário encontrado:', userCheck);
      
      // Agora verificamos a senha
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();
      
      if (error || !data) {
        console.log('Senha incorreta:', error);
        return { 
          success: false, 
          message: 'Senha incorreta. Por favor, tente novamente.' 
        };
      }
      
      // Check if user is active and invitation is accepted
      if (!data.active || data.invitation_status !== 'accepted') {
        console.log('Conta inativa ou pendente:', { active: data.active, status: data.invitation_status });
        return {
          success: false,
          message: 'Sua conta está aguardando aprovação ou foi desativada. Entre em contato com o administrador.'
        };
      }
      
      console.log('Login bem-sucedido');
      
      // Update last login time
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.id);
      
      // Store user info in localStorage
      localStorage.setItem('user', JSON.stringify(data));
      
      return { 
        success: true, 
        message: 'Login realizado com sucesso!', 
        user: data as User 
      };
    } catch (error: any) {
      console.error('Erro ao fazer login:', error);
      return { 
        success: false, 
        message: `Erro ao fazer login: ${error.message}` 
      };
    }
  },
  
  // Logout the current user
  logout: () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  },
  
  // Get the current logged in user
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr) as User;
    } catch (e) {
      return null;
    }
  },
  
  // Check if a user is logged in
  isAuthenticated: (): boolean => {
    return !!auth.getCurrentUser();
  },
  
  // Request password reset
  requestPasswordReset: async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      // Generate a unique token and set expiration 24 hours from now
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      
      // Update user with reset token
      const { data, error } = await supabase
        .from('users')
        .update({
          reset_token: token,
          reset_token_expires: expiresAt.toISOString()
        })
        .eq('email', email)
        .eq('active', true)
        .select();
      
      if (error || !data || data.length === 0) {
        return { success: false, message: 'Email não encontrado ou conta inativa.' };
      }
      
      // In a real app, you would send an email with the reset link
      // For demo purposes, we'll just show the token in a toast message
      toast({
        title: "Link de recuperação gerado",
        description: `Token: ${token}`, // In a real app, you wouldn't show this
      });
      
      return {
        success: true,
        message: 'Instruções de recuperação de senha foram enviadas para o seu email.'
      };
    } catch (error: any) {
      console.error('Error requesting password reset:', error);
      return {
        success: false,
        message: `Erro ao solicitar redefinição de senha: ${error.message}`
      };
    }
  },
  
  // Reset password using token
  resetPassword: async (token: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    try {
      // Find user with this token and check if token is still valid
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('reset_token', token)
        .gt('reset_token_expires', now)
        .single();
      
      if (error || !data) {
        return {
          success: false,
          message: 'Token inválido ou expirado.'
        };
      }
      
      // Update user's password and clear token
      const { error: updateError } = await supabase
        .from('users')
        .update({
          password: newPassword, // In a real app, you would hash the password
          reset_token: null,
          reset_token_expires: null
        })
        .eq('id', data.id);
      
      if (updateError) {
        throw updateError;
      }
      
      return {
        success: true,
        message: 'Senha atualizada com sucesso. Você pode fazer login agora.'
      };
    } catch (error: any) {
      console.error('Error resetting password:', error);
      return {
        success: false,
        message: `Erro ao redefinir senha: ${error.message}`
      };
    }
  }
};
