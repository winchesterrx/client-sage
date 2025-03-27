
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client instance with your project URL and anon key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://seu-projeto.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sua-chave-anon-key';

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
