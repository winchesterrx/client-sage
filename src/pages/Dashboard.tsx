
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ButtonLink } from '@/components/ui/button';
import { UserRound, Users, FileText, Package, Clock, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Import the chart for statistics
import { Chart } from '@/components/ui/chart';

const Dashboard = () => {
  const { user } = useAuth();

  // Fetching data with React Query
  const { data: clients, isLoading: isLoadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const clients = await db.clients.getAll();
      return clients;
    },
  });

  const { data: payments, isLoading: isLoadingPayments } = useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const payments = await db.payments.getAll();
      return payments;
    },
  });

  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const projects = await db.projects.getAll();
      return projects;
    },
  });

  const { data: services, isLoading: isLoadingServices } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const services = await db.services.getAll();
      return services;
    },
  });

  // Calculate metrics
  const calculateMetrics = () => {
    const totalClients = clients?.length || 0;
    const totalServices = services?.length || 0;
    const totalProjects = projects?.length || 0;
    
    const pendingPayments = payments?.filter(p => p.status === 'pending').length || 0;
    const overduePayments = payments?.filter(p => p.status === 'overdue').length || 0;
    const paidPayments = payments?.filter(p => p.status === 'paid').length || 0;
    
    const inProgressProjects = projects?.filter(p => p.status === 'in_progress').length || 0;
    const completedProjects = projects?.filter(p => p.status === 'completed').length || 0;
    
    return {
      totalClients,
      totalServices,
      totalProjects,
      pendingPayments,
      overduePayments,
      paidPayments,
      inProgressProjects,
      completedProjects
    };
  };

  const metrics = calculateMetrics();

  const isLoading = isLoadingClients || isLoadingPayments || isLoadingProjects || isLoadingServices;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Bem-vindo, {user?.name}!</p>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalClients}</div>
            <p className="text-xs text-gray-500">Total de clientes cadastrados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Serviços</CardTitle>
            <Package className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalServices}</div>
            <p className="text-xs text-gray-500">Total de serviços ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Projetos</CardTitle>
            <FileText className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalProjects}</div>
            <p className="text-xs text-gray-500">{metrics.inProgressProjects} em andamento</p>
          </CardContent>
        </Card>
        <Card className="bg-red-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-red-600">Pagamentos Atrasados</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.overduePayments}</div>
            <p className="text-xs text-red-500">Pagamentos que precisam de atenção</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Status de Pagamentos</CardTitle>
            <CardDescription>Distribuição dos pagamentos por status</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <Chart 
              type="pie"
              data={[
                { name: 'Pagos', value: metrics.paidPayments },
                { name: 'Pendentes', value: metrics.pendingPayments },
                { name: 'Atrasados', value: metrics.overduePayments }
              ]}
              colors={['#10b981', '#f59e0b', '#ef4444']}
            />
          </CardContent>
        </Card>

        {/* Project Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Status de Projetos</CardTitle>
            <CardDescription>Distribuição dos projetos por status</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <Chart 
              type="pie"
              data={[
                { name: 'Em Andamento', value: metrics.inProgressProjects },
                { name: 'Concluídos', value: metrics.completedProjects },
                { name: 'Planejamento', value: metrics.totalProjects - metrics.inProgressProjects - metrics.completedProjects }
              ]}
              colors={['#3b82f6', '#10b981', '#6366f1']}
            />
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <ButtonLink href="/clients" variant="outline" className="h-20 flex flex-col items-center justify-center">
          <Users className="h-5 w-5 mb-1" />
          <span>Clientes</span>
        </ButtonLink>
        <ButtonLink href="/services" variant="outline" className="h-20 flex flex-col items-center justify-center">
          <Package className="h-5 w-5 mb-1" />
          <span>Serviços</span>
        </ButtonLink>
        <ButtonLink href="/projects" variant="outline" className="h-20 flex flex-col items-center justify-center">
          <FileText className="h-5 w-5 mb-1" />
          <span>Projetos</span>
        </ButtonLink>
        <ButtonLink href="/finances" variant="outline" className="h-20 flex flex-col items-center justify-center">
          <Clock className="h-5 w-5 mb-1" />
          <span>Pagamentos</span>
        </ButtonLink>
      </div>
    </div>
  );
};

export default Dashboard;
