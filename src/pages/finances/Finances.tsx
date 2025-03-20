
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Calendar, CreditCard, DollarSign, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from '@/components/ui/status-badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const Finances = () => {
  const [timeFrame, setTimeFrame] = React.useState<'month' | 'year'>('month');
  
  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: api.clients.getAll,
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: api.services.getAll,
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['payments'],
    queryFn: api.payments.getAll,
  });

  // Calculate summary statistics
  const totalClients = clients.length;
  const totalServices = services.length;
  const monthlyRecurring = services.reduce((sum, service) => sum + service.price, 0);
  
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Filter payments for the current month/year
  const paymentsThisMonth = payments.filter(payment => {
    const paymentDate = payment.payment_date ? new Date(payment.payment_date) : null;
    return paymentDate && 
           paymentDate.getMonth() === currentMonth && 
           paymentDate.getFullYear() === currentYear;
  });
  
  const paymentsThisYear = payments.filter(payment => {
    const paymentDate = payment.payment_date ? new Date(payment.payment_date) : null;
    return paymentDate && paymentDate.getFullYear() === currentYear;
  });
  
  const totalPaidThisMonth = paymentsThisMonth.reduce((sum, payment) => sum + payment.amount, 0);
  const totalPaidThisYear = paymentsThisYear.reduce((sum, payment) => sum + payment.amount, 0);

  // Upcoming payments (due in the next 30 days)
  const today = new Date();
  const thirtyDaysFromNow = new Date(today);
  thirtyDaysFromNow.setDate(today.getDate() + 30);
  
  const upcomingPayments = payments.filter(payment => {
    if (payment.status === 'paid') return false;
    
    const dueDate = new Date(payment.due_date);
    return dueDate >= today && dueDate <= thirtyDaysFromNow;
  }).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  
  // Prepare chart data
  const prepareMonthlyData = () => {
    const months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(currentYear, i, 1);
      return { 
        name: date.toLocaleString('default', { month: 'short' }),
        received: 0,
        expected: 0,
      };
    });
    
    // Add received payments
    payments.forEach(payment => {
      if (!payment.payment_date) return;
      
      const date = new Date(payment.payment_date);
      if (date.getFullYear() === currentYear) {
        const month = date.getMonth();
        months[month].received += payment.amount;
      }
    });
    
    // Add expected payments (due date)
    payments.forEach(payment => {
      const date = new Date(payment.due_date);
      if (date.getFullYear() === currentYear) {
        const month = date.getMonth();
        if (payment.status !== 'paid') {
          months[month].expected += payment.amount;
        }
      }
    });
    
    return months;
  };
  
  const monthlyData = prepareMonthlyData();
  
  // Prepare payment status distribution data
  const preparePaymentStatusData = () => {
    const statusCounts: Record<string, { name: string, value: number, color: string }> = {
      paid: { name: 'Pagos', value: 0, color: '#22c55e' },
      pending: { name: 'Pendentes', value: 0, color: '#eab308' },
      overdue: { name: 'Atrasados', value: 0, color: '#ef4444' },
    };
    
    payments.forEach(payment => {
      const now = new Date();
      const dueDate = new Date(payment.due_date);
      
      let status = payment.status;
      if (status === 'pending' && dueDate < now) {
        status = 'overdue';
      }
      
      if (statusCounts[status]) {
        statusCounts[status].value += 1;
      }
    });
    
    return Object.values(statusCounts).filter(item => item.value > 0);
  };
  
  const paymentStatusData = preparePaymentStatusData();
  
  // Get service name by ID
  const getServiceName = (serviceId: number) => {
    const service = services.find(s => s.id === serviceId);
    return service ? service.service_type : 'Serviço desconhecido';
  };
  
  // Get client name by ID
  const getClientName = (clientId: number) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Cliente desconhecido';
  };
  
  // Get payment status
  const getPaymentStatusInfo = (status: string, dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    
    if (status === 'paid') {
      return { label: 'Pago', color: 'green' };
    } else if (status === 'pending' && due < now) {
      return { label: 'Atrasado', color: 'red' };
    } else if (status === 'pending') {
      return { label: 'Pendente', color: 'yellow' };
    } else if (status === 'overdue') {
      return { label: 'Atrasado', color: 'red' };
    } else {
      return { label: status, color: 'gray' };
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Finanças</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total de Clientes</p>
                <p className="text-2xl font-bold">{totalClients}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Serviços Ativos</p>
                <p className="text-2xl font-bold">{totalServices}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <CreditCard className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Receita Mensal</p>
                <p className="text-2xl font-bold">{formatCurrency(monthlyRecurring)}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  {timeFrame === 'month' ? 'Recebido (Mês)' : 'Recebido (Ano)'}
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(timeFrame === 'month' ? totalPaidThisMonth : totalPaidThisYear)}
                </p>
              </div>
              <div className="bg-amber-100 p-3 rounded-full">
                <Calendar className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Financial Charts */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="payments">Pagamentos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Receitas Mensais</CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant={timeFrame === 'month' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setTimeFrame('month')}
                  >
                    Mês
                  </Button>
                  <Button 
                    variant={timeFrame === 'year' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setTimeFrame('year')}
                  >
                    Ano
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis 
                      tickFormatter={(value) => `R$${value.toLocaleString()}`} 
                      width={80}
                    />
                    <Tooltip 
                      formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, undefined]}
                      labelFormatter={(label) => `Mês: ${label}`}
                    />
                    <Legend />
                    <Bar dataKey="received" fill="#22c55e" name="Recebido" />
                    <Bar dataKey="expected" fill="#eab308" name="Esperado" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Status dos Pagamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentStatusData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={50}
                        dataKey="value"
                        nameKey="name"
                        label
                      >
                        {paymentStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, undefined]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Pagamentos Próximos</CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingPayments.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingPayments.slice(0, 5).map((payment) => {
                      const statusInfo = getPaymentStatusInfo(payment.status, payment.due_date);
                      const service = services.find(s => s.id === payment.service_id);
                      const client = service ? clients.find(c => c.id === service.client_id) : null;
                      
                      return (
                        <div key={payment.id} className="flex justify-between items-center border-b pb-3">
                          <div>
                            <p className="font-medium">{getServiceName(payment.service_id)}</p>
                            <p className="text-sm text-gray-500">{client ? client.name : 'Cliente desconhecido'}</p>
                            <p className="text-xs text-gray-400">{formatDate(payment.due_date)}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <StatusBadge status={statusInfo.label} color={statusInfo.color} />
                            <p className="font-medium">{formatCurrency(payment.amount)}</p>
                          </div>
                        </div>
                      );
                    })}
                    
                    {upcomingPayments.length > 5 && (
                      <p className="text-center text-sm text-gray-500">
                        +{upcomingPayments.length - 5} pagamentos próximos
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    Nenhum pagamento próximo encontrado
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Pagamentos</CardTitle>
            </CardHeader>
            <CardContent>
              {payments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 text-sm font-medium text-gray-500">Cliente</th>
                        <th className="text-left p-3 text-sm font-medium text-gray-500">Serviço</th>
                        <th className="text-left p-3 text-sm font-medium text-gray-500">Valor</th>
                        <th className="text-left p-3 text-sm font-medium text-gray-500">Vencimento</th>
                        <th className="text-left p-3 text-sm font-medium text-gray-500">Pagamento</th>
                        <th className="text-left p-3 text-sm font-medium text-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.slice(0, 20).map((payment) => {
                        const service = services.find(s => s.id === payment.service_id);
                        const client = service ? clients.find(c => c.id === service.client_id) : null;
                        const statusInfo = getPaymentStatusInfo(payment.status, payment.due_date);
                        
                        return (
                          <tr key={payment.id} className="border-b hover:bg-gray-50">
                            <td className="p-3">{client ? client.name : 'Cliente desconhecido'}</td>
                            <td className="p-3">{getServiceName(payment.service_id)}</td>
                            <td className="p-3 font-medium">{formatCurrency(payment.amount)}</td>
                            <td className="p-3">{formatDate(payment.due_date)}</td>
                            <td className="p-3">{payment.payment_date ? formatDate(payment.payment_date) : '—'}</td>
                            <td className="p-3">
                              <StatusBadge status={statusInfo.label} color={statusInfo.color} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  Nenhum pagamento encontrado
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Finances;
