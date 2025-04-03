
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Calendar, CreditCard, DollarSign, Users, Plus, Filter, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/ui/status-badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
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
  const queryClient = useQueryClient();
  const [timeFrame, setTimeFrame] = useState<'month' | 'year'>('month');
  const [showAddPaymentDialog, setShowAddPaymentDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const [newPayment, setNewPayment] = useState({
    client_id: '',
    service_id: '',
    amount: '',
    payment_date: '',
    due_date: new Date().toISOString().split('T')[0],
    status: 'pending' as 'pending' | 'paid' | 'overdue',
    payment_method: '',
    notes: '',
  });

  const { data: clients = [], isLoading: isLoadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: api.clients.getAll,
  });

  const { data: services = [], isLoading: isLoadingServices } = useQuery({
    queryKey: ['services'],
    queryFn: api.services.getAll,
  });

  const { data: payments = [], isLoading: isLoadingPayments } = useQuery({
    queryKey: ['payments'],
    queryFn: api.payments.getAll,
  });

  // Mutation for creating a payment
  const createPaymentMutation = useMutation({
    mutationFn: (paymentData: any) => api.payments.create(paymentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      setShowAddPaymentDialog(false);
      resetPaymentForm();
      toast.success('Pagamento adicionado com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating payment:', error);
      toast.error('Erro ao adicionar pagamento');
    },
  });

  // Mutation for marking a payment as paid
  const markAsPaidMutation = useMutation({
    mutationFn: ({ id, paymentData }: { id: number; paymentData: any }) => 
      api.payments.update(id, paymentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Pagamento marcado como pago!');
    },
    onError: (error) => {
      console.error('Error updating payment:', error);
      toast.error('Erro ao atualizar pagamento');
    },
  });

  const resetPaymentForm = () => {
    setNewPayment({
      client_id: '',
      service_id: '',
      amount: '',
      payment_date: '',
      due_date: new Date().toISOString().split('T')[0],
      status: 'pending',
      payment_method: '',
      notes: '',
    });
  };

  const handleAddPayment = () => {
    if (!newPayment.service_id || !newPayment.amount || !newPayment.due_date) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const paymentData = {
      client_id: Number(newPayment.client_id),
      service_id: Number(newPayment.service_id),
      amount: parseFloat(newPayment.amount),
      payment_date: newPayment.payment_date || null,
      due_date: newPayment.due_date,
      status: newPayment.status,
      payment_method: newPayment.payment_method || null,
      notes: newPayment.notes || null,
    };

    createPaymentMutation.mutate(paymentData);
  };

  const handleMarkAsPaid = (payment: any) => {
    const today = new Date().toISOString().split('T')[0];
    
    markAsPaidMutation.mutate({
      id: payment.id,
      paymentData: {
        status: 'paid',
        payment_date: today,
      },
    });
  };

  // Calculate summary statistics
  const totalClients = clients.length;
  const totalServices = services.length;
  const monthlyRecurring = services.reduce((sum, service) => sum + Number(service.price), 0);
  
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
  
  const totalPaidThisMonth = paymentsThisMonth.reduce((sum, payment) => sum + Number(payment.amount), 0);
  const totalPaidThisYear = paymentsThisYear.reduce((sum, payment) => sum + Number(payment.amount), 0);

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
        months[month].received += Number(payment.amount);
      }
    });
    
    // Add expected payments (due date)
    payments.forEach(payment => {
      const date = new Date(payment.due_date);
      if (date.getFullYear() === currentYear) {
        const month = date.getMonth();
        if (payment.status !== 'paid') {
          months[month].expected += Number(payment.amount);
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

  // Get filtered payments based on status
  const getFilteredPayments = () => {
    if (filterStatus === 'all') {
      return payments;
    }
    
    return payments.filter(payment => {
      const now = new Date();
      const dueDate = new Date(payment.due_date);
      
      if (filterStatus === 'paid' && payment.status === 'paid') {
        return true;
      } else if (filterStatus === 'pending' && payment.status === 'pending' && dueDate >= now) {
        return true;
      } else if (filterStatus === 'overdue' && ((payment.status === 'pending' && dueDate < now) || payment.status === 'overdue')) {
        return true;
      }
      
      return false;
    });
  };

  const filteredPayments = getFilteredPayments();
  
  // Handle service selection in payment form
  const handleServiceSelect = (serviceId: string) => {
    const service = services.find(s => s.id === Number(serviceId));
    if (service) {
      setNewPayment({
        ...newPayment,
        service_id: serviceId,
        client_id: service.client_id.toString(),
        amount: service.price.toString(),
      });
    }
  };

  if (isLoadingClients || isLoadingServices || isLoadingPayments) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-gray-500">Carregando dados financeiros...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Finanças</h1>
        <Button
          onClick={() => setShowAddPaymentDialog(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Registrar Pagamento</span>
        </Button>
      </div>
      
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
                      const client = clients.find(c => c.id === Number(payment.client_id) || (service && c.id === service.client_id));
                      
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
                            {payment.status !== 'paid' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="h-8"
                                onClick={() => handleMarkAsPaid(payment)}
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Pago
                              </Button>
                            )}
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
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <CardTitle>Histórico de Pagamentos</CardTitle>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <Select 
                    value={filterStatus}
                    onValueChange={setFilterStatus}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filtrar por status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="paid">Pagos</SelectItem>
                      <SelectItem value="pending">Pendentes</SelectItem>
                      <SelectItem value="overdue">Atrasados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredPayments.length > 0 ? (
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
                        <th className="text-right p-3 text-sm font-medium text-gray-500">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayments.slice(0, 20).map((payment) => {
                        const service = services.find(s => s.id === payment.service_id);
                        const client = clients.find(c => 
                          c.id === Number(payment.client_id) || 
                          (service && c.id === service.client_id)
                        );
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
                            <td className="p-3 text-right">
                              {payment.status !== 'paid' && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleMarkAsPaid(payment)}
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Marcar como Pago
                                </Button>
                              )}
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
      
      {/* Add Payment Dialog */}
      <Dialog open={showAddPaymentDialog} onOpenChange={setShowAddPaymentDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Registrar Novo Pagamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="payment-service" className="text-sm font-medium">
                Serviço *
              </label>
              <Select
                value={newPayment.service_id}
                onValueChange={handleServiceSelect}
              >
                <SelectTrigger id="payment-service">
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id.toString()}>
                      {service.service_type} - {getClientName(service.client_id)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="payment-amount" className="text-sm font-medium">
                Valor (R$) *
              </label>
              <Input
                id="payment-amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                value={newPayment.amount}
                onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="payment-due-date" className="text-sm font-medium">
                Data de Vencimento *
              </label>
              <Input
                id="payment-due-date"
                type="date"
                value={newPayment.due_date}
                onChange={(e) => setNewPayment({ ...newPayment, due_date: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="payment-date" className="text-sm font-medium">
                Data de Pagamento (se já foi pago)
              </label>
              <Input
                id="payment-date"
                type="date"
                value={newPayment.payment_date}
                onChange={(e) => setNewPayment({ 
                  ...newPayment, 
                  payment_date: e.target.value,
                  status: e.target.value ? 'paid' : 'pending'
                })}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="payment-status" className="text-sm font-medium">
                Status
              </label>
              <Select
                value={newPayment.status}
                onValueChange={(value) => setNewPayment({ 
                  ...newPayment, 
                  status: value as 'pending' | 'paid' | 'overdue',
                  // Clear payment date if status is not paid
                  payment_date: value === 'paid' ? newPayment.payment_date : '',
                })}
              >
                <SelectTrigger id="payment-status">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                  <SelectItem value="overdue">Atrasado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="payment-method" className="text-sm font-medium">
                Método de Pagamento
              </label>
              <Input
                id="payment-method"
                placeholder="Ex: Pix, Boleto, Cartão, etc."
                value={newPayment.payment_method}
                onChange={(e) => setNewPayment({ ...newPayment, payment_method: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="payment-notes" className="text-sm font-medium">
                Observações
              </label>
              <Input
                id="payment-notes"
                placeholder="Informações adicionais sobre o pagamento"
                value={newPayment.notes}
                onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPaymentDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAddPayment}
              disabled={!newPayment.service_id || !newPayment.amount || !newPayment.due_date || createPaymentMutation.isPending}
            >
              {createPaymentMutation.isPending ? "Registrando..." : "Registrar Pagamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Finances;
