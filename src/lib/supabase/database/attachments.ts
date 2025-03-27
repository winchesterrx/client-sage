
import { Attachment } from '@/types/database';
import { dbGeneric } from './generic';

export const attachmentsDb = {
  getAll: () => dbGeneric.get<Attachment>('attachments'),
  getByRelated: (relatedType: string, relatedId: number) => 
    dbGeneric.get<Attachment>('attachments', undefined, 'related_id', relatedId)
      .then(data => data.filter(item => item.related_type === relatedType)),
  getById: (id: number) => dbGeneric.get<Attachment>('attachments', id).then(data => data[0] || null),
  create: (attachment: Omit<Attachment, 'id' | 'created_at' | 'updated_at'>) => 
    dbGeneric.create<Attachment>('attachments', attachment as Attachment),
  delete: (id: number) => dbGeneric.delete('attachments', id),
};
