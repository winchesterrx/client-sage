
import { Payment } from '@/types/database';
import { dbGeneric } from './generic';

export const paymentsDb = {
  getAll: () => dbGeneric.get<Payment>('payments'),
  getByClient: (clientId: number) => dbGeneric.get<Payment>('payments', undefined, 'client_id', clientId),
  getByService: (serviceId: number) => dbGeneric.get<Payment>('payments', undefined, 'service_id', serviceId),
  getById: (id: number) => dbGeneric.get<Payment>('payments', id).then(data => data[0] || null),
  create: (payment: Omit<Payment, 'id' | 'created_at' | 'updated_at'>) => 
    dbGeneric.create<Payment>('payments', payment as Payment),
  update: (id: number, payment: Partial<Payment>) => dbGeneric.update<Payment>('payments', id, payment),
  delete: (id: number) => dbGeneric.delete('payments', id),
};
