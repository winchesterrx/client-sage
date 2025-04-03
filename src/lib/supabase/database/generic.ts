
import { supabase } from '../client';
import { handleTimestamps, mapResultData, WithTimestamps } from '../utils';

// Generic database operations
export const dbGeneric = {
  get: async <T>(table: string, id?: number, queryKey?: string, queryValue?: any): Promise<T[]> => {
    try {
      let query = supabase.from(table).select('*');
      
      if (id) {
        query = query.eq('id', id);
      } else if (queryKey && queryValue) {
        query = query.eq(queryKey, queryValue);
      }
      
      // Adicionar ordenação padrão por id, decrescente
      query = query.order('id', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) {
        console.error(`Error in dbGeneric.get for ${table}:`, error);
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
        console.error(`Error in dbGeneric.create for ${table}:`, error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        throw new Error(`No data returned after insert to ${table}`);
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
        console.error(`Error in dbGeneric.update for ${table}:`, error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        throw new Error(`No data returned after update to ${table} with id ${id}`);
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
        console.error(`Error in dbGeneric.delete for ${table}:`, error);
        throw error;
      }
    } catch (error) {
      console.error(`Error deleting item from ${table}:`, error);
      throw error;
    }
  },
  
  // Nova função para verificar se um registro existe
  exists: async (table: string, id: number): Promise<boolean> => {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .eq('id', id);
        
      if (error) {
        console.error(`Error in dbGeneric.exists for ${table}:`, error);
        throw error;
      }
      
      return count !== null && count > 0;
    } catch (error) {
      console.error(`Error checking if item exists in ${table}:`, error);
      return false;
    }
  }
};
