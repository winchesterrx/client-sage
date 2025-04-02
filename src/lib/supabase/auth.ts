import { supabase } from './client';
import { User } from '@/types/database';
import { toast } from '@/hooks/use-toast';
import { usersDb } from './database/users';

export const auth = {
  // Register a new user
  register: async (user: Omit<User, 'id' | 'created_at' | 'updated_at' | 'reset_token' | 'reset_token_expires' | 'last_login' | 'active'>): Promise<{ success: boolean; message: string; data?: User }> => {
    try {
      console.log('Registering user:', user);
      
      // Check if email already exists
      const existingUser = await usersDb.getByEmail(user.email);
      
      console.log('Existing user check:', existingUser);
      
      if (existingUser) {
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
        console.error('Error inserting user:', error);
        throw error;
      }
      
      console.log('User registered successfully:', data);
      
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
      console.log('Attempting login with:', { email });
      
      // Get the user by email
      const user = await usersDb.getByEmail(email);
      
      console.log('User check result:', user);
      
      if (!user) {
        console.log('User not found');
        return { 
          success: false, 
          message: 'Email não encontrado no sistema.' 
        };
      }
      
      console.log('User found:', user);
      
      // Check the password
      if (user.password !== password) {
        console.log('Incorrect password');
        return { 
          success: false, 
          message: 'Senha incorreta. Por favor, tente novamente.' 
        };
      }
      
      // Check if user is active and invitation is accepted
      if (!user.active || user.invitation_status !== 'accepted') {
        console.log('Account inactive or pending:', { active: user.active, status: user.invitation_status });
        return {
          success: false,
          message: 'Sua conta está aguardando aprovação ou foi desativada. Entre em contato com o administrador.'
        };
      }
      
      console.log('Login successful');
      
      // Update last login time
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id);
      
      // Store user info in localStorage
      localStorage.setItem('user', JSON.stringify(user));
      
      return { 
        success: true, 
        message: 'Login realizado com sucesso!', 
        user: user
      };
    } catch (error: any) {
      console.error('Error during login:', error);
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
      // Check if user exists
      const user = await usersDb.getByEmail(email);
      
      if (!user || !user.active) {
        return { success: false, message: 'Email não encontrado ou conta inativa.' };
      }
      
      // Generate a unique token and set expiration 24 hours from now
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      
      // Update user with reset token
      const { error } = await supabase
        .from('users')
        .update({
          reset_token: token,
          reset_token_expires: expiresAt.toISOString()
        })
        .eq('id', user.id);
      
      if (error) {
        console.error('Error setting reset token:', error);
        throw error;
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
          password: newPassword,
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
