
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ErrorBoundary from './components/ui/error-boundary.tsx'
import { db } from './lib/supabase/database/index.ts'
import { toast, Toaster } from 'sonner'

// Inicializar sistema
const initSystem = async () => {
  try {
    console.log('Initializing system...');
    
    // Verificar conexão com o banco de dados
    const dbStatus = await db.check();
    console.log('Database status:', dbStatus);
    
    if (!dbStatus.connected) {
      console.error('Failed to connect to database:', dbStatus.error);
      toast.error('Erro de conexão com o banco de dados', {
        description: dbStatus.error || 'Verifique as credenciais do Supabase',
        duration: 5000
      });
      return;
    }
    
    // Verificar e atualizar pagamentos atrasados
    const overdueUpdated = await db.updateOverduePayments();
    console.log('Overdue payments updated:', overdueUpdated);
    
    console.log('System initialized successfully');
    toast.success('Sistema inicializado com sucesso', {
      description: 'Banco de dados conectado e pagamentos atualizados',
      duration: 3000
    });
  } catch (error) {
    console.error("Error initializing system:", error);
    toast.error('Erro ao inicializar sistema', {
      description: error instanceof Error ? error.message : 'Erro desconhecido',
      duration: 5000
    });
  }
}

// Inicializar sistema ao carregar a aplicação
initSystem();

// Create a client with better error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      onError: (error) => {
        console.error('Query error:', error);
        toast.error('Erro ao carregar dados', {
          description: error instanceof Error ? error.message : 'Erro desconhecido',
        });
      }
    },
    mutations: {
      onError: (error) => {
        console.error('Mutation error:', error);
        toast.error('Erro ao salvar dados', {
          description: error instanceof Error ? error.message : 'Erro desconhecido',
        });
      }
    }
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster richColors position="top-right" />
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
)
