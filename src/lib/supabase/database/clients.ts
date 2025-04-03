import { supabase } from '../client';
import { Client, Service, Payment, Project } from '@/types/database';
import { dbGeneric } from './generic';
import { toast } from 'sonner';
import { servicesDb } from './services';
import { paymentsDb } from './payments';
import { projectsDb } from './projects';

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
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error(`Error fetching client ${id}:`, error);
        toast.error('Erro ao carregar informações do cliente');
        return null;
      }
      
      return data as Client;
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
  
  // Método aprimorado para obter cliente com todos os serviços, pagamentos e projetos
  getWithDetails: async (id: number): Promise<{
    client: Client | null,
    services: Service[],
    payments: Payment[],
    projects: Project[]
  }> => {
    try {
      console.log(`Fetching client with full details, ID: ${id}`);
      const client = await clientsDb.getById(id);
      
      if (!client) {
        return { 
          client: null, 
          services: [], 
          payments: [], 
          projects: [] 
        };
      }
      
      // Buscar serviços relacionados ao cliente (usando método otimizado)
      const services = await servicesDb.getByClient(id);
      
      // Buscar pagamentos relacionados ao cliente
      const payments = await paymentsDb.getByClient(id);
      
      // Buscar projetos relacionados ao cliente
      const projects = await projectsDb.getByClient(id);
      
      console.log(`Found ${services.length} services, ${payments.length} payments, and ${projects.length} projects for client ${id}`);
      
      return { 
        client, 
        services: services || [], 
        payments: payments || [], 
        projects: projects || [] 
      };
    } catch (error) {
      console.error(`Error in getWithDetails for client ${id}:`, error);
      toast.error('Erro ao carregar detalhes completos do cliente');
      return { 
        client: null, 
        services: [], 
        payments: [], 
        projects: [] 
      };
    }
  }
};
