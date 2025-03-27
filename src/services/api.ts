import { toast } from "sonner";
import { db, supabase, uploadFile, getPublicUrl } from '@/lib/supabase';
import { Client, Service, Payment, Project, Task, Attachment } from '@/types/database';

// Função para lidar com erros de API
const handleError = (error: any) => {
  console.error("API Error:", error);
  
  let errorMessage = "Ocorreu um erro ao processar sua solicitação.";
  if (error.message) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }
  
  toast.error(errorMessage);
  throw error;
};

// Função para inicializar o banco de dados
export const initializeDatabase = async () => {
  try {
    console.log("Starting database initialization...");
    // Verificar conexão com o Supabase
    const isSupabaseAvailable = await checkSupabaseConnection();
    
    if (!isSupabaseAvailable) {
      console.warn("Supabase connection failed, using fallback mode");
      createMockData();
      return false;
    }
    
    console.log("Database successfully initialized");
    return true;
  } catch (error) {
    console.error("Error initializing database:", error);
    return false;
  }
};

// Função para verificar a conexão com o Supabase
export const checkSupabaseConnection = async (retries = 2): Promise<boolean> => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`Checking Supabase connection (attempt ${attempt + 1}/${retries + 1})...`);
      
      // Tenta fazer uma consulta simples ao Supabase
      const { data, error } = await supabase.from('clients').select('count', { count: 'exact', head: true });
      
      if (!error) {
        console.log("Supabase connection successful");
        return true;
      }
      
      console.warn(`Supabase check failed with error: ${error.message}`);
    } catch (error: any) {
      console.warn(`Supabase connection attempt ${attempt + 1} failed:`, error);
      if (attempt < retries) {
        // Esperar um pouco antes de tentar novamente
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  console.error("All Supabase connection attempts failed");
  return false;
};

// Criar sistema de dados fictícios como fallback
const createMockData = () => {
  // Verificar se já temos dados fictícios
  const hasMockData = localStorage.getItem('mock_data_initialized') === 'true';
  
  if (!hasMockData) {
    // Inicializar estruturas de dados fictícios no localStorage
    if (!localStorage.getItem('mock_clients')) {
      localStorage.setItem('mock_clients', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('mock_services')) {
      localStorage.setItem('mock_services', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('mock_payments')) {
      localStorage.setItem('mock_payments', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('mock_projects')) {
      localStorage.setItem('mock_projects', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('mock_tasks')) {
      localStorage.setItem('mock_tasks', JSON.stringify([]));
    }
    
    localStorage.setItem('mock_data_initialized', 'true');
    console.log('Mock data storage initialized');
  }
  
  return {
    get: async (key: string) => {
      console.log(`[MOCK] Getting data for ${key}`);
      const data = localStorage.getItem(`mock_${key}`);
      return JSON.parse(data || '[]');
    },
    
    save: async (key: string, data: any) => {
      console.log(`[MOCK] Saving data for ${key}`, data);
      localStorage.setItem(`mock_${key}`, JSON.stringify(data));
      return data;
    },
    
    delete: async (key: string, id: number) => {
      console.log(`[MOCK] Deleting item ${id} from ${key}`);
      const items = JSON.parse(localStorage.getItem(`mock_${key}`) || '[]');
      const updatedItems = items.filter((item: any) => item.id !== id);
      localStorage.setItem(`mock_${key}`, JSON.stringify(updatedItems));
    }
  };
};

// Inicializar sistema de dados fictícios
const mockData = createMockData();

// API que se conecta ao Supabase ou fallback para mockData
export const api = {
  // Operações CRUD genéricas
  get: async <T>(endpoint: string): Promise<T> => {
    try {
      // Remover parâmetros de consulta para o log do console
      const endpointBase = endpoint.split('?')[0];
      console.log(`API GET request to ${endpointBase}`);
      
      // Verificar se o Supabase está disponível
      const isSupabaseAvailable = await checkSupabaseConnection(0);
      
      if (!isSupabaseAvailable) {
        console.warn(`Supabase unavailable, using mock data for GET ${endpoint}`);
        // Extrair tipo de recurso do endpoint (por exemplo, 'clients' de 'clients.php?id=1')
        const resource = endpoint.split('.')[0];
        
        // Se estiver consultando um ID específico
        if (endpoint.includes('id=')) {
          const idMatch = endpoint.match(/id=(\d+)/);
          if (idMatch && idMatch[1]) {
            const id = parseInt(idMatch[1]);
            const allItems = await mockData.get(resource);
            const item = allItems.find((item: any) => item.id === id);
            return item as T;
          }
        }
        
        // Se estiver filtrando por outro campo (como client_id)
        if (endpoint.includes('client_id=')) {
          const clientIdMatch = endpoint.match(/client_id=(\d+)/);
          if (clientIdMatch && clientIdMatch[1]) {
            const clientId = parseInt(clientIdMatch[1]);
            const allItems = await mockData.get(resource);
            return allItems.filter((item: any) => item.client_id === clientId) as T;
          }
        }
        
        // Padrão: retornar todos os itens deste recurso
        return await mockData.get(resource) as T;
      }
      
      // Use Supabase client to fetch data
      const resource = endpoint.split('.')[0];
      
      if (endpoint.includes('id=')) {
        const idMatch = endpoint.match(/id=(\d+)/);
        if (idMatch && idMatch[1]) {
          const id = parseInt(idMatch[1]);
          switch (resource) {
            case 'clients': return await db.clients.getById(id) as unknown as T;
            case 'services': return await db.services.getById(id) as unknown as T;
            case 'payments': return await db.payments.getById(id) as unknown as T;
            case 'projects': return await db.projects.getById(id) as unknown as T;
            case 'tasks': return await db.tasks.getById(id) as unknown as T;
            case 'attachments': return await db.attachments.getById(id) as unknown as T;
            default: throw new Error(`Unknown resource: ${resource}`);
          }
        }
      }
      
      if (endpoint.includes('client_id=')) {
        const clientIdMatch = endpoint.match(/client_id=(\d+)/);
        if (clientIdMatch && clientIdMatch[1]) {
          const clientId = parseInt(clientIdMatch[1]);
          switch (resource) {
            case 'services': return await db.services.getByClient(clientId) as unknown as T;
            case 'payments': return await db.payments.getByClient(clientId) as unknown as T;
            case 'projects': return await db.projects.getByClient(clientId) as unknown as T;
            default: throw new Error(`Unknown resource: ${resource}`);
          }
        }
      }
      
      if (endpoint.includes('service_id=')) {
        const serviceIdMatch = endpoint.match(/service_id=(\d+)/);
        if (serviceIdMatch && serviceIdMatch[1]) {
          const serviceId = parseInt(serviceIdMatch[1]);
          switch (resource) {
            case 'payments': return await db.payments.getByService(serviceId) as unknown as T;
            default: throw new Error(`Unknown resource: ${resource}`);
          }
        }
      }
      
      if (endpoint.includes('project_id=')) {
        const projectIdMatch = endpoint.match(/project_id=(\d+)/);
        if (projectIdMatch && projectIdMatch[1]) {
          const projectId = parseInt(projectIdMatch[1]);
          switch (resource) {
            case 'tasks': return await db.tasks.getByProject(projectId) as unknown as T;
            default: throw new Error(`Unknown resource: ${resource}`);
          }
        }
      }
      
      // Default: return all items for this resource
      switch (resource) {
        case 'clients': return await db.clients.getAll() as unknown as T;
        case 'services': return await db.services.getAll() as unknown as T;
        case 'payments': return await db.payments.getAll() as unknown as T;
        case 'projects': return await db.projects.getAll() as unknown as T;
        case 'tasks': return await db.tasks.getAll() as unknown as T;
        case 'attachments': return await db.attachments.getAll() as unknown as T;
        default: throw new Error(`Unknown resource: ${resource}`);
      }
    } catch (error) {
      return handleError(error);
    }
  },
  
  post: async <T>(endpoint: string, data: any): Promise<T> => {
    try {
      console.log(`API POST request to ${endpoint}`, data);
      
      // Verificar se o Supabase está disponível
      const isSupabaseAvailable = await checkSupabaseConnection(0);
      
      if (!isSupabaseAvailable) {
        console.warn(`Supabase unavailable, using mock data for POST ${endpoint}`);
        const resource = endpoint.split('.')[0];
        
        // Obter itens existentes
        const items = await mockData.get(resource);
        
        // Criar novo item com ID autoincremental
        const newId = items.length > 0 ? Math.max(...items.map((item: any) => item.id)) + 1 : 1;
        const newItem = {
          ...data,
          id: newId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Adicionar à coleção e salvar
        items.push(newItem);
        await mockData.save(resource, items);
        
        toast.success("Item criado com sucesso!");
        return newItem as T;
      }
      
      // Use Supabase client to create data
      const resource = endpoint.split('.')[0];
      
      let result;
      switch (resource) {
        case 'clients': 
          result = await db.clients.create(data);
          break;
        case 'services': 
          result = await db.services.create(data);
          break;
        case 'payments': 
          result = await db.payments.create(data);
          break;
        case 'projects': 
          result = await db.projects.create(data);
          break;
        case 'tasks': 
          result = await db.tasks.create(data);
          break;
        case 'attachments': 
          result = await db.attachments.create(data);
          break;
        default: 
          throw new Error(`Unknown resource: ${resource}`);
      }
      
      toast.success("Item criado com sucesso!");
      return result as T;
    } catch (error) {
      return handleError(error);
    }
  },
  
  put: async <T>(endpoint: string, data: any): Promise<T> => {
    try {
      console.log(`API PUT request to ${endpoint}`, data);
      
      // Verificar se o Supabase está disponível
      const isSupabaseAvailable = await checkSupabaseConnection(0);
      
      if (!isSupabaseAvailable) {
        console.warn(`Supabase unavailable, using mock data for PUT ${endpoint}`);
        const [resource, idStr] = endpoint.split('/');
        const id = parseInt(idStr);
        
        // Obter itens existentes
        const items = await mockData.get(resource);
        
        // Atualizar o item
        const updatedItems = items.map((item: any) => 
          item.id === id ? {
            ...item,
            ...data,
            updated_at: new Date().toISOString()
          } : item
        );
        
        await mockData.save(resource, updatedItems);
        const updatedItem = updatedItems.find((item: any) => item.id === id);
        
        toast.success("Item atualizado com sucesso!");
        return updatedItem as T;
      }
      
      // Use Supabase client to update data
      const [resource, idStr] = endpoint.split('/');
      const id = parseInt(idStr);
      
      let result;
      switch (resource) {
        case 'clients': 
          result = await db.clients.update(id, data);
          break;
        case 'services': 
          result = await db.services.update(id, data);
          break;
        case 'payments': 
          result = await db.payments.update(id, data);
          break;
        case 'projects': 
          result = await db.projects.update(id, data);
          break;
        case 'tasks': 
          result = await db.tasks.update(id, data);
          break;
        default: 
          throw new Error(`Unknown resource: ${resource}`);
      }
      
      toast.success("Item atualizado com sucesso!");
      return result as T;
    } catch (error) {
      return handleError(error);
    }
  },
  
  delete: async (endpoint: string): Promise<void> => {
    try {
      console.log(`API DELETE request to ${endpoint}`);
      
      // Verificar se o Supabase está disponível
      const isSupabaseAvailable = await checkSupabaseConnection(0);
      
      if (!isSupabaseAvailable) {
        console.warn(`Supabase unavailable, using mock data for DELETE ${endpoint}`);
        const [resource, idStr] = endpoint.split('/');
        const id = parseInt(idStr);
        
        await mockData.delete(resource, id);
        toast.success("Item excluído com sucesso!");
        return;
      }
      
      // Use Supabase client to delete data
      const [resource, idStr] = endpoint.split('/');
      const id = parseInt(idStr);
      
      switch (resource) {
        case 'clients': 
          await db.clients.delete(id);
          break;
        case 'services': 
          await db.services.delete(id);
          break;
        case 'payments': 
          await db.payments.delete(id);
          break;
        case 'projects': 
          await db.projects.delete(id);
          break;
        case 'tasks': 
          await db.tasks.delete(id);
          break;
        case 'attachments': 
          await db.attachments.delete(id);
          break;
        default: 
          throw new Error(`Unknown resource: ${resource}`);
      }
      
      toast.success("Item excluído com sucesso!");
    } catch (error) {
      handleError(error);
    }
  },
  
  // Funções específicas de domínio
  clients: {
    getAll: () => api.get<Client[]>('clients.php'),
    getById: (id: number) => api.get<Client>(`clients.php?id=${id}`),
    create: (data: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => api.post<Client>('clients.php', data),
    update: (id: number, data: Partial<Client>) => api.put<Client>(`clients/${id}`, data),
    delete: (id: number) => api.delete(`clients/${id}`),
  },
  
  services: {
    getAll: () => api.get<Service[]>('services.php'),
    getByClient: (clientId: number) => api.get<Service[]>(`services.php?client_id=${clientId}`),
    getById: (id: number) => api.get<Service>(`services.php?id=${id}`),
    create: (data: Omit<Service, 'id' | 'created_at' | 'updated_at'>) => api.post<Service>('services.php', data),
    update: (id: number, data: Partial<Service>) => api.put<Service>(`services/${id}`, data),
    delete: (id: number) => api.delete(`services/${id}`),
  },
  
  payments: {
    getAll: () => api.get<Payment[]>('payments.php'),
    getByClient: (clientId: number) => api.get<Payment[]>(`payments.php?client_id=${clientId}`),
    getByService: (serviceId: number) => api.get<Payment[]>(`payments.php?service_id=${serviceId}`),
    getById: (id: number) => api.get<Payment>(`payments.php?id=${id}`),
    create: (data: Omit<Payment, 'id' | 'created_at' | 'updated_at'>) => api.post<Payment>('payments.php', data),
    update: (id: number, data: Partial<Payment>) => api.put<Payment>(`payments/${id}`, data),
    delete: (id: number) => api.delete(`payments/${id}`),
  },
  
  projects: {
    getAll: () => api.get<Project[]>('projects.php'),
    getByClient: (clientId: number) => api.get<Project[]>(`projects.php?client_id=${clientId}`),
    getById: (id: number) => api.get<Project>(`projects.php?id=${id}`),
    create: (data: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => api.post<Project>('projects.php', data),
    update: (id: number, data: Partial<Project>) => api.put<Project>(`projects/${id}`, data),
    delete: (id: number) => api.delete(`projects/${id}`),
  },
  
  tasks: {
    getAll: () => api.get<Task[]>('tasks.php'),
    getByProject: (projectId: number) => api.get<Task[]>(`tasks.php?project_id=${projectId}`),
    getById: (id: number) => api.get<Task>(`tasks.php?id=${id}`),
    create: (data: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => api.post<Task>('tasks.php', data),
    update: (id: number, data: Partial<Task>) => api.put<Task>(`tasks/${id}`, data),
    delete: (id: number) => api.delete(`tasks/${id}`),
  },
  
  attachments: {
    getAll: () => api.get<Attachment[]>('attachments.php'),
    getByRelated: (relatedType: string, relatedId: number) => 
      api.get<Attachment[]>(`attachments.php?related_type=${relatedType}&related_id=${relatedId}`),
    getById: (id: number) => api.get<Attachment>(`attachments.php?id=${id}`),
    create: (data: any) => api.post<any>('attachments.php', data),
    delete: (id: number) => api.delete(`attachments/${id}`),
  }
};
