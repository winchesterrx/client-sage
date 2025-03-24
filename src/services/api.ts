
import { toast } from "sonner";

// API endpoint para seu backend PHP
const API_ENDPOINT = "https://xofome.online/api";
const FORCE_OFFLINE_MODE = false;

// Função para lidar com erros de API
const handleError = (error: any) => {
  console.error("API Error:", error);
  
  let errorMessage = "Ocorreu um erro ao processar sua solicitação.";
  if (error.response?.data?.message) {
    errorMessage = error.response.data.message;
  } else if (error.message) {
    errorMessage = error.message;
  }
  
  toast.error(errorMessage);
  throw error;
};

// Wrapper genérico fetch com tratamento de erro e timeout
async function fetchWithTimeout(url: string, options: RequestInit, timeout = 8000) {
  const controller = new AbortController();
  const { signal } = controller;
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    console.log(`Fetching ${url} with method ${options.method || 'GET'}`);
    const response = await fetch(url, { ...options, signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error(`Response not OK: ${response.status} ${response.statusText}`);
      const errorData = await response.json().catch(() => ({
        message: `HTTP error ${response.status}: ${response.statusText}`
      }));
      throw { 
        status: response.status, 
        statusText: response.statusText,
        response: { data: errorData } 
      };
    }
    
    return await response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.error(`Fetch error for ${url}:`, error);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  }
}

// Função para inicializar o banco de dados
export const initializeDatabase = async () => {
  try {
    console.log("Starting database initialization...");
    // Verificar conexão com o backend
    const isBackendAvailable = await checkBackendConnection();
    
    if (!isBackendAvailable && !FORCE_OFFLINE_MODE) {
      console.warn("Backend connection failed, using fallback mode");
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

// Função para verificar a conexão com o backend
export const checkBackendConnection = async (retries = 2): Promise<boolean> => {
  // Se FORCE_OFFLINE_MODE for true, sempre retorne false
  if (FORCE_OFFLINE_MODE) {
    console.log("Forced offline mode is enabled, skipping backend connection check");
    return false;
  }
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`Checking backend connection (attempt ${attempt + 1}/${retries + 1})...`);
      // Usando um endpoint simples que deve retornar rapidamente
      const response = await fetch(`${API_ENDPOINT}/healthcheck.php`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        // Timeout curto para verificação de saúde
        signal: AbortSignal.timeout(3000)
      });
      
      if (response.ok) {
        console.log("Backend connection successful");
        return true;
      }
      
      console.warn(`Backend check failed with status: ${response.status}`);
    } catch (error: any) {
      console.warn(`Backend connection attempt ${attempt + 1} failed:`, error);
      if (attempt < retries) {
        // Esperar um pouco antes de tentar novamente
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  console.error("All backend connection attempts failed");
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

// Funções de API que se conectam ao backend PHP
export const api = {
  // Operações CRUD genéricas para o backend PHP
  get: async <T>(endpoint: string): Promise<T> => {
    try {
      // Remover parâmetros de consulta para o log do console
      const endpointBase = endpoint.split('?')[0];
      console.log(`API GET request to ${endpointBase}`);
      
      // Verificar se o backend está disponível
      const isBackendAvailable = await checkBackendConnection(0); // Verificação rápida, sem novas tentativas
      
      if (!isBackendAvailable) {
        console.warn(`Backend unavailable, using mock data for GET ${endpoint}`);
        // Extrair tipo de recurso do endpoint (por exemplo, 'clients' de 'clients?id=1')
        const resource = endpoint.split('?')[0].split('.')[0];
        
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
      
      const url = `${API_ENDPOINT}/${endpoint}`;
      return await fetchWithTimeout(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      return handleError(error);
    }
  },
  
  post: async <T>(endpoint: string, data: any): Promise<T> => {
    try {
      console.log(`API POST request to ${endpoint}`, data);
      
      // Verificar se o backend está disponível
      const isBackendAvailable = await checkBackendConnection(0);
      
      if (!isBackendAvailable) {
        console.warn(`Backend unavailable, using mock data for POST ${endpoint}`);
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
      
      const url = `${API_ENDPOINT}/${endpoint}`;
      const result = await fetchWithTimeout(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      toast.success("Item criado com sucesso!");
      return result;
    } catch (error) {
      return handleError(error);
    }
  },
  
  put: async <T>(endpoint: string, data: any): Promise<T> => {
    try {
      console.log(`API PUT request to ${endpoint}`, data);
      
      // Verificar se o backend está disponível
      const isBackendAvailable = await checkBackendConnection(0);
      
      if (!isBackendAvailable) {
        console.warn(`Backend unavailable, using mock data for PUT ${endpoint}`);
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
      
      const [resource, id] = endpoint.split('/');
      const url = `${API_ENDPOINT}/${resource}.php?id=${id}`;
      const result = await fetchWithTimeout(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      toast.success("Item atualizado com sucesso!");
      return result;
    } catch (error) {
      return handleError(error);
    }
  },
  
  delete: async (endpoint: string): Promise<void> => {
    try {
      console.log(`API DELETE request to ${endpoint}`);
      
      // Verificar se o backend está disponível
      const isBackendAvailable = await checkBackendConnection(0);
      
      if (!isBackendAvailable) {
        console.warn(`Backend unavailable, using mock data for DELETE ${endpoint}`);
        const [resource, idStr] = endpoint.split('/');
        const id = parseInt(idStr);
        
        await mockData.delete(resource, id);
        toast.success("Item excluído com sucesso!");
        return;
      }
      
      const [resource, id] = endpoint.split('/');
      const url = `${API_ENDPOINT}/${resource}.php?id=${id}`;
      await fetchWithTimeout(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      toast.success("Item excluído com sucesso!");
    } catch (error) {
      handleError(error);
    }
  },
  
  // Funções específicas de domínio
  clients: {
    getAll: () => api.get<any[]>('clients.php'),
    getById: (id: number) => api.get<any>(`clients.php?id=${id}`),
    create: (data: any) => api.post<any>('clients.php', data),
    update: (id: number, data: any) => api.put<any>(`clients/${id}`, data),
    delete: (id: number) => api.delete(`clients/${id}`),
  },
  
  services: {
    getAll: () => api.get<any[]>('services.php'),
    getByClient: (clientId: number) => api.get<any[]>(`services.php?client_id=${clientId}`),
    getById: (id: number) => api.get<any>(`services.php?id=${id}`),
    create: (data: any) => api.post<any>('services.php', data),
    update: (id: number, data: any) => api.put<any>(`services/${id}`, data),
    delete: (id: number) => api.delete(`services/${id}`),
  },
  
  payments: {
    getAll: () => api.get<any[]>('payments.php'),
    getByClient: (clientId: number) => api.get<any[]>(`payments.php?client_id=${clientId}`),
    getByService: (serviceId: number) => api.get<any[]>(`payments.php?service_id=${serviceId}`),
    getById: (id: number) => api.get<any>(`payments.php?id=${id}`),
    create: (data: any) => api.post<any>('payments.php', data),
    update: (id: number, data: any) => api.put<any>(`payments/${id}`, data),
    delete: (id: number) => api.delete(`payments/${id}`),
  },
  
  projects: {
    getAll: () => api.get<any[]>('projects.php'),
    getByClient: (clientId: number) => api.get<any[]>(`projects.php?client_id=${clientId}`),
    getById: (id: number) => api.get<any>(`projects.php?id=${id}`),
    create: (data: any) => api.post<any>('projects.php', data),
    update: (id: number, data: any) => api.put<any>(`projects/${id}`, data),
    delete: (id: number) => api.delete(`projects/${id}`),
  },
  
  tasks: {
    getAll: () => api.get<any[]>('tasks.php'),
    getByProject: (projectId: number) => api.get<any[]>(`tasks.php?project_id=${projectId}`),
    getById: (id: number) => api.get<any>(`tasks.php?id=${id}`),
    create: (data: any) => api.post<any>('tasks.php', data),
    update: (id: number, data: any) => api.put<any>(`tasks/${id}`, data),
    delete: (id: number) => api.delete(`tasks/${id}`),
  },
  
  attachments: {
    getAll: () => api.get<any[]>('attachments.php'),
    getByRelated: (relatedType: string, relatedId: number) => 
      api.get<any[]>(`attachments.php?related_type=${relatedType}&related_id=${relatedId}`),
    getById: (id: number) => api.get<any>(`attachments.php?id=${id}`),
    create: (data: any) => api.post<any>('attachments.php', data),
    delete: (id: number) => api.delete(`attachments/${id}`),
  }
};
