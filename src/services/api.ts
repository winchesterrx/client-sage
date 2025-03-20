
import { toast } from "sonner";

// API endpoint for your PHP backend
const API_ENDPOINT = "https://your-backend-url.com/api"; // Update this with your actual backend URL

// Helper function to handle API errors
const handleError = (error: any) => {
  console.error("API Error:", error);
  
  let errorMessage = "Ocorreu um erro ao processar sua solicitação.";
  if (error.response && error.response.data && error.response.data.message) {
    errorMessage = error.response.data.message;
  }
  
  toast.error(errorMessage);
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
      const errorData = await response.json().catch(() => ({}));
      throw {
        status: response.status,
        statusText: response.statusText,
        response: { data: errorData }
      };
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

// API functions that connect to the PHP backend
export const api = {
  // Generic CRUD operations for PHP backend
  get: async <T>(endpoint: string): Promise<T> => {
    try {
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

// Function to check backend connection
export const checkBackendConnection = async () => {
  try {
    await api.clients.getAll();
    console.log("Backend connection successful");
    return true;
  } catch (error) {
    console.error("Backend connection failed:", error);
    return false;
  }
};
