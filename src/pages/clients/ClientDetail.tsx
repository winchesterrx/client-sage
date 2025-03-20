import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { 
  formatPhone, 
  openWhatsApp, 
  formatCurrency, 
  formatDate,
  getServiceStatusInfo,
  getPaymentStatusInfo,
  getProjectStatusInfo
} from '@/utils/formatters';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Edit,
  FileText,
  CreditCard,
  Briefcase,
  Plus,
  MoreHorizontal,
  ExternalLink,
  Eye,
  EyeOff,
  Copy,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatusBadge from '@/components/ui/status-badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

const ClientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const clientId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPasswordMap, setShowPasswordMap] = useState<Record<number, boolean>>({});
  const [editClient, setEditClient] = useState({
    name: '',
    city: '',
    phone: '',
    email: '',
  });

  // Service forms
  const [showAddServiceDialog, setShowAddServiceDialog] = useState(false);
  const [newService, setNewService] = useState({
    service_type: '',
    price: '',
    access_link: '',
    username: '',
    password: '',
    status: 'active',
  });

  // Payment forms
  const [showAddPaymentDialog, setShowAddPaymentDialog] = useState(false);
  const [newPayment, setNewPayment] = useState({
    service_id: '',
    amount: '',
    payment_date: '',
    due_date: '',
    status: 'pending',
    payment_method: '',
    notes: '',
  });

  // Project forms
  const [showAddProjectDialog, setShowAddProjectDialog] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    status: 'planning',
    start_date: '',
  });

  // Fetch client data
  const { data: client, isLoading: isLoadingClient } = useQuery({
    queryKey: ['client', clientId],
    queryFn: () => api.clients.getById(clientId),
  });

  // Set edit form data when client data is loaded
  useEffect(() => {
    if (client) {
      setEditClient({
        name: client.name,
        city: client.city,
        phone: client.phone,
        email: client.email || '',
      });
    }
  }, [client]);

  // Fetch client services
  const { data: services = [], refetch: refetchServices } = useQuery({
    queryKey: ['clientServices', clientId],
    queryFn: () => api.services.getByClient(clientId),
    enabled: !!clientId,
  });

  // Fetch client payments
  const { data: payments = [], refetch: refetchPayments } = useQuery({
    queryKey: ['clientPayments', clientId],
    queryFn: () => api.payments.getByClient(clientId),
    enabled: !!clientId,
  });

  // Fetch client projects
  const { data: projects = [], refetch: refetchProjects } = useQuery({
    queryKey: ['clientProjects', clientId],
    queryFn: () => api.projects.getByClient(clientId),
    enabled: !!clientId,
  });

  if (isLoadingClient) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-gray-500">Carregando...</div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Cliente não encontrado</h2>
        <p className="text-gray-500 mb-6">O cliente que você está procurando não existe ou foi removido.</p>
        <Button asChild>
          <Link to="/clients">Voltar para Clientes</Link>
        </Button>
      </div>
    );
  }

  // Handle client update
  const handleUpdateClient = async () => {
    try {
      await api.clients.update(clientId, editClient);
      queryClient.invalidateQueries({ queryKey: ['client', clientId] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setShowEditDialog(false);
      toast.success('Cliente atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating client:', error);
      toast.error('Erro ao atualizar cliente');
    }
  };

  // Handle adding a new service
  const handleAddService = async () => {
    try {
      const serviceData = {
        client_id: clientId,
        service_type: newService.service_type,
        price: parseFloat(newService.price),
        access_link: newService.access_link,
        username: newService.username,
        password: newService.password,
        status: newService.status,
      };
      
      await api.services.create(serviceData);
      refetchServices();
      setShowAddServiceDialog(false);
      setNewService({
        service_type: '',
        price: '',
        access_link: '',
        username: '',
        password: '',
        status: 'active',
      });
      toast.success('Serviço adicionado com sucesso!');
    } catch (error) {
      console.error('Error adding service:', error);
      toast.error('Erro ao adicionar serviço');
    }
  };

  // Handle adding a new payment
  const handleAddPayment = async () => {
    try {
      const paymentData = {
        client_id: clientId,
        service_id: parseInt(newPayment.service_id),
        amount: parseFloat(newPayment.amount),
        payment_date: newPayment.payment_date || null,
        due_date: newPayment.due_date,
        status: newPayment.status,
        payment_method: newPayment.payment_method || null,
        notes: newPayment.notes || null,
      };
      
      await api.payments.create(paymentData);
      refetchPayments();
      setShowAddPaymentDialog(false);
      setNewPayment({
        service_id: '',
        amount: '',
        payment_date: '',
        due_date: '',
        status: 'pending',
        payment_method: '',
        notes: '',
      });
      toast.success('Pagamento adicionado com sucesso!');
    } catch (error) {
      console.error('Error adding payment:', error);
      toast.error('Erro ao adicionar pagamento');
    }
  };

  // Handle adding a new project
  const handleAddProject = async () => {
    try {
      const projectData = {
        client_id: clientId,
        name: newProject.name,
        description: newProject.description || null,
        status: newProject.status,
        start_date: newProject.start_date,
        end_date: null,
      };
      
      await api.projects.create(projectData);
      refetchProjects();
      setShowAddProjectDialog(false);
      setNewProject({
        name: '',
        description: '',
        status: 'planning',
        start_date: '',
      });
      toast.success('Projeto adicionado com sucesso!');
    } catch (error) {
      console.error('Error adding project:', error);
      toast.error('Erro ao adicionar projeto');
    }
  };

  // Copy password to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para a área de transferência!');
  };

  // Toggle password visibility
  const togglePasswordVisibility = (serviceId: number) => {
    setShowPasswordMap(prev => ({
      ...prev,
      [serviceId]: !prev[serviceId]
    }));
  };

  // Delete service
  const handleDeleteService = async (serviceId: number) => {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) return;
    
    try {
      await api.services.delete(serviceId);
      refetchServices();
      toast.success('Serviço excluído com sucesso!');
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Erro ao excluir serviço');
    }
  };

  // Delete payment
  const handleDeletePayment = async (paymentId: number) => {
    if (!confirm('Tem certeza que deseja excluir este pagamento?')) return;
    
    try {
      await api.payments.delete(paymentId);
      refetchPayments();
      toast.success('Pagamento excluído com sucesso!');
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast.error('Erro ao excluir pagamento');
    }
  };

  // Delete project
  const handleDeleteProject = async (projectId: number) => {
    if (!confirm('Tem certeza que deseja excluir este projeto?')) return;
    
    try {
      await api.projects.delete(projectId);
      refetchProjects();
      toast.success('Projeto excluído com sucesso!');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Erro ao excluir projeto');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" asChild>
            <Link to="/clients">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
            <p className="text-gray-500">{client.city}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => openWhatsApp(client.phone)}
          >
            <Phone className="h-4 w-4 text-green-500" />
            <span>WhatsApp</span>
          </Button>
          <Button
            onClick={() => setShowEditDialog(true)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            <span>Editar</span>
          </Button>
        </div>
      </div>

      {/* Client Info Card */}
      <Card className="bg-white shadow-sm border">
        <CardHeader>
          <CardTitle>Informações do Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col gap-1">
              <p className="text-sm text-gray-500">Nome</p>
              <div className="flex items-center gap-2">
                <p className="font-medium">{client.name}</p>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm text-gray-500">Cidade</p>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <p>{client.city}</p>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm text-gray-500">Telefone</p>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <p>{formatPhone(client.phone)}</p>
              </div>
            </div>
            {client.email && (
              <div className="flex flex-col gap-1">
                <p className="text-sm text-gray-500">Email</p>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <p>{client.email}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Services, Payments, and Projects */}
      <Tabs defaultValue="services">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="services" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Serviços</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span>Pagamentos</span>
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            <span>Projetos</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Services Tab */}
        <TabsContent value="services">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Serviços</h2>
            <Button
              onClick={() => setShowAddServiceDialog(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Adicionar Serviço</span>
            </Button>
          </div>
          
          {services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => {
                const statusInfo = getServiceStatusInfo(service.status);
                const isPasswordVisible = showPasswordMap[service.id] || false;
                
                return (
                  <Card key={service.id} className="border">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{service.service_type}</CardTitle>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={statusInfo.label} color={statusInfo.color} />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleDeleteService(service.id)}>
                                <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                                <span className="text-red-500">Excluir</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-500">Preço Mensal</p>
                        <p className="font-medium">{formatCurrency(service.price)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">Link de Acesso</p>
                        <div className="flex items-center justify-between">
                          <p className="text-sm truncate max-w-[200px]">{service.access_link}</p>
                          <div className="flex items-center">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7"
                              onClick={() => window.open(service.access_link, '_blank')}
                            >
                              <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7"
                              onClick={() => copyToClipboard(service.access_link)}
                            >
                              <Copy className="h-3.5 w-3.5 text-gray-400" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">Usuário</p>
                        <div className="flex items-center justify-between">
                          <p className="text-sm">{service.username}</p>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7"
                            onClick={() => copyToClipboard(service.username)}
                          >
                            <Copy className="h-3.5 w-3.5 text-gray-400" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">Senha</p>
                        <div className="flex items-center justify-between">
                          <p className="text-sm">
                            {isPasswordVisible ? service.password : '••••••••'}
                          </p>
                          <div className="flex items-center">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7"
                              onClick={() => togglePasswordVisibility(service.id)}
                            >
                              {isPasswordVisible ? (
                                <EyeOff className="h-3.5 w-3.5 text-gray-400" />
                              ) : (
                                <Eye className="h-3.5 w-3.5 text-gray-400" />
                              )}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7"
                              onClick={() => copyToClipboard(service.password)}
                            >
                              <Copy className="h-3.5 w-3.5 text-gray-400" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="bg-gray-50 border-dashed border-2 border-gray-200">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <p className="text-gray-500 mb-4">Nenhum serviço cadastrado</p>
                <Button
                  onClick={() => setShowAddServiceDialog(true)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Adicionar Serviço</span>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Payments Tab */}
        <TabsContent value="payments">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Pagamentos</h2>
            <Button
              onClick={() => setShowAddPaymentDialog(true)}
              className="flex items-center gap-2"
              disabled={!services.length}
            >
              <Plus className="h-4 w-4" />
              <span>Registrar Pagamento</span>
            </Button>
          </div>
          
          {payments.length > 0 ? (
            <Card className="border">
              <CardContent className="p-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 text-sm font-medium text-gray-500">Serviço</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-500">Valor</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-500">Vencimento</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-500">Pagamento</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-500">Status</th>
                      <th className="text-right p-4 text-sm font-medium text-gray-500">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => {
                      const service = services.find(s => s.id === payment.service_id);
                      const statusInfo = getPaymentStatusInfo(payment.status, payment.due_date);
                      
                      return (
                        <tr key={payment.id} className="border-b hover:bg-gray-50">
                          <td className="p-4">{service?.service_type || 'N/A'}</td>
                          <td className="p-4 font-medium">{formatCurrency(payment.amount)}</td>
                          <td className="p-4">{formatDate(payment.due_date)}</td>
                          <td className="p-4">{payment.payment_date ? formatDate(payment.payment_date) : '—'}</td>
                          <td className="p-4">
                            <StatusBadge status={statusInfo.label} color={statusInfo.color} />
                          </td>
                          <td className="p-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleDeletePayment(payment.id)}>
                                  <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                                  <span className="text-red-500">Excluir</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gray-50 border-dashed border-2 border-gray-200">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <p className="text-gray-500 mb-4">Nenhum pagamento registrado</p>
                {services.length > 0 ? (
                  <Button
                    onClick={() => setShowAddPaymentDialog(true)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Registrar Pagamento</span>
                  </Button>
                ) : (
                  <p className="text-sm text-gray-400">
                    Adicione um serviço antes de registrar pagamentos
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Projects Tab */}
        <TabsContent value="projects">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Projetos</h2>
            <Button
              onClick={() => setShowAddProjectDialog(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Adicionar Projeto</span>
            </Button>
          </div>
          
          {projects.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {projects.map((project) => {
                const statusInfo = getProjectStatusInfo(project.status);
                
                return (
                  <Card key={project.id} className="border hover:shadow-sm transition-shadow">
                    <CardContent className="p-0">
                      <div className="p-4 border-b flex justify-between items-center">
                        <div className="flex flex-col">
                          <h3 className="font-medium">{project.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <StatusBadge status={statusInfo.label} color={statusInfo.color} />
                            <span className="text-xs text-gray-500">
                              {formatDate(project.start_date)}
                              {project.end_date && ` - ${formatDate(project.end_date)}`}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => navigate(`/projects/${project.id}`)}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Ver Detalhes</span>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleDeleteProject(project.id)}>
                                <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                                <span className="text-red-500">Excluir</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      {project.description && (
                        <div className="p-4">
                          <p className="text-sm text-gray-600">{project.description}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="bg-gray-50 border-dashed border-2 border-gray-200">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <p className="text-gray-500 mb-4">Nenhum projeto cadastrado</p>
                <Button
                  onClick={() => setShowAddProjectDialog(true)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Adicionar Projeto</span>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Client Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label htmlFor="edit-name" className="text-sm font-medium">
                  Nome
                </label>
                <Input
                  id="edit-name"
                  value={editClient.name}
                  onChange={(e) => setEditClient({ ...editClient, name: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="edit-city" className="text-sm font-medium">
                  Cidade
                </label>
                <Input
                  id="edit-city"
                  value={editClient.city}
                  onChange={(e) => setEditClient({ ...editClient, city: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="edit-phone" className="text-sm font-medium">
                  Telefone
                </label>
                <Input
                  id="edit-phone"
                  value={editClient.phone}
                  onChange={(e) => setEditClient({ ...editClient, phone: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="edit-email" className="text-sm font-medium">
                  Email (opcional)
                </label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editClient.email}
                  onChange={(e) => setEditClient({ ...editClient, email: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateClient} disabled={!editClient.name || !editClient.city || !editClient.phone}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Service Dialog */}
      <Dialog open={showAddServiceDialog} onOpenChange={setShowAddServiceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Serviço</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label htmlFor="service-type" className="text-sm font-medium">
                  Tipo de Serviço
                </label>
                <Input
                  id="service-type"
                  placeholder="Ex: Website, E-commerce, Marketing, etc."
                  value={newService.service_type}
                  onChange={(e) => setNewService({ ...newService, service_type: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="service-price" className="text-sm font-medium">
                  Preço Mensal (R$)
                </label>
                <Input
                  id="service-price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                  value={newService.price}
                  onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="service-link" className="text-sm font-medium">
                  Link de Acesso
                </label>
                <Input
                  id="service-link"
                  type="url"
                  placeholder="https://"
                  value={newService.access_link}
                  onChange={(e) => setNewService({ ...newService, access_link: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="service-username" className="text-sm font-medium">
                  Usuário
                </label>
                <Input
                  id="service-username"
                  placeholder="Nome de usuário"
                  value={newService.username}
                  onChange={(e) => setNewService({ ...newService, username: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="service-password" className="text-sm font-medium">
                  Senha
                </label>
                <Input
                  id="service-password"
                  type="password"
                  placeholder="Senha"
                  value={newService.password}
                  onChange={(e) => setNewService({ ...newService, password: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="service-status" className="text-sm font-medium">
                  Status
                </label>
                <select
                  id="service-status"
                  className="w-full border rounded-md p-2"
                  value={newService.status}
                  onChange={(e) => setNewService({ ...newService, status: e.target.value })}
                >
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                  <option value="pending">Pendente</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddServiceDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAddService} 
              disabled={
                !newService.service_type || 
                !newService.price || 
                !newService.access_link || 
                !newService.username || 
                !newService.password
              }
            >
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Payment Dialog */}
      <Dialog open={showAddPaymentDialog} onOpenChange={setShowAddPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label htmlFor="payment-service" className="text-sm font-medium">
                  Serviço
                </label>
                <select
                  id="payment-service"
                  className="w-full border rounded-md p-2"
                  value={newPayment.service_id}
                  onChange={(e) => setNewPayment({ ...newPayment, service_id: e.target.value })}
                >
                  <option value="">Selecione um serviço</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.service_type} - {formatCurrency(service.price)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="payment-amount" className="text-sm font-medium">
                  Valor (R$)
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
                  Data de Vencimento
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
                  Data de Pagamento (opcional)
                </label>
                <Input
                  id="payment-date"
                  type="date"
                  value={newPayment.payment_date}
                  onChange={(e) => setNewPayment({ ...newPayment, payment_date: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="payment-status" className="text-sm font-medium">
                  Status
                </label>
                <select
                  id="payment-status"
                  className="w-full border rounded-md p-2"
                  value={newPayment.status}
                  onChange={(e) => setNewPayment({ ...newPayment, status: e.target.value })}
                >
                  <option value="pending">Pendente</option>
                  <option value="paid">Pago</option>
                  <option value="overdue">Atrasado</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="payment-method" className="text-sm font-medium">
                  Método de Pagamento (opcional)
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
                  Observações (opcional)
                </label>
                <Input
                  id="payment-notes"
                  placeholder="Observações adicionais"
                  value={newPayment.notes}
                  onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPaymentDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAddPayment} 
              disabled={!newPayment.service_id || !newPayment.amount || !newPayment.due_date}
            >
              Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Project Dialog */}
      <Dialog open={showAddProjectDialog} onOpenChange={setShowAddProjectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Projeto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label htmlFor="project-name" className="text-sm font-medium">
                  Nome do Projeto
                </label>
                <Input
                  id="project-name"
                  placeholder="Nome do projeto"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="project-description" className="text-sm font-medium">
                  Descrição (opcional)
                </label>
                <Input
                  id="project-description"
                  placeholder="Descrição do projeto"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="project-status" className="text-sm font-medium">
                  Status
                </label>
                <select
                  id="project-status"
                  className="w-full border rounded-md p-2"
                  value={newProject.status}
                  onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                >
                  <option value="planning">Planejamento</option>
                  <option value="in_progress">Em Andamento</option>
                  <option value="completed">Concluído</option>
                  <option value="on_hold">Em Espera</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="project-start-date" className="text-sm font-medium">
                  Data de Início
                </label>
                <Input
                  id="project-start-date"
                  type="date"
                  value={newProject.start_date}
                  onChange={(e) => setNewProject({ ...newProject, start_date: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddProjectDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAddProject} 
              disabled={!newProject.name || !newProject.start_date}
            >
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientDetail;
