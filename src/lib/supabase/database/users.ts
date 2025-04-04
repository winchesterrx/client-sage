import { supabase } from '../client';
import { User } from '@/types/database';
import { dbGeneric } from './generic';

// Dynamic detection of the user table
const detectUserTable = async (): Promise<string> => {
  console.log('Detecting user table...');
  try {
    // Try 'usuarios' table first
    const { data: usuariosCheck, error: usuariosError } = await supabase
      .from('usuarios')
      .select('count(*)')
      .limit(1);
    
    if (!usuariosError) {
      console.log('Found "usuarios" table');
      return 'usuarios';
    }
    
    // Try 'users' table next
    const { data: usersCheck, error: usersError } = await supabase
      .from('users')
      .select('count(*)')
      .limit(1);
    
    if (!usersError) {
      console.log('Found "users" table');
      return 'users';
    }
    
    // If neither exists, default to 'usuarios'
    console.warn('No user table detected, defaulting to "usuarios"');
    return 'usuarios';
  } catch (error) {
    console.error('Error detecting user table:', error);
    return 'usuarios'; // Default to usuarios in case of error
  }
};

// Initialize the table name
let USER_TABLE = 'usuarios';

// Initialize the table detection
detectUserTable().then(tableName => {
  USER_TABLE = tableName;
  console.log(`Using "${USER_TABLE}" as the user table`);
});

// Database operations specific to users
export const usersDb = {
  // Get all users
  getAll: async (): Promise<User[]> => {
    return dbGeneric.get<User>(USER_TABLE);
  },
  
  // Get user by ID
  getById: async (id: number): Promise<User | null> => {
    const users = await dbGeneric.get<User>(USER_TABLE, id);
    return users.length > 0 ? users[0] : null;
  },
  
  // Get user by email - improved version with better error handling
  getByEmail: async (email: string): Promise<User | null> => {
    try {
      console.log(`Searching for user with email: ${email} in table: ${USER_TABLE}`);
      const { data, error } = await supabase
        .from(USER_TABLE)
        .select('*')
        .eq('email', email)
        .maybeSingle();
      
      if (error) {
        console.error(`Error fetching user by email from ${USER_TABLE}:`, error);
        return null;
      }
      
      if (!data) {
        console.log(`No user found with email ${email}`);
        return null;
      }
      
      // Map database fields to User type if needed
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
        updated_at: data.updated_at
      };
      
      console.log(`User retrieval result:`, user);
      return user;
    } catch (error) {
      console.error(`Exception fetching user by email from ${USER_TABLE}:`, error);
      return null;
    }
  },
  
  // Create a new user
  create: async (user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> => {
    return dbGeneric.create<User>(USER_TABLE, user as User);
  },
  
  // Update a user
  update: async (id: number, user: Partial<User>): Promise<User> => {
    return dbGeneric.update<User>(USER_TABLE, id, user);
  },
  
  // Delete a user
  delete: async (id: number): Promise<void> => {
    return dbGeneric.delete(USER_TABLE, id);
  },
  
  // Get pending invitations
  getPendingInvitations: async (): Promise<User[]> => {
    try {
      const { data, error } = await supabase
        .from(USER_TABLE)
        .select('*')
        .eq('invitation_status', 'pending');
        
      if (error) {
        console.error(`Error fetching pending invitations from ${USER_TABLE}:`, error);
        throw error;
      }
      
      return data as User[];
    } catch (error) {
      console.error(`Error fetching pending invitations from ${USER_TABLE}:`, error);
      return [];
    }
  },
  
  // Accept or reject an invitation
  updateInvitationStatus: async (
    id: number, 
    status: 'accepted' | 'rejected', 
    active: boolean
  ): Promise<User> => {
    try {
      const { data, error } = await supabase
        .from(USER_TABLE)
        .update({ 
          invitation_status: status,
          active 
        })
        .eq('id', id)
        .select()
        .single();
        
      if (error) {
        console.error(`Error updating invitation status in ${USER_TABLE}:`, error);
        throw error;
      }
      
      return data as User;
    } catch (error) {
      console.error(`Error updating invitation status:`, error);
      throw error;
    }
  },
  
  // Set the user table dynamically 
  setUserTable: (tableName: string): void => {
    USER_TABLE = tableName;
    console.log(`User table set to "${USER_TABLE}"`);
  },
  
  // Get the current table name
  getCurrentTable: (): string => {
    return USER_TABLE;
  }
};
