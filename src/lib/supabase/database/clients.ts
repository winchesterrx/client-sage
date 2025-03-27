
import { Client } from '@/types/database';
import { dbGeneric } from './generic';

export const clientsDb = {
  getAll: () => dbGeneric.get<Client>('clients'),
  getById: (id: number) => dbGeneric.get<Client>('clients', id).then(data => data[0] || null),
  create: (client: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => 
    dbGeneric.create<Client>('clients', client as Client),
  update: (id: number, client: Partial<Client>) => dbGeneric.update<Client>('clients', id, client),
  delete: (id: number) => dbGeneric.delete('clients', id),
};
