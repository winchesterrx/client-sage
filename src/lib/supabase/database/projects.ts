
import { Project } from '@/types/database';
import { dbGeneric } from './generic';

export const projectsDb = {
  getAll: () => dbGeneric.get<Project>('projects'),
  getByClient: (clientId: number) => dbGeneric.get<Project>('projects', undefined, 'client_id', clientId),
  getById: (id: number) => dbGeneric.get<Project>('projects', id).then(data => data[0] || null),
  create: (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => 
    dbGeneric.create<Project>('projects', project as Project),
  update: (id: number, project: Partial<Project>) => dbGeneric.update<Project>('projects', id, project),
  delete: (id: number) => dbGeneric.delete('projects', id),
};
