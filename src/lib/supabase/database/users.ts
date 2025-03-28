
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
  getById: async (id: number): Promise<User[]> => {
    return dbGeneric.get<User>('users', id);
  },
  
  // Get user by email
  getByEmail: async (email: string): Promise<User[]> => {
    return dbGeneric.get<User>('users', undefined, 'email', email);
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
