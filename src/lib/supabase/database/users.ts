
import { supabase } from '../client';
import { User } from '@/types/database';
import { dbGeneric } from './generic';

// Database operations specific to users
export const usersDb = {
  // Get all users
  getAll: async (): Promise<User[]> => {
    return dbGeneric.get<User>('user');  // Changed from 'users' to 'user'
  },
  
  // Get user by ID
  getById: async (id: number): Promise<User[]> => {
    return dbGeneric.get<User>('user', id);  // Changed from 'users' to 'user'
  },
  
  // Get user by email
  getByEmail: async (email: string): Promise<User[]> => {
    return dbGeneric.get<User>('user', undefined, 'email', email);  // Changed from 'users' to 'user'
  },
  
  // Create a new user
  create: async (user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> => {
    return dbGeneric.create<User>('user', user as User);  // Changed from 'users' to 'user'
  },
  
  // Update a user
  update: async (id: number, user: Partial<User>): Promise<User> => {
    return dbGeneric.update<User>('user', id, user);  // Changed from 'users' to 'user'
  },
  
  // Delete a user
  delete: async (id: number): Promise<void> => {
    return dbGeneric.delete('user', id);  // Changed from 'users' to 'user'
  },
  
  // Get pending invitations
  getPendingInvitations: async (): Promise<User[]> => {
    try {
      const { data, error } = await supabase
        .from('user')  // Changed from 'users' to 'user'
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
    return dbGeneric.update<User>('user', id, { 
      invitation_status: status,
      active 
    });
  }
};
