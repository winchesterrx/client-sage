
import { supabase } from '../client';
import { Service } from '@/types/database';
import { dbGeneric } from './generic';
import { toast } from 'sonner';

export const servicesDb = {
  getAll: async (): Promise<Service[]> => {
    try {
      console.log('Fetching all services');
      const services = await dbGeneric.get<Service>('services');
      return services;
    } catch (error) {
      console.error('Error fetching all services:', error);
      toast.error('Erro ao carregar serviços');
      return [];
    }
  },
  
  getByClient: async (clientId: number): Promise<Service[]> => {
    try {
      console.log(`Fetching services for client ID: ${clientId}`);
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error(`Error fetching services for client ${clientId}:`, error);
        toast.error('Erro ao carregar serviços do cliente');
        return [];
      }
      
      console.log(`Found ${data.length} services for client ${clientId}`);
      return data as Service[];
    } catch (error) {
      console.error(`Error fetching services for client ${clientId}:`, error);
      toast.error('Erro ao carregar serviços do cliente');
      return [];
    }
  },
  
  getById: async (id: number): Promise<Service | null> => {
    try {
      const services = await dbGeneric.get<Service>('services', id);
      return services.length > 0 ? services[0] : null;
    } catch (error) {
      console.error(`Error fetching service ${id}:`, error);
      toast.error('Erro ao carregar informações do serviço');
      return null;
    }
  },
  
  create: async (service: Omit<Service, 'id' | 'created_at' | 'updated_at'>): Promise<Service> => {
    try {
      console.log('Creating new service:', service);
      const result = await dbGeneric.create<Service>('services', service as Service);
      toast.success('Serviço criado com sucesso');
      return result;
    } catch (error) {
      console.error('Error creating service:', error);
      toast.error('Erro ao criar serviço');
      throw error;
    }
  },
  
  update: async (id: number, service: Partial<Service>): Promise<Service> => {
    try {
      console.log(`Updating service ${id}:`, service);
      const result = await dbGeneric.update<Service>('services', id, service);
      toast.success('Serviço atualizado com sucesso');
      return result;
    } catch (error) {
      console.error(`Error updating service ${id}:`, error);
      toast.error('Erro ao atualizar serviço');
      throw error;
    }
  },
  
  delete: async (id: number): Promise<void> => {
    try {
      console.log(`Deleting service ${id}`);
      await dbGeneric.delete('services', id);
      toast.success('Serviço excluído com sucesso');
    } catch (error) {
      console.error(`Error deleting service ${id}:`, error);
      toast.error('Erro ao excluir serviço');
      throw error;
    }
  },
};
