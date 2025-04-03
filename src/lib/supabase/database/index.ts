
import { clientsDb } from './clients';
import { servicesDb } from './services';
import { paymentsDb } from './payments';
import { projectsDb } from './projects';
import { tasksDb } from './tasks';
import { attachmentsDb } from './attachments';
import { usersDb } from './users';
import { supabase } from '../client';
import { toast } from 'sonner';

// Função para checar relações entre as tabelas
const checkRelations = async () => {
  try {
    // Verifica a relação entre clientes e serviços
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('id, client_id')
      .limit(1);
      
    if (servicesError) {
      console.error('Erro ao verificar relação entre clientes e serviços:', servicesError);
      return false;
    }
    
    // Verifica a relação entre serviços e pagamentos
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('id, service_id, client_id')
      .limit(1);
      
    if (paymentsError) {
      console.error('Erro ao verificar relação entre serviços e pagamentos:', paymentsError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao verificar relações entre tabelas:', error);
    return false;
  }
};

// Function to check database connection and table existence
export const checkDatabase = async () => {
  try {
    // Test connection
    const { data, error } = await supabase.from('clients').select('count(*)', { count: 'exact' });
    
    if (error) {
      console.error('Database connection test failed:', error);
      return { connected: false, error: error.message };
    }
    
    // Check essential tables
    const tables = ['clients', 'services', 'payments', 'projects', 'tasks'];
    const tableResults = {};
    
    for (const table of tables) {
      const { error: tableError } = await supabase.from(table).select('count(*)', { count: 'exact' });
      tableResults[table] = !tableError;
      
      if (tableError) {
        console.error(`Error checking table ${table}:`, tableError);
      }
    }
    
    // Verifica relações entre tabelas
    const relationsOk = await checkRelations();
    
    return { 
      connected: true, 
      tables: tableResults,
      relationsOk
    };
  } catch (error) {
    console.error('Database check failed:', error);
    return { connected: false, error: 'Failed to connect to database' };
  }
};

// Função para atualizar status de pagamentos pendentes que estão atrasados
export const updateOverduePayments = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Atualizar pagamentos com data de vencimento anterior à data atual e status 'pending' para 'overdue'
    const { data, error } = await supabase
      .from('payments')
      .update({ status: 'overdue' })
      .lt('due_date', today)
      .eq('status', 'pending');
      
    if (error) {
      console.error('Error updating overdue payments:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateOverduePayments:', error);
    return false;
  }
};

// Função para obter resumo financeiro
export const getFinancialSummary = async () => {
  try {
    // Obter total de pagamentos pagos
    const { data: paidData, error: paidError } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'paid');
      
    if (paidError) throw paidError;
    
    // Obter total de pagamentos pendentes
    const { data: pendingData, error: pendingError } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'pending');
      
    if (pendingError) throw pendingError;
    
    // Obter total de pagamentos atrasados
    const { data: overdueData, error: overdueError } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'overdue');
      
    if (overdueError) throw overdueError;
    
    // Calcular totais
    const paidTotal = paidData.reduce((sum, item) => sum + Number(item.amount), 0);
    const pendingTotal = pendingData.reduce((sum, item) => sum + Number(item.amount), 0);
    const overdueTotal = overdueData.reduce((sum, item) => sum + Number(item.amount), 0);
    
    return {
      received: paidTotal,
      expected: pendingTotal,
      overdue: overdueTotal,
      total: paidTotal + pendingTotal + overdueTotal
    };
  } catch (error) {
    console.error('Error getting financial summary:', error);
    toast.error('Erro ao carregar resumo financeiro');
    return {
      received: 0,
      expected: 0,
      overdue: 0,
      total: 0
    };
  }
};

// Export all database operations as a single object
export const db = {
  clients: clientsDb,
  services: servicesDb,
  payments: paymentsDb,
  projects: projectsDb,
  tasks: tasksDb,
  attachments: attachmentsDb,
  users: usersDb,
  check: checkDatabase,
  updateOverduePayments,
  getFinancialSummary
};
