
import { supabase } from '../client';
import { Payment } from '@/types/database';
import { dbGeneric } from './generic';
import { toast } from 'sonner';

export const paymentsDb = {
  getAll: async (): Promise<Payment[]> => {
    try {
      const payments = await dbGeneric.get<Payment>('payments');
      return payments;
    } catch (error) {
      console.error('Error fetching all payments:', error);
      toast.error('Erro ao carregar pagamentos');
      return [];
    }
  },
  
  getByClient: async (clientId: number): Promise<Payment[]> => {
    try {
      console.log(`Fetching payments for client ID: ${clientId}`);
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('client_id', clientId)
        .order('due_date', { ascending: false });
      
      if (error) {
        console.error('Error fetching payments by client:', error);
        toast.error('Erro ao carregar pagamentos do cliente');
        return [];
      }
      
      return data as Payment[];
    } catch (error) {
      console.error('Error fetching payments by client:', error);
      toast.error('Erro ao carregar pagamentos do cliente');
      return [];
    }
  },
  
  getByService: async (serviceId: number): Promise<Payment[]> => {
    try {
      console.log(`Fetching payments for service ID: ${serviceId}`);
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('service_id', serviceId)
        .order('due_date', { ascending: false });
      
      if (error) {
        console.error('Error fetching payments by service:', error);
        toast.error('Erro ao carregar pagamentos do serviço');
        return [];
      }
      
      return data as Payment[];
    } catch (error) {
      console.error('Error fetching payments by service:', error);
      toast.error('Erro ao carregar pagamentos do serviço');
      return [];
    }
  },
  
  getById: async (id: number): Promise<Payment | null> => {
    try {
      const payments = await dbGeneric.get<Payment>('payments', id);
      return payments.length > 0 ? payments[0] : null;
    } catch (error) {
      console.error(`Error fetching payment with ID ${id}:`, error);
      toast.error('Erro ao carregar detalhes do pagamento');
      return null;
    }
  },
  
  create: async (payment: Omit<Payment, 'id' | 'created_at' | 'updated_at'>): Promise<Payment> => {
    try {
      console.log('Creating payment with data:', payment);
      const result = await dbGeneric.create<Payment>('payments', payment as Payment);
      toast.success('Pagamento registrado com sucesso');
      return result;
    } catch (error) {
      console.error('Error creating payment:', error);
      toast.error('Erro ao registrar pagamento');
      throw error;
    }
  },
  
  update: async (id: number, payment: Partial<Payment>): Promise<Payment> => {
    try {
      console.log(`Updating payment ${id} with data:`, payment);
      const result = await dbGeneric.update<Payment>('payments', id, payment);
      toast.success('Pagamento atualizado com sucesso');
      return result;
    } catch (error) {
      console.error(`Error updating payment ${id}:`, error);
      toast.error('Erro ao atualizar pagamento');
      throw error;
    }
  },
  
  delete: async (id: number): Promise<void> => {
    try {
      console.log(`Deleting payment with ID: ${id}`);
      await dbGeneric.delete('payments', id);
      toast.success('Pagamento excluído com sucesso');
    } catch (error) {
      console.error(`Error deleting payment ${id}:`, error);
      toast.error('Erro ao excluir pagamento');
      throw error;
    }
  },
};
