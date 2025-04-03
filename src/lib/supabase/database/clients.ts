
import { supabase } from '../client';
import { Client } from '@/types/database';
import { dbGeneric } from './generic';
import { toast } from 'sonner';

export const clientsDb = {
  getAll: async (): Promise<Client[]> => {
    try {
      console.log('Fetching all clients');
      const clients = await dbGeneric.get<Client>('clients');
      return clients;
    } catch (error) {
      console.error('Error fetching all clients:', error);
      toast.error('Erro ao carregar clientes');
      return [];
    }
  },
  
  getById: async (id: number): Promise<Client | null> => {
    try {
      console.log(`Fetching client with ID: ${id}`);
      const clients = await dbGeneric.get<Client>('clients', id);
      return clients.length > 0 ? clients[0] : null;
    } catch (error) {
      console.error(`Error fetching client ${id}:`, error);
      toast.error('Erro ao carregar informações do cliente');
      return null;
    }
  },
  
  getByName: async (name: string): Promise<Client[]> => {
    try {
      console.log(`Searching for clients with name containing: ${name}`);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .ilike('name', `%${name}%`)
        .order('name');
      
      if (error) {
        console.error('Error searching clients by name:', error);
        toast.error('Erro ao pesquisar clientes');
        return [];
      }
      
      return data as Client[];
    } catch (error) {
      console.error('Error searching clients by name:', error);
      toast.error('Erro ao pesquisar clientes');
      return [];
    }
  },
  
  create: async (client: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client> => {
    try {
      console.log('Creating new client:', client);
      const result = await dbGeneric.create<Client>('clients', client as Client);
      toast.success('Cliente criado com sucesso');
      return result;
    } catch (error) {
      console.error('Error creating client:', error);
      toast.error('Erro ao criar cliente');
      throw error;
    }
  },
  
  update: async (id: number, client: Partial<Client>): Promise<Client> => {
    try {
      console.log(`Updating client ${id}:`, client);
      const result = await dbGeneric.update<Client>('clients', id, client);
      toast.success('Cliente atualizado com sucesso');
      return result;
    } catch (error) {
      console.error(`Error updating client ${id}:`, error);
      toast.error('Erro ao atualizar cliente');
      throw error;
    }
  },
  
  delete: async (id: number): Promise<void> => {
    try {
      console.log(`Deleting client ${id}`);
      await dbGeneric.delete('clients', id);
      toast.success('Cliente excluído com sucesso');
    } catch (error) {
      console.error(`Error deleting client ${id}:`, error);
      toast.error('Erro ao excluir cliente');
      throw error;
    }
  },
};
