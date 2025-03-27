import { createClient } from '@supabase/supabase-js';
import { Client, Service, Payment, Project, Task, Attachment } from '@/types/database';

// Create a Supabase client instance with your project URL and anon key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://seu-projeto.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sua-chave-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Function to handle timestamps
// Define a type that includes the timestamp properties we want to modify
type WithTimestamps = {
  created_at?: string;
  updated_at?: string;
  [key: string]: any;  // Allow other properties
};

const handleTimestamps = <T extends WithTimestamps>(item: T): T => {
  const now = new Date().toISOString();
  
  // Make sure timestamps are in ISO format for compatibility
  if (!item.created_at) {
    item.created_at = now;
  }
  
  item.updated_at = now;
  
  return item;
};

// Function to convert Supabase results to the expected format
const mapResultData = <T>(data: T[] | null | undefined): T[] => {
  if (!data) return []; // Return empty array if data is null or undefined
  
  return data.map(item => {
    // Convert timestamps to ISO string if they are in Date format
    if (item) {
      if ((item as any).created_at instanceof Date) {
        (item as any).created_at = (item as any).created_at.toISOString();
      }
      if ((item as any).updated_at instanceof Date) {
        (item as any).updated_at = (item as any).updated_at.toISOString();
      }
    }
    return item;
  });
};

// Database operations
export const db = {
  // Generic operations
  get: async <T>(table: string, id?: number, queryKey?: string, queryValue?: any): Promise<T[]> => {
    try {
      let query = supabase.from(table).select('*');
      
      if (id) {
        query = query.eq('id', id);
      } else if (queryKey && queryValue) {
        query = query.eq(queryKey, queryValue);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      return mapResultData(data) as T[];
    } catch (error) {
      console.error(`Error fetching data from ${table}:`, error);
      // Return empty array on error instead of throwing
      return [];
    }
  },
  
  create: async <T extends WithTimestamps>(table: string, item: T): Promise<T> => {
    try {
      const preparedItem = handleTimestamps(item);
      
      const { data, error } = await supabase
        .from(table)
        .insert(preparedItem)
        .select();
      
      if (error) {
        throw error;
      }
      
      return data[0] as T;
    } catch (error) {
      console.error(`Error creating item in ${table}:`, error);
      throw error;
    }
  },
  
  update: async <T extends WithTimestamps>(table: string, id: number, item: Partial<T>): Promise<T> => {
    try {
      const preparedItem = handleTimestamps(item as T);
      
      const { data, error } = await supabase
        .from(table)
        .update(preparedItem)
        .eq('id', id)
        .select();
      
      if (error) {
        throw error;
      }
      
      return data[0] as T;
    } catch (error) {
      console.error(`Error updating item in ${table}:`, error);
      throw error;
    }
  },
  
  delete: async (table: string, id: number): Promise<void> => {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error(`Error deleting item from ${table}:`, error);
      throw error;
    }
  },
  
  // Specific entity operations
  clients: {
    getAll: () => db.get<Client>('clients'),
    getById: (id: number) => db.get<Client>('clients', id).then(data => data[0] || null),
    create: (client: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => 
      db.create<Client>('clients', client as Client),
    update: (id: number, client: Partial<Client>) => db.update<Client>('clients', id, client),
    delete: (id: number) => db.delete('clients', id),
  },
  
  services: {
    getAll: () => db.get<Service>('services'),
    getByClient: (clientId: number) => db.get<Service>('services', undefined, 'client_id', clientId),
    getById: (id: number) => db.get<Service>('services', id).then(data => data[0] || null),
    create: (service: Omit<Service, 'id' | 'created_at' | 'updated_at'>) => 
      db.create<Service>('services', service as Service),
    update: (id: number, service: Partial<Service>) => db.update<Service>('services', id, service),
    delete: (id: number) => db.delete('services', id),
  },
  
  payments: {
    getAll: () => db.get<Payment>('payments'),
    getByClient: (clientId: number) => db.get<Payment>('payments', undefined, 'client_id', clientId),
    getByService: (serviceId: number) => db.get<Payment>('payments', undefined, 'service_id', serviceId),
    getById: (id: number) => db.get<Payment>('payments', id).then(data => data[0] || null),
    create: (payment: Omit<Payment, 'id' | 'created_at' | 'updated_at'>) => 
      db.create<Payment>('payments', payment as Payment),
    update: (id: number, payment: Partial<Payment>) => db.update<Payment>('payments', id, payment),
    delete: (id: number) => db.delete('payments', id),
  },
  
  projects: {
    getAll: () => db.get<Project>('projects'),
    getByClient: (clientId: number) => db.get<Project>('projects', undefined, 'client_id', clientId),
    getById: (id: number) => db.get<Project>('projects', id).then(data => data[0] || null),
    create: (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => 
      db.create<Project>('projects', project as Project),
    update: (id: number, project: Partial<Project>) => db.update<Project>('projects', id, project),
    delete: (id: number) => db.delete('projects', id),
  },
  
  tasks: {
    getAll: () => db.get<Task>('tasks'),
    getByProject: (projectId: number) => db.get<Task>('tasks', undefined, 'project_id', projectId),
    getById: (id: number) => db.get<Task>('tasks', id).then(data => data[0] || null),
    create: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => 
      db.create<Task>('tasks', task as Task),
    update: (id: number, task: Partial<Task>) => db.update<Task>('tasks', id, task),
    delete: (id: number) => db.delete('tasks', id),
  },
  
  attachments: {
    getAll: () => db.get<Attachment>('attachments'),
    getByRelated: (relatedType: string, relatedId: number) => 
      db.get<Attachment>('attachments', undefined, 'related_id', relatedId)
        .then(data => data.filter(item => item.related_type === relatedType)),
    getById: (id: number) => db.get<Attachment>('attachments', id).then(data => data[0] || null),
    create: (attachment: Omit<Attachment, 'id' | 'created_at' | 'updated_at'>) => 
      db.create<Attachment>('attachments', attachment as Attachment),
    delete: (id: number) => db.delete('attachments', id),
  }
};

// Function to upload files to Supabase storage
export const uploadFile = async (
  file: File,
  bucketName: string,
  path: string
): Promise<string> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      throw error;
    }
    
    // Return the file path in Supabase
    return data.path;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Function to get public URL of a file
export const getPublicUrl = (bucketName: string, path: string): string => {
  const { data } = supabase.storage.from(bucketName).getPublicUrl(path);
  return data.publicUrl;
};
