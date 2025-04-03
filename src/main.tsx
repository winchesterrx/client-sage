
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ErrorBoundary from './components/ui/error-boundary.tsx'
import { db } from './lib/supabase/database/index.ts'

// Inicializar sistema
const initSystem = async () => {
  // Verificar e atualizar pagamentos atrasados
  await db.updateOverduePayments();
}

// Inicializar sistema ao carregar a aplicação
initSystem().catch(error => {
  console.error("Erro ao inicializar sistema:", error);
});

// Create a client with better error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      onError: (error) => {
        console.error('Query error:', error);
      }
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
)
