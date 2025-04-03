
import { Project } from '@/types/database';
import { dbGeneric } from './generic';
import { supabase } from '../client';
import { toast } from 'sonner';

export const projectsDb = {
  getAll: () => dbGeneric.get<Project>('projects'),
  
  getByClient: async (clientId: number): Promise<Project[]> => {
    try {
      console.log(`Fetching projects for client ID: ${clientId}`);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('client_id', clientId)
        .order('start_date', { ascending: false });
      
      if (error) {
        console.error(`Error fetching projects for client ${clientId}:`, error);
        toast.error('Erro ao carregar projetos do cliente');
        return [];
      }
      
      return data as Project[] || [];
    } catch (error) {
      console.error(`Error fetching projects for client ${clientId}:`, error);
      toast.error('Erro ao carregar projetos do cliente');
      return [];
    }
  },
  
  getById: (id: number) => dbGeneric.get<Project>('projects', id).then(data => data[0] || null),
  create: (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => 
    dbGeneric.create<Project>('projects', project as Project),
  update: (id: number, project: Partial<Project>) => dbGeneric.update<Project>('projects', id, project),
  delete: (id: number) => dbGeneric.delete('projects', id),
};
