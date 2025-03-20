
import { toast } from "sonner";

// This mock API service will be replaced with actual PHP backend calls
// For now, we'll use localStorage to simulate persistence

const API_ENDPOINT = "http://your-server-endpoint/api";

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Error handler
const handleError = (error: any) => {
  console.error("API Error:", error);
  toast.error("Ocorreu um erro ao processar sua solicitação.");
  throw error;
};

// Generic fetch wrapper with error handling
async function fetchWithTimeout(url: string, options: RequestInit, timeout = 8000) {
  const controller = new AbortController();
  const { signal } = controller;
  
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { ...options, signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  }
}

// Load data from localStorage
const loadFromStorage = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return [];
  }
};

// Save data to localStorage
const saveToStorage = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

// Generic CRUD operations
export const api = {
  // Generic functions
  get: async <T>(endpoint: string): Promise<T> => {
    try {
      // For demonstration, we'll use localStorage instead of actual API calls
      await delay(300); // Simulate network delay
      
      const storageKey = endpoint.split('/')[0];
      const id = endpoint.split('/')[1];
      
      const items = loadFromStorage<any>(storageKey);
      
      if (id) {
        const item = items.find(item => item.id === parseInt(id));
        if (!item) throw new Error(`Item with ID ${id} not found`);
        return item as T;
      }
      
      return items as unknown as T;
    } catch (error) {
      return handleError(error);
    }
  },
  
  post: async <T>(endpoint: string, data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T> => {
    try {
      await delay(500); // Simulate network delay
      
      const storageKey = endpoint;
      const items = loadFromStorage<any>(storageKey);
      
      const newId = items.length > 0 ? Math.max(...items.map((item: any) => item.id)) + 1 : 1;
      const timestamp = new Date().toISOString();
      
      const newItem = {
        id: newId,
        ...data,
        created_at: timestamp,
        updated_at: timestamp
      };
      
      items.push(newItem);
      saveToStorage(storageKey, items);
      
      toast.success("Item criado com sucesso!");
      return newItem as T;
    } catch (error) {
      return handleError(error);
    }
  },
  
  put: async <T>(endpoint: string, data: Partial<T> & { id: number }): Promise<T> => {
    try {
      await delay(500); // Simulate network delay
      
      const [storageKey, id] = endpoint.split('/');
      const items = loadFromStorage<any>(storageKey);
      
      const index = items.findIndex((item: any) => item.id === parseInt(id));
      if (index === -1) throw new Error(`Item with ID ${id} not found`);
      
      const updatedItem = {
        ...items[index],
        ...data,
        updated_at: new Date().toISOString()
      };
      
      items[index] = updatedItem;
      saveToStorage(storageKey, items);
      
      toast.success("Item atualizado com sucesso!");
      return updatedItem as T;
    } catch (error) {
      return handleError(error);
    }
  },
  
  delete: async (endpoint: string): Promise<void> => {
    try {
      await delay(500); // Simulate network delay
      
      const [storageKey, id] = endpoint.split('/');
      const items = loadFromStorage<any>(storageKey);
      
      const filteredItems = items.filter((item: any) => item.id !== parseInt(id));
      if (filteredItems.length === items.length) {
        throw new Error(`Item with ID ${id} not found`);
      }
      
      saveToStorage(storageKey, filteredItems);
      toast.success("Item excluído com sucesso!");
    } catch (error) {
      handleError(error);
    }
  },

  // Domain-specific functions
  clients: {
    getAll: () => api.get<any[]>('clients'),
    getById: (id: number) => api.get<any>(`clients/${id}`),
    create: (data: any) => api.post<any>('clients', data),
    update: (id: number, data: any) => api.put<any>(`clients/${id}`, { id, ...data }),
    delete: (id: number) => api.delete(`clients/${id}`),
  },
  
  services: {
    getAll: () => api.get<any[]>('services'),
    getByClient: (clientId: number) => api.get<any[]>('services').then(services => 
      services.filter(service => service.client_id === clientId)
    ),
    getById: (id: number) => api.get<any>(`services/${id}`),
    create: (data: any) => api.post<any>('services', data),
    update: (id: number, data: any) => api.put<any>(`services/${id}`, { id, ...data }),
    delete: (id: number) => api.delete(`services/${id}`),
  },
  
  payments: {
    getAll: () => api.get<any[]>('payments'),
    getByClient: (clientId: number) => api.get<any[]>('payments').then(payments => 
      payments.filter(payment => payment.client_id === clientId)
    ),
    getByService: (serviceId: number) => api.get<any[]>('payments').then(payments => 
      payments.filter(payment => payment.service_id === serviceId)
    ),
    getById: (id: number) => api.get<any>(`payments/${id}`),
    create: (data: any) => api.post<any>('payments', data),
    update: (id: number, data: any) => api.put<any>(`payments/${id}`, { id, ...data }),
    delete: (id: number) => api.delete(`payments/${id}`),
  },
  
  projects: {
    getAll: () => api.get<any[]>('projects'),
    getByClient: (clientId: number) => api.get<any[]>('projects').then(projects => 
      projects.filter(project => project.client_id === clientId)
    ),
    getById: (id: number) => api.get<any>(`projects/${id}`),
    create: (data: any) => api.post<any>('projects', data),
    update: (id: number, data: any) => api.put<any>(`projects/${id}`, { id, ...data }),
    delete: (id: number) => api.delete(`projects/${id}`),
  },
  
  tasks: {
    getAll: () => api.get<any[]>('tasks'),
    getByProject: (projectId: number) => api.get<any[]>('tasks').then(tasks => 
      tasks.filter(task => task.project_id === projectId)
    ),
    getById: (id: number) => api.get<any>(`tasks/${id}`),
    create: (data: any) => api.post<any>('tasks', data),
    update: (id: number, data: any) => api.put<any>(`tasks/${id}`, { id, ...data }),
    delete: (id: number) => api.delete(`tasks/${id}`),
  },
  
  attachments: {
    getAll: () => api.get<any[]>('attachments'),
    getByRelated: (relatedType: string, relatedId: number) => api.get<any[]>('attachments').then(attachments => 
      attachments.filter(attachment => 
        attachment.related_type === relatedType && attachment.related_id === relatedId
      )
    ),
    getById: (id: number) => api.get<any>(`attachments/${id}`),
    create: (data: any) => api.post<any>('attachments', data),
    delete: (id: number) => api.delete(`attachments/${id}`),
  },
};

// Optional: Initialize with some sample data if storage is empty
export const initializeDatabase = () => {
  // Add sample data if the storage is empty
  if (!localStorage.getItem('clients')) {
    saveToStorage('clients', [
      {
        id: 1,
        name: 'Empresa ABC',
        city: 'São Paulo',
        phone: '11 98765-4321',
        email: 'contato@empresaabc.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Loja XYZ',
        city: 'Rio de Janeiro',
        phone: '21 91234-5678',
        email: 'atendimento@lojaxyz.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]);
  }

  if (!localStorage.getItem('services')) {
    saveToStorage('services', [
      {
        id: 1,
        client_id: 1,
        service_type: 'Website',
        price: 1500.00,
        access_link: 'https://empresaabc.com/admin',
        username: 'admin',
        password: 'abc123',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 2,
        client_id: 2,
        service_type: 'E-commerce',
        price: 2500.00,
        access_link: 'https://lojaxyz.com/painel',
        username: 'admin',
        password: 'xyz456',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]);
  }

  if (!localStorage.getItem('payments')) {
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 1);
    
    saveToStorage('payments', [
      {
        id: 1,
        client_id: 1,
        service_id: 1,
        amount: 150.00,
        payment_date: today.toISOString().split('T')[0],
        due_date: today.toISOString().split('T')[0],
        status: 'paid',
        payment_method: 'Pix',
        notes: 'Mensalidade de hospedagem',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 2,
        client_id: 2,
        service_id: 2,
        amount: 250.00,
        payment_date: null,
        due_date: nextMonth.toISOString().split('T')[0],
        status: 'pending',
        payment_method: null,
        notes: 'Mensalidade de manutenção',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]);
  }
  
  if (!localStorage.getItem('projects')) {
    saveToStorage('projects', [
      {
        id: 1,
        client_id: 1,
        name: 'Redesign do Website',
        description: 'Atualização completa do site com novo design e funcionalidades',
        status: 'in_progress',
        start_date: new Date().toISOString().split('T')[0],
        end_date: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]);
  }
  
  if (!localStorage.getItem('tasks')) {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    saveToStorage('tasks', [
      {
        id: 1,
        project_id: 1,
        name: 'Criar wireframes',
        description: 'Desenvolver wireframes para todas as páginas principais',
        status: 'completed',
        due_date: today.toISOString().split('T')[0],
        priority: 'high',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 2,
        project_id: 1,
        name: 'Implementar novo design',
        description: 'Implementar design responsivo baseado nos wireframes aprovados',
        status: 'in_progress',
        due_date: nextWeek.toISOString().split('T')[0],
        priority: 'high',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]);
  }
};
