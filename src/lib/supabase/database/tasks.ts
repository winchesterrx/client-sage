
import { Task } from '@/types/database';
import { dbGeneric } from './generic';

export const tasksDb = {
  getAll: () => dbGeneric.get<Task>('tasks'),
  getByProject: (projectId: number) => dbGeneric.get<Task>('tasks', undefined, 'project_id', projectId),
  getById: (id: number) => dbGeneric.get<Task>('tasks', id).then(data => data[0] || null),
  create: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => 
    dbGeneric.create<Task>('tasks', task as Task),
  update: (id: number, task: Partial<Task>) => dbGeneric.update<Task>('tasks', id, task),
  delete: (id: number) => dbGeneric.delete('tasks', id),
};
