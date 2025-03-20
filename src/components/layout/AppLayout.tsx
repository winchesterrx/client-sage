
import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import { initializeDatabase } from '@/services/api';
import { toast } from 'sonner';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize database with sample data
    const initialize = async () => {
      try {
        setIsLoading(true);
        console.log("Starting database initialization...");
        const success = await initializeDatabase();
        
        if (success) {
          console.log("Database successfully initialized");
          toast.success("Conectado ao banco de dados com sucesso!");
        } else {
          console.warn("Using local storage fallback");
          toast.info("Usando armazenamento local para salvar os dados.", {
            description: "Os dados serão salvos apenas no seu navegador.",
            duration: 5000
          });
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize:", error);
        toast.info("Usando armazenamento local para salvar os dados.", {
          description: "Não foi possível conectar ao servidor.",
          duration: 5000
        });
        setIsInitialized(true);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64">
        {isLoading ? (
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-4 text-gray-600">Inicializando aplicação...</p>
            </div>
          </div>
        ) : (
          <div className="container mx-auto py-8 px-6 max-w-7xl animate-fade-in">
            {!isInitialized && (
              <div className="bg-blue-50 p-4 rounded-md mb-6 border border-blue-200">
                <p className="text-blue-700">
                  Aplicação em modo offline. Os dados serão salvos apenas no seu navegador.
                </p>
              </div>
            )}
            {children}
          </div>
        )}
      </main>
    </div>
  );
};

export default AppLayout;
