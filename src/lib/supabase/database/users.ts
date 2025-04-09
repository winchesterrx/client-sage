
import { supabase } from '../client';
import { User } from '@/types/database';
import { dbGeneric } from './generic';

// Detecta dinamicamente a tabela de usuários
const detectUserTable = async (): Promise<string> => {
  console.log('Detectando tabela de usuários...');
  try {
    const { error: usuariosError } = await supabase
      .from('usuarios')
      .select('id') // ✅ Substituído por campo válido
      .limit(1);

    if (!usuariosError) {
      console.log('Tabela "usuarios" detectada.');
      return 'usuarios';
    }

    const { error: usersError } = await supabase
      .from('usuarios')
      .select('id')
      .limit(1);

    if (!usersError) {
      console.log('Tabela "users" detectada.');
      return 'users';
    }

    console.warn('Nenhuma tabela detectada. Usando "usuarios" como padrão.');
    return 'usuarios';
  } catch (error) {
    console.error('Erro ao detectar tabela de usuários:', error);
    return 'usuarios';
  }
};

// Tabela padrão
let USER_TABLE = 'usuarios';

// Detecta dinamicamente ao carregar
detectUserTable().then(tableName => {
  USER_TABLE = tableName;
  console.log(`Usando tabela de usuários: "${USER_TABLE}"`);
});

// Exporta todas as operações com usuários
export const usersDb = {
  getAll: async (): Promise<User[]> => {
    return dbGeneric.get<User>(USER_TABLE);
  },

  getById: async (id: number): Promise<User | null> => {
    const users = await dbGeneric.get<User>(USER_TABLE, id);
    return users.length > 0 ? users[0] : null;
  },

  getByEmail: async (email: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from(USER_TABLE)
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (error || !data) return null;

      const user: User = {
        id: data.id,
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        invitation_status: data.invitation_status,
        active: data.active ?? false,
        reset_token: data.reset_token,
        reset_token_expires: data.reset_token_expires,
        last_login: data.last_login,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      return user;
    } catch (error) {
      console.error(`Erro ao buscar usuário por email:`, error);
      return null;
    }
  },

  create: async (user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> => {
    return dbGeneric.create<User>(USER_TABLE, user as User);
  },

  update: async (id: number, user: Partial<User>): Promise<User> => {
    console.log(`[usersDb.update] Atualizando usuário ID ${id} com dados:`, user);
    return dbGeneric.update<User>(USER_TABLE, id, user);
  },

  delete: async (id: number): Promise<void> => {
    return dbGeneric.delete(USER_TABLE, id);
  },

  getPendingInvitations: async (): Promise<User[]> => {
    try {
      const { data, error } = await supabase
        .from(USER_TABLE)
        .select('*')
        .eq('invitation_status', 'pending');

      if (error) throw error;

      return data as User[];
    } catch (error) {
      console.error(`Erro ao buscar convites pendentes:`, error);
      return [];
    }
  },

  updateInvitationStatus: async (
    id: number,
    status: 'accepted' | 'rejected',
    active: boolean
  ): Promise<User> => {
    try {
      console.log(`Atualizando status de convite - ID: ${id}, Status: ${status}, Active: ${active}`);
      
      // IMPORTANTE: Usando a operação de atualização direta do Supabase
      // em vez de usar o dbGeneric para garantir que funcione corretamente
      const { data, error } = await supabase
        .from(USER_TABLE)
        .update({
          invitation_status: status,
          active: active
        })
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        console.error('Erro ao atualizar status do convite:', error);
        throw error;
      }
      
      if (!data) {
        const errorMsg = `Usuário com ID ${id} não encontrado após atualização`;
        console.error(errorMsg);
        throw new Error(errorMsg);
      }

      console.log('Usuário atualizado com sucesso:', data);
      return data as User;
    } catch (error) {
      console.error('Erro ao atualizar status do convite:', error);
      throw error;
    }
  },

  setUserTable: (tableName: string): void => {
    USER_TABLE = tableName;
    console.log(`Tabela de usuários definida para "${USER_TABLE}"`);
  },

  getCurrentTable: (): string => {
    return USER_TABLE;
  }
};
