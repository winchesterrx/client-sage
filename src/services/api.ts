import { toast } from "sonner";

const API_ENDPOINT = "https://xofome.online/api";
const FORCE_OFFLINE_MODE = false;

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

async function fetchWithTimeout(url: string, options: RequestInit, timeout = 8000) {
  const controller = new AbortController();
  const { signal } = controller;
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { ...options, signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw { status: response.status, response: { data: errorData } };
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

export const api = {
  get: async <T>(endpoint: string): Promise<T> => {
    try {
      const url = `${API_ENDPOINT}/${endpoint}`;
      return await fetchWithTimeout(url, { method: 'GET' });
    } catch (error) {
      return handleError(error);
    }
  },

  post: async <T>(endpoint: string, data: any): Promise<T> => {
    try {
      const url = `${API_ENDPOINT}/${endpoint}.php`;
      const result = await fetchWithTimeout(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      const url = `${API_ENDPOINT}/${resource}.php?id=${id}`;
      const result = await fetchWithTimeout(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
      const url = `${API_ENDPOINT}/${resource}.php?id=${id}`;
      await fetchWithTimeout(url, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      toast.success("Item excluído com sucesso!");
    } catch (error) {
      handleError(error);
    }
  },

  clients: {
    getAll: () => api.get<any[]>('clients.php'),
    getById: (id: number) => api.get<any>(`clients.php?id=${id}`),
    create: (data: any) => api.post<any>('clients', data),
    update: (id: number, data: any) => api.put<any>(`clients/${id}`, data),
    delete: (id: number) => api.delete(`clients/${id}`),
  },

  services: {
    getAll: () => api.get<any[]>('services.php'),
    getByClient: (clientId: number) => api.get<any[]>(`services.php?client_id=${clientId}`),
    getById: (id: number) => api.get<any>(`services.php?id=${id}`),
    create: (data: any) => api.post<any>('services', data),
    update: (id: number, data: any) => api.put<any>(`services/${id}`, data),
    delete: (id: number) => api.delete(`services/${id}`),
  },

  payments: {
    getAll: () => api.get<any[]>('payments.php'),
    getByClient: (clientId: number) => api.get<any[]>(`payments.php?client_id=${clientId}`),
    getByService: (serviceId: number) => api.get<any[]>(`payments.php?service_id=${serviceId}`),
    getById: (id: number) => api.get<any>(`payments.php?id=${id}`),
    create: (data: any) => api.post<any>('payments', data),
    update: (id: number, data: any) => api.put<any>(`payments/${id}`, data),
    delete: (id: number) => api.delete(`payments/${id}`),
  },

  projects: {
    getAll: () => api.get<any[]>('projects.php'),
    getByClient: (clientId: number) => api.get<any[]>(`projects.php?client_id=${clientId}`),
    getById: (id: number) => api.get<any>(`projects.php?id=${id}`),
    create: (data: any) => api.post<any>('projects', data),
    update: (id: number, data: any) => api.put<any>(`projects/${id}`, data),
    delete: (id: number) => api.delete(`projects/${id}`),
  },

  tasks: {
    getAll: () => api.get<any[]>('tasks.php'),
    getByProject: (projectId: number) => api.get<any[]>(`tasks.php?project_id=${projectId}`),
    getById: (id: number) => api.get<any>(`tasks.php?id=${id}`),
    create: (data: any) => api.post<any>('tasks', data),
    update: (id: number, data: any) => api.put<any>(`tasks/${id}`, data),
    delete: (id: number) => api.delete(`tasks/${id}`),
  },

  attachments: {
    getAll: () => api.get<any[]>('attachments.php'),
    getByRelated: (type: string, id: number) =>
      api.get<any[]>(`attachments.php?related_type=${type}&related_id=${id}`),
    getById: (id: number) => api.get<any>(`attachments.php?id=${id}`),
    create: (data: any) => api.post<any>('attachments', data),
    delete: (id: number) => api.delete(`attachments/${id}`),
  },
};
