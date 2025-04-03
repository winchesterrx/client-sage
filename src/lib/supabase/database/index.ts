
import { clientsDb } from './clients';
import { servicesDb } from './services';
import { paymentsDb } from './payments';
import { projectsDb } from './projects';
import { tasksDb } from './tasks';
import { attachmentsDb } from './attachments';
import { usersDb } from './users';
import { supabase } from '../client';

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
    }
    
    return { 
      connected: true, 
      tables: tableResults
    };
  } catch (error) {
    console.error('Database check failed:', error);
    return { connected: false, error: 'Failed to connect to database' };
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
  check: checkDatabase
};
