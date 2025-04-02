
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client instance with your project URL and anon key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cfukngxrvrajjhiagktj.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmdWtuZ3hydnJhampoaWFna3RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwODQxNzUsImV4cCI6MjA1ODY2MDE3NX0.GwaaQmnmksMuf-W1yeidDQ8OoTcOUJBnUSBPYN06agU';

// Log the Supabase configuration
console.log('Initializing Supabase with:', { 
  url: supabaseUrl,
  keyLength: supabaseKey ? supabaseKey.length : 0
});

// Initialize the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Function to check if Supabase connection is working
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('Checking Supabase connection...');
    
    // Try to query the users table
    const { data, error, count } = await supabase
      .from('usuarios')
      .select('*', { count: 'exact', head: true })
      .limit(1);
    
    if (error) {
      console.error('Error checking Supabase connection:', error);
      return false;
    }
    
    console.log('Supabase connection successful. Row count:', count);
    
    // Check if the 'usuarios' table exists and has data
    const { data: usuariosData, error: usuariosError } = await supabase
      .from('usuarios')
      .select('*')
      .limit(1);
      
    if (usuariosError) {
      console.error('Error querying usuarios table:', usuariosError);
    } else {
      console.log('Usuarios table data sample:', usuariosData);
    }
    
    // Also try the 'users' table to be sure
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
      
    if (usersError) {
      console.error('Error querying users table:', usersError);
    } else {
      console.log('Users table data sample:', usersData);
    }
    
    return true;
  } catch (e) {
    console.error('Exception checking Supabase connection:', e);
    return false;
  }
};

// Export a function to detect which table exists (users or usuarios)
export const detectUserTable = async (): Promise<string> => {
  try {
    // Check usuarios table
    const { data: usuariosData, error: usuariosError } = await supabase
      .from('usuarios')
      .select('count()', { count: 'exact', head: true });
      
    if (!usuariosError) {
      console.log('Usuarios table exists');
      return 'usuarios';
    }
    
    // Check users table
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('count()', { count: 'exact', head: true });
      
    if (!usersError) {
      console.log('Users table exists');
      return 'users';
    }
    
    console.error('Neither users nor usuarios table detected');
    return '';
  } catch (e) {
    console.error('Error detecting user table:', e);
    return '';
  }
};

