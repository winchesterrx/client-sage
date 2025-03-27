
import { clientsDb } from './clients';
import { servicesDb } from './services';
import { paymentsDb } from './payments';
import { projectsDb } from './projects';
import { tasksDb } from './tasks';
import { attachmentsDb } from './attachments';

// Export all database operations as a single object
export const db = {
  clients: clientsDb,
  services: servicesDb,
  payments: paymentsDb,
  projects: projectsDb,
  tasks: tasksDb,
  attachments: attachmentsDb
};
