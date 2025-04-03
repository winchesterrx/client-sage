
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
      
      console.log(`Found ${data?.length || 0} projects for client ${clientId}`);
      return data as Project[] || [];
    } catch (error) {
      console.error(`Error fetching projects for client ${clientId}:`, error);
      toast.error('Erro ao carregar projetos do cliente');
      return [];
    }
  },
  
  getById: (id: number) => dbGeneric.get<Project>('projects', id).then(data => data[0] || null),
  
  create: async (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> => {
    try {
      console.log('Creating new project:', project);
      const result = await dbGeneric.create<Project>('projects', project as Project);
      toast.success('Projeto criado com sucesso');
      return result;
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Erro ao criar projeto');
      throw error;
    }
  },
  
  update: async (id: number, project: Partial<Project>): Promise<Project> => {
    try {
      console.log(`Updating project ${id}:`, project);
      const result = await dbGeneric.update<Project>('projects', id, project);
      toast.success('Projeto atualizado com sucesso');
      return result;
    } catch (error) {
      console.error(`Error updating project ${id}:`, error);
      toast.error('Erro ao atualizar projeto');
      throw error;
    }
  },
  
  delete: async (id: number): Promise<void> => {
    try {
      console.log(`Deleting project ${id}`);
      await dbGeneric.delete('projects', id);
      toast.success('Projeto excluído com sucesso');
    } catch (error) {
      console.error(`Error deleting project ${id}:`, error);
      toast.error('Erro ao excluir projeto');
      throw error;
    }
  }
};
