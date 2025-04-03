import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { db, checkSupabaseConnection } from '@/lib/supabase';
import SetupGuide from '@/components/supabase/SetupGuide';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, BarChart3, Clock, DollarSign, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/formatters';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
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

  // Use TanStack Query with error handling
  const { data: clients, isError: isClientsError } = useQuery({
    queryKey: ['dashboard-clients'],
    queryFn: () => db.clients.getAll(),
    enabled: isSupabaseConnected === true,
    retry: 1,
    onError: (err: any) => {
      console.error('Error loading clients:', err);
      setError('Erro ao carregar dados de clientes.');
    }
  });

  const { data: payments, isError: isPaymentsError } = useQuery({
    queryKey: ['dashboard-payments'],
    queryFn: () => db.payments.getAll(),
    enabled: isSupabaseConnected === true,
    retry: 1,
    onError: (err: any) => {
      console.error('Error loading payments:', err);
    }
  });

  const { data: projects, isError: isProjectsError } = useQuery({
    queryKey: ['dashboard-projects'],
    queryFn: () => db.projects.getAll(),
    enabled: isSupabaseConnected === true,
    retry: 1,
    onError: (err: any) => {
      console.error('Error loading projects:', err);
    }
  });

  const { data: services, isError: isServicesError } = useQuery({
    queryKey: ['dashboard-services'],
    queryFn: () => db.services.getAll(),
    enabled: isSupabaseConnected === true,
    retry: 1,
    onError: (err: any) => {
      console.error('Error loading services:', err);
    }
  });

  // Check if there are any data loading errors
  const hasErrors = isClientsError || isPaymentsError || isProjectsError || isServicesError;

  // Cálculos para estatísticas do dashboard
  const totalClients = clients?.length || 0;
  const totalRevenue = payments?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;
  const totalProjects = projects?.length || 0;
  const activeServices = services?.filter(service => service.status === 'active').length || 0;
  
  // Projetos recentes
  const recentProjects = projects?.slice(0, 3) || [];

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg border border-red-200 my-4">
        <h2 className="text-lg font-medium text-red-800">Erro ao carregar dados</h2>
        <p className="text-red-600 mt-1">{error}</p>
        <Button className="mt-4" onClick={() => window.location.reload()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Bem-vindo ao seu sistema de gerenciamento</p>
      </div>
      
      {isSupabaseConnected === false && (
        <SetupGuide />
      )}
      
      {hasErrors && (
        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-amber-700">Ocorreram alguns erros ao carregar os dados. Algumas informações podem estar incompletas.</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Cards do dashboard */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Clientes</p>
                <h3 className="text-2xl font-bold mt-1">{totalClients}</h3>
              </div>
              <div className="p-2 bg-blue-50 rounded-full">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <div className="mt-4">
              <Button variant="ghost" size="sm" className="p-0 h-auto text-sm text-blue-500" asChild>
                <Link to="/clients">Ver detalhes <ArrowUpRight className="h-3 w-3 ml-1" /></Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Faturamento</p>
                <h3 className="text-2xl font-bold mt-1">{formatCurrency(totalRevenue)}</h3>
              </div>
              <div className="p-2 bg-green-50 rounded-full">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
            </div>
            <div className="mt-4">
              <Button variant="ghost" size="sm" className="p-0 h-auto text-sm text-green-500" asChild>
                <Link to="/finances">Ver detalhes <ArrowUpRight className="h-3 w-3 ml-1" /></Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Projetos</p>
                <h3 className="text-2xl font-bold mt-1">{totalProjects}</h3>
              </div>
              <div className="p-2 bg-purple-50 rounded-full">
                <BarChart3 className="h-5 w-5 text-purple-500" />
              </div>
            </div>
            <div className="mt-4">
              <Button variant="ghost" size="sm" className="p-0 h-auto text-sm text-purple-500" asChild>
                <Link to="/projects">Ver detalhes <ArrowUpRight className="h-3 w-3 ml-1" /></Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Serviços Ativos</p>
                <h3 className="text-2xl font-bold mt-1">{activeServices}</h3>
              </div>
              <div className="p-2 bg-yellow-50 rounded-full">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
            </div>
            <div className="mt-4">
              <Button variant="ghost" size="sm" className="p-0 h-auto text-sm text-yellow-500" asChild>
                <Link to="/services">Ver detalhes <ArrowUpRight className="h-3 w-3 ml-1" /></Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Projetos Recentes</CardTitle>
            <CardDescription>Últimos projetos adicionados ao sistema</CardDescription>
          </CardHeader>
          <CardContent>
            {recentProjects.length > 0 ? (
              <div className="space-y-4">
                {recentProjects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{project.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Cliente: {clients?.find(c => c.id === project.client_id)?.name || 'N/A'}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/projects/${project.id}`}>Detalhes</Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Nenhum projeto encontrado</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clientes Ativos</CardTitle>
            <CardDescription>Total de clientes ativos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-40">
              <h3 className="text-5xl font-bold text-primary">{totalClients}</h3>
              <p className="text-sm text-muted-foreground mt-2">Total de clientes cadastrados</p>
              <Button className="mt-4" asChild>
                <Link to="/clients">Gerenciar Clientes</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
