import { toast } from "sonner";

// API endpoint for your PHP backend
// Você pode atualizar isso quando tiver o backend hospedado
const API_ENDPOINT = "https://xofome.online/api";


// Modo offline forçado - defina como true para usar sempre o armazenamento local
const FORCE_OFFLINE_MODE = false;

// Helper function to handle API errors
const handleError = (error: any) => {
  console.error("API Error:", error);
  
  let errorMessage = "Ocorreu um erro ao processar sua solicitação.";
  if (error.response && error.response.data && error.response.data.message) {
    errorMessage = error.response.data.message;
  } else if (error.message) {
    errorMessage = error.message;
  }
  
  toast.error(errorMessage);
  
  // Add more detailed logging in development
  if (process.env.NODE_ENV !== 'production') {
    console.log('Error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response
    });
  }
  
  throw error;
};

// Generic fetch wrapper with error handling and retry logic
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

// Function to check backend connection with retry
export const checkBackendConnection = async (retries = 2) => {
  // Se o modo offline estiver forçado, retorna false imediatamente
  if (FORCE_OFFLINE_MODE) {
    console.log("Modo offline forçado ativo, não tentando conexão com o backend");
    return false;
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`Checking backend connection (attempt ${attempt + 1}/${retries + 1})...`);
      
      // Using a simple endpoint that should return quickly
      const response = await fetch(`${API_ENDPOINT}/healthcheck`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        // Short timeout for health check
        signal: AbortSignal.timeout(3000)
      });
      
      if (response.ok) {
        console.log("Backend connection successful");
        return true;
      }
      
      console.warn(`Backend check failed with status: ${response.status}`);
    } catch (error) {
      console.warn(`Backend connection attempt ${attempt + 1} failed:`, error);
      if (attempt < retries) {
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  console.error("All backend connection attempts failed");
  return false;
};

// Function to initialize the database with sample data
export const initializeDatabase = async () => {
  try {
    console.log("Initializing database with sample data...");
    
    // Check if we can connect to the backend
    const isConnected = await checkBackendConnection();
    
    if (!isConnected) {
      console.warn("Backend connection failed, using mock data instead");
      
      // Inicializar dados de exemplo no localStorage
      createMockData();
      
      return false;
    }
    
    console.log("Backend connection successful, database initialized");
    return true;
  } catch (error) {
    console.error("Error initializing database:", error);
    return false;
  }
};

// Create a mock data system as fallback
const createMockData = () => {
  // Check if we already have mock data
  const hasMockData = localStorage.getItem('mock_data_initialized') === 'true';
  
  if (!hasMockData) {
    console.log("Initializing mock data in localStorage...");
    
    // Criar alguns clientes de exemplo
    const mockClients = [
      {
        id: 1,
        name: "Cliente Exemplo 1",
        city: "São Paulo",
        phone: "11999887766",
        email: "cliente1@exemplo.com",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 2,
        name: "Cliente Exemplo 2",
        city: "Rio de Janeiro",
        phone: "21988776655",
        email: "cliente2@exemplo.com",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    // Criar alguns serviços de exemplo
    const mockServices = [
      {
        id: 1,
        client_id: 1,
        service_type: "Website",
        price: 1500,
        access_link: "https://website-cliente1.com",
        username: "admin",
        password: "senha123",
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 2,
        client_id: 2,
        service_type: "Hospedagem",
        price: 50,
        access_link: "https://cpanel-host.com",
        username: "cliente2",
        password: "senha456",
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    // Criar alguns projetos de exemplo
    const mockProjects = [
      {
        id: 1,
        client_id: 1,
        name: "Redesign Website",
        description: "Redesenho completo do website corporativo",
        status: "in_progress",
        start_date: "2023-01-15",
        end_date: "2023-03-30",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    // Salvar dados no localStorage
    localStorage.setItem('mock_clients', JSON.stringify(mockClients));
    localStorage.setItem('mock_services', JSON.stringify(mockServices));
    localStorage.setItem('mock_projects', JSON.stringify(mockProjects));
    localStorage.setItem('mock_payments', JSON.stringify([]));
    localStorage.setItem('mock_tasks', JSON.stringify([]));
    localStorage.setItem('mock_attachments', JSON.stringify([]));
    
    localStorage.setItem('mock_data_initialized', 'true');
    console.log('Mock data initialized with sample data');
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

// Initialize mock data system
const mockData = createMockData();

// API functions that connect to the PHP backend
export const api = {
  // Generic CRUD operations for PHP backend
  get: async <T>(endpoint: string): Promise<T> => {
    try {
      // Remove any query params for the console log
      const endpointBase = endpoint.split('?')[0];
      console.log(`API GET request to ${endpointBase}`);
      
      // Check if backend is available
      const isBackendAvailable = await checkBackendConnection(0); // Quick check, no retries
      
      if (!isBackendAvailable) {
        console.warn(`Backend unavailable, using mock data for GET ${endpoint}`);
        // Extract resource type from endpoint (e.g., 'clients' from 'clients?id=1')
        const resource = endpoint.split('?')[0];
        
        // If querying a specific ID
        if (endpoint.includes('id=')) {
          const idMatch = endpoint.match(/id=(\d+)/);
          if (idMatch && idMatch[1]) {
            const id = parseInt(idMatch[1]);
            const allItems = await mockData.get(resource);
            const item = allItems.find((item: any) => item.id === id);
            return item as T;
          }
        }
        
        // If filtering by another field (like client_id)
        if (endpoint.includes('client_id=')) {
          const clientIdMatch = endpoint.match(/client_id=(\d+)/);
          if (clientIdMatch && clientIdMatch[1]) {
            const clientId = parseInt(clientIdMatch[1]);
            const allItems = await mockData.get(resource);
            return allItems.filter((item: any) => item.client_id === clientId) as T;
          }
        }
        
        // Default: return all items of this resource
        return await mockData.get(resource) as T;
      }
      
      const url = `${API_ENDPOINT}/${endpoint}`;
      return await fetchWithTimeout(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      return handleError(error);
    }
  },
  
  post: async <T>(endpoint: string, data: any): Promise<T> => {
    try {
      console.log(`API POST request to ${endpoint}`, data);
      
      // Check if backend is available
      const isBackendAvailable = await checkBackendConnection(0);
      
      if (!isBackendAvailable) {
        console.warn(`Backend unavailable, using mock data for POST ${endpoint}`);
        const resource = endpoint;
        
        // Get existing items
        const items = await mockData.get(resource);
        
        // Create new item with auto-incremented ID
        const newId = items.length > 0 
          ? Math.max(...items.map((item: any) => item.id)) + 1 
          : 1;
          
        const newItem = {
          ...data,
          id: newId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Add to collection and save
        items.push(newItem);
        await mockData.save(resource, items);
        
        toast.success("Item criado com sucesso!");
        return newItem as T;
      }
      
      const url = `${API_ENDPOINT}/${endpoint}`;
      const result = await fetchWithTimeout(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
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
      
      // Check if backend is available
      const isBackendAvailable = await checkBackendConnection(0);
      
      if (!isBackendAvailable) {
        console.warn(`Backend unavailable, using mock data for PUT ${endpoint}`);
        
        const [resource, idStr] = endpoint.split('/');
        const id = parseInt(idStr);
        
        // Get existing items
        const items = await mockData.get(resource);
        
        // Update the item
        const updatedItems = items.map((item: any) => 
          item.id === id 
            ? { ...item, ...data, updated_at: new Date().toISOString() } 
            : item
        );
        
        await mockData.save(resource, updatedItems);
        
        const updatedItem = updatedItems.find((item: any) => item.id === id);
        toast.success("Item atualizado com sucesso!");
        return updatedItem as T;
      }
      
      const [resource, id] = endpoint.split('/');
      const url = `${API_ENDPOINT}/${resource}?id=${id}`;
      
      const result = await fetchWithTimeout(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
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
      
      // Check if backend is available
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
      const url = `${API_ENDPOINT}/${resource}?id=${id}`;
      
      await fetchWithTimeout(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      toast.success("Item excluído com sucesso!");
    } catch (error) {
      handleError(error);
    }
  },

  // Domain-specific functions
  clients: {
    getAll: () => api.get<any[]>('clients'),
    getById: (id: number) => api.get<any>(`clients?id=${id}`),
    create: (data: any) => api.post<any>('clients', data),
    update: (id: number, data: any) => api.put<any>(`clients/${id}`, data),
    delete: (id: number) => api.delete(`clients/${id}`),
  },
  
  services: {
    getAll: () => api.get<any[]>('services'),
    getByClient: (clientId: number) => api.get<any[]>(`services?client_id=${clientId}`),
    getById: (id: number) => api.get<any>(`services?id=${id}`),
    create: (data: any) => api.post<any>('services', data),
    update: (id: number, data: any) => api.put<any>(`services/${id}`, data),
    delete: (id: number) => api.delete(`services/${id}`),
  },
  
  payments: {
    getAll: () => api.get<any[]>('payments'),
    getByClient: (clientId: number) => api.get<any[]>(`payments?client_id=${clientId}`),
    getByService: (serviceId: number) => api.get<any[]>(`payments?service_id=${serviceId}`),
    getById: (id: number) => api.get<any>(`payments?id=${id}`),
    create: (data: any) => api.post<any>('payments', data),
    update: (id: number, data: any) => api.put<any>(`payments/${id}`, data),
    delete: (id: number) => api.delete(`payments/${id}`),
  },
  
  projects: {
    getAll: () => api.get<any[]>('projects'),
    getByClient: (clientId: number) => api.get<any[]>(`projects?client_id=${clientId}`),
    getById: (id: number) => api.get<any>(`projects?id=${id}`),
    create: (data: any) => api.post<any>('projects', data),
    update: (id: number, data: any) => api.put<any>(`projects/${id}`, data),
    delete: (id: number) => api.delete(`projects/${id}`),
  },
  
  tasks: {
    getAll: () => api.get<any[]>('tasks'),
    getByProject: (projectId: number) => api.get<any[]>(`tasks?project_id=${projectId}`),
    getById: (id: number) => api.get<any>(`tasks?id=${id}`),
    create: (data: any) => api.post<any>('tasks', data),
    update: (id: number, data: any) => api.put<any>(`tasks/${id}`, data),
    delete: (id: number) => api.delete(`tasks/${id}`),
  },
  
  attachments: {
    getAll: () => api.get<any[]>('attachments'),
    getByRelated: (relatedType: string, relatedId: number) => 
      api.get<any[]>(`attachments?related_type=${relatedType}&related_id=${relatedId}`),
    getById: (id: number) => api.get<any>(`attachments?id=${id}`),
    create: (data: any) => api.post<any>('attachments', data),
    delete: (id: number) => api.delete(`attachments/${id}`),
  },
};
