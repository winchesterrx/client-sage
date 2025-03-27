
import { Service } from '@/types/database';
import { dbGeneric } from './generic';

export const servicesDb = {
  getAll: () => dbGeneric.get<Service>('services'),
  getByClient: (clientId: number) => dbGeneric.get<Service>('services', undefined, 'client_id', clientId),
  getById: (id: number) => dbGeneric.get<Service>('services', id).then(data => data[0] || null),
  create: (service: Omit<Service, 'id' | 'created_at' | 'updated_at'>) => 
    dbGeneric.create<Service>('services', service as Service),
  update: (id: number, service: Partial<Service>) => dbGeneric.update<Service>('services', id, service),
  delete: (id: number) => dbGeneric.delete('services', id),
};
