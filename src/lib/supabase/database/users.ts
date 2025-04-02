
import { supabase } from '../client';
import { User } from '@/types/database';
import { dbGeneric } from './generic';

// Database operations specific to users
export const usersDb = {
  // Get all users
  getAll: async (): Promise<User[]> => {
    return dbGeneric.get<User>('users');
  },
  
  // Get user by ID
  getById: async (id: number): Promise<User | null> => {
    const users = await dbGeneric.get<User>('users', id);
    return users.length > 0 ? users[0] : null;
  },
  
  // Get user by email
  getByEmail: async (email: string): Promise<User | null> => {
    try {
      console.log('Getting user by email:', email);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching user by email:', error);
        return null;
      }
      
      console.log('User by email result:', data);
      return data as User | null;
    } catch (error) {
      console.error('Exception fetching user by email:', error);
      return null;
    }
  },
  
  // Create a new user
  create: async (user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> => {
    return dbGeneric.create<User>('users', user as User);
  },
  
  // Update a user
  update: async (id: number, user: Partial<User>): Promise<User> => {
    return dbGeneric.update<User>('users', id, user);
  },
  
  // Delete a user
  delete: async (id: number): Promise<void> => {
    return dbGeneric.delete('users', id);
  },
  
  // Get pending invitations
  getPendingInvitations: async (): Promise<User[]> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('invitation_status', 'pending');
        
      if (error) {
        console.error('Error fetching pending invitations:', error);
        throw error;
      }
      
      return data as User[];
    } catch (error) {
      console.error('Error fetching pending invitations:', error);
      return [];
    }
  },
  
  // Accept or reject an invitation
  updateInvitationStatus: async (
    id: number, 
    status: 'accepted' | 'rejected', 
    active: boolean
  ): Promise<User> => {
    return dbGeneric.update<User>('users', id, { 
      invitation_status: status,
      active 
    });
  }
};
