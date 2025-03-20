
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '@/services/api';
import { formatCurrency } from '@/utils/formatters';
import { 
  Users, 
  FileText, 
  Briefcase,
  CreditCard,
  Bell,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from '@/components/ui/status-badge';
import { 
  getPaymentStatusInfo, 
  getProjectStatusInfo, 
  formatDate,
  getDaysRemaining
} from '@/utils/formatters';

const Dashboard = () => {
  // Fetch data
  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => api.clients.getAll(),
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => api.services.getAll(),
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['payments'],
    queryFn: () => api.payments.getAll(),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.projects.getAll(),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => api.tasks.getAll(),
  });

  // Derived statistics
  const activeServices = services.filter(service => service.status === 'active');
  const pendingPayments = payments.filter(payment => payment.status === 'pending');
  const overduePayments = payments.filter(payment => payment.status === 'overdue');
  const activeProjects = projects.filter(project => project.status === 'in_progress');
  const upcomingPayments = pendingPayments.slice(0, 5).sort((a, b) => 
    new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
  );
  const recentTasks = tasks.slice(0, 5).sort((a, b) => 
    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );

  // Calculate total monthly revenue
  const monthlyRevenue = activeServices.reduce((sum, service) => sum + service.price, 0);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Visão geral do seu negócio</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white rounded-lg px-4 py-2 border shadow-sm hover:shadow transition-all duration-200">
            <Bell className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Notificações</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white shadow-sm border hover:shadow-md transition-all duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-3xl font-bold">{clients.length}</div>
              <div className="p-2 bg-blue-50 rounded-full">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              <Link to="/clients" className="text-blue-500 hover:underline">
                Ver todos →
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border hover:shadow-md transition-all duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Serviços Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-3xl font-bold">{activeServices.length}</div>
              <div className="p-2 bg-green-50 rounded-full">
                <FileText className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              <Link to="/services" className="text-blue-500 hover:underline">
                Ver todos →
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border hover:shadow-md transition-all duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Projetos em Andamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-3xl font-bold">{activeProjects.length}</div>
              <div className="p-2 bg-yellow-50 rounded-full">
                <Briefcase className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              <Link to="/projects" className="text-blue-500 hover:underline">
                Ver todos →
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border hover:shadow-md transition-all duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Receita Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-3xl font-bold">{formatCurrency(monthlyRevenue)}</div>
              <div className="p-2 bg-purple-50 rounded-full">
                <CreditCard className="h-6 w-6 text-purple-500" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              <Link to="/finances" className="text-blue-500 hover:underline">
                Ver detalhes →
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Payments and Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Payments */}
        <Card className="bg-white shadow-sm border">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Pagamentos Pendentes</span>
              <Link to="/finances" className="text-sm font-medium text-blue-500 hover:underline">
                Ver todos
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingPayments.length > 0 ? (
              <div className="space-y-3">
                {upcomingPayments.map((payment) => {
                  const daysInfo = getDaysRemaining(payment.due_date);
                  const statusInfo = getPaymentStatusInfo(payment.status, payment.due_date);
                  
                  return (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${daysInfo.status === 'past' ? 'bg-red-100' : 'bg-blue-100'}`}>
                          {daysInfo.status === 'past' ? (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-blue-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{clients.find(c => c.id === payment.client_id)?.name}</p>
                          <p className="text-xs text-gray-500">Vencimento: {formatDate(payment.due_date)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-medium">{formatCurrency(payment.amount)}</p>
                        <StatusBadge status={statusInfo.label} color={statusInfo.color} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-2" />
                <p>Sem pagamentos pendentes!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Tasks */}
        <Card className="bg-white shadow-sm border">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Tarefas Recentes</span>
              <Link to="/projects" className="text-sm font-medium text-blue-500 hover:underline">
                Ver todas
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentTasks.length > 0 ? (
              <div className="space-y-3">
                {recentTasks.map((task) => {
                  const projectInfo = projects.find(p => p.id === task.project_id);
                  const statusColor = task.status === 'completed' ? 
                    'bg-green-100 text-green-500' : 
                    task.status === 'in_progress' ? 
                      'bg-yellow-100 text-yellow-500' : 
                      'bg-blue-100 text-blue-500';
                  
                  return (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${statusColor}`}>
                          {task.status === 'completed' ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : task.status === 'in_progress' ? (
                            <Clock className="h-4 w-4" />
                          ) : (
                            <AlertTriangle className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{task.name}</p>
                          <p className="text-xs text-gray-500">
                            Projeto: {projectInfo?.name}
                          </p>
                        </div>
                      </div>
                      <div>
                        {task.due_date && (
                          <p className="text-xs text-gray-500">Prazo: {formatDate(task.due_date)}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-2" />
                <p>Sem tarefas recentes!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-white shadow-sm border">
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...projects, ...services, ...payments].sort((a, b) => 
              new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
            ).slice(0, 5).map((item, index) => {
              let icon, title, description, date, statusInfo;
              
              if ('service_type' in item) {
                // It's a service
                const clientName = clients.find(c => c.id === item.client_id)?.name || '';
                icon = <FileText className="h-4 w-4 text-blue-500" />;
                title = `Serviço: ${item.service_type}`;
                description = `Cliente: ${clientName}`;
                date = formatDate(item.updated_at);
              } else if ('amount' in item) {
                // It's a payment
                const clientName = clients.find(c => c.id === item.client_id)?.name || '';
                icon = <CreditCard className="h-4 w-4 text-purple-500" />;
                title = `Pagamento: ${formatCurrency(item.amount)}`;
                description = `Cliente: ${clientName}`;
                date = formatDate(item.updated_at);
                statusInfo = getPaymentStatusInfo(item.status);
              } else if ('start_date' in item) {
                // It's a project
                const clientName = clients.find(c => c.id === item.client_id)?.name || '';
                icon = <Briefcase className="h-4 w-4 text-yellow-500" />;
                title = `Projeto: ${item.name}`;
                description = `Cliente: ${clientName}`;
                date = formatDate(item.updated_at);
                statusInfo = getProjectStatusInfo(item.status);
              }
              
              return (
                <div key={index} className="flex gap-4">
                  <div className="mt-1">{icon}</div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium">{title}</p>
                      <p className="text-xs text-gray-500">{date}</p>
                    </div>
                    <p className="text-xs text-gray-500">{description}</p>
                    {statusInfo && (
                      <StatusBadge status={statusInfo.label} color={statusInfo.color} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
