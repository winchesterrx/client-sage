
import { supabase } from '../client';
import { User } from '@/types/database';
import { dbGeneric } from './generic';

// Determine which table to use for users
let USER_TABLE = 'usuarios';  // Based on the screenshot, this is the correct table name

// Database operations specific to users
export const usersDb = {
  // Get all users
  getAll: async (): Promise<User[]> => {
    console.log(`Getting all users from ${USER_TABLE} table`);
    return dbGeneric.get<User>(USER_TABLE);
  },
  
  // Get user by ID
  getById: async (id: number): Promise<User | null> => {
    console.log(`Getting user by ID ${id} from ${USER_TABLE} table`);
    const users = await dbGeneric.get<User>(USER_TABLE, id);
    return users.length > 0 ? users[0] : null;
  },
  
  // Get user by email
  getByEmail: async (email: string): Promise<User | null> => {
    try {
      console.log(`Getting user by email: ${email} from ${USER_TABLE} table`);
      
      // Debug: Log the SQL query being constructed
      console.log(`Equivalent query: SELECT * FROM ${USER_TABLE} WHERE email = '${email}'`);
      
      const { data, error } = await supabase
        .from(USER_TABLE)
        .select('*')
        .eq('email', email)
        .maybeSingle();
      
      if (error) {
        console.error(`Error fetching user by email from ${USER_TABLE}:`, error);
        return null;
      }
      
      console.log(`User by email result from ${USER_TABLE}:`, data);
      return data as User | null;
    } catch (error) {
      console.error(`Exception fetching user by email from ${USER_TABLE}:`, error);
      return null;
    }
  },
  
  // Create a new user
  create: async (user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> => {
    console.log(`Creating user in ${USER_TABLE} table:`, user);
    return dbGeneric.create<User>(USER_TABLE, user as User);
  },
  
  // Update a user
  update: async (id: number, user: Partial<User>): Promise<User> => {
    console.log(`Updating user ${id} in ${USER_TABLE} table:`, user);
    return dbGeneric.update<User>(USER_TABLE, id, user);
  },
  
  // Delete a user
  delete: async (id: number): Promise<void> => {
    console.log(`Deleting user ${id} from ${USER_TABLE} table`);
    return dbGeneric.delete(USER_TABLE, id);
  },
  
  // Get pending invitations
  getPendingInvitations: async (): Promise<User[]> => {
    try {
      console.log(`Getting pending invitations from ${USER_TABLE} table`);
      
      const { data, error } = await supabase
        .from(USER_TABLE)
        .select('*')
        .eq('invitation_status', 'pending');
        
      if (error) {
        console.error(`Error fetching pending invitations from ${USER_TABLE}:`, error);
        throw error;
      }
      
      console.log(`Pending invitations from ${USER_TABLE}:`, data);
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
    console.log(`Updating invitation status for user ${id} in ${USER_TABLE} table:`, { status, active });
    return dbGeneric.update<User>(USER_TABLE, id, { 
      invitation_status: status,
      active 
    });
  },
  
  // Set the user table dynamically 
  setUserTable: (tableName: string): void => {
    console.log(`Changing user table from ${USER_TABLE} to ${tableName}`);
    USER_TABLE = tableName;
  }
};

