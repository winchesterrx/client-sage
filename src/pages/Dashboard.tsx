
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { db, checkSupabaseConnection } from '@/lib/supabase';
import SetupGuide from '@/components/supabase/SetupGuide';

const Dashboard = () => {
  const [isSupabaseConnected, setIsSupabaseConnected] = React.useState<boolean | null>(null);
  
  React.useEffect(() => {
    const checkConnection = async () => {
      try {
        const isConnected = await checkSupabaseConnection();
        setIsSupabaseConnected(isConnected);
      } catch (error) {
        console.error('Erro ao verificar conexão com Supabase:', error);
        setIsSupabaseConnected(false);
      }
    };
    
    checkConnection();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Bem-vindo ao seu sistema de gerenciamento</p>
      </div>
      
      {isSupabaseConnected === false && (
        <SetupGuide />
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Cards do dashboard */}
      </div>
    </div>
  );
};

export default Dashboard;
