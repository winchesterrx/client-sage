
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client instance with your project URL and anon key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cfukngxrvrajjhiagktj.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmdWtuZ3hydnJhampoaWFna3RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwODQxNzUsImV4cCI6MjA1ODY2MDE3NX0.GwaaQmnmksMuf-W1yeidDQ8OoTcOUJBnUSBPYN06agU';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Function to check if Supabase connection is working
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('clients').select('count', { count: 'exact', head: true });
    return !error;
  } catch (e) {
    console.error('Error checking Supabase connection:', e);
    return false;
  }
};
