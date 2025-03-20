
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { ArrowLeft, Eye, EyeOff, Copy, ExternalLink, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from '@/components/ui/status-badge';
import { toast } from 'sonner';

const ServiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const serviceId = Number(id);
  const navigate = useNavigate();
  
  const [showPassword, setShowPassword] = React.useState(false);

  // Fetch service data
  const { data: service, isLoading: isLoadingService } = useQuery({
    queryKey: ['service', serviceId],
    queryFn: () => api.services.getById(serviceId),
  });

  // Fetch client data for this service
  const { data: client } = useQuery({
    queryKey: ['client', service?.client_id],
    queryFn: () => api.clients.getById(service?.client_id as number),
    enabled: !!service?.client_id,
  });

  // Fetch payments for this service
  const { data: payments = [] } = useQuery({
    queryKey: ['servicePayments', serviceId],
    queryFn: () => api.payments.getByService(serviceId),
    enabled: !!serviceId,
  });

  if (isLoadingService) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-gray-500">Carregando...</div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Serviço não encontrado</h2>
        <p className="text-gray-500 mb-6">O serviço que você está procurando não existe ou foi removido.</p>
        <Button asChild>
          <Link to="/services">Voltar para Serviços</Link>
        </Button>
      </div>
    );
  }

  // Helper functions
  const getServiceStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return { label: 'Ativo', color: 'green' };
      case 'inactive':
        return { label: 'Inativo', color: 'gray' };
      case 'pending':
        return { label: 'Pendente', color: 'yellow' };
      default:
        return { label: status, color: 'gray' };
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para a área de transferência!');
  };

  const statusInfo = getServiceStatusInfo(service.status);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" asChild>
            <Link to="/services">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{service.service_type}</h1>
            {client && (
              <Link 
                to={`/clients/${client.id}`}
                className="text-gray-500 hover:text-blue-600 transition-colors"
              >
                {client.name}
              </Link>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <StatusBadge status={statusInfo.label} color={statusInfo.color} />
          <Button
            className="flex items-center gap-2"
            onClick={() => navigate(`/clients/${service.client_id}`)}
          >
            <Edit className="h-4 w-4" />
            <span>Editar</span>
          </Button>
        </div>
      </div>

      {/* Service Info Card */}
      <Card className="bg-white shadow-sm border">
        <CardHeader>
          <CardTitle>Detalhes do Serviço</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Tipo de Serviço</p>
                <p className="font-medium">{service.service_type}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Preço Mensal</p>
                <p className="font-medium">{formatCurrency(service.price)}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <StatusBadge status={statusInfo.label} color={statusInfo.color} />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
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
              
              <div>
                <p className="text-sm text-gray-500">Usuário</p>
                <div className="flex items-center justify-between">
                  <p>{service.username}</p>
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
              
              <div>
                <p className="text-sm text-gray-500">Senha</p>
                <div className="flex items-center justify-between">
                  <p>{showPassword ? service.password : '••••••••'}</p>
                  <div className="flex items-center">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Payments */}
      <Card className="bg-white shadow-sm border">
        <CardHeader>
          <CardTitle>Pagamentos Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 text-sm font-medium text-gray-500">Valor</th>
                    <th className="text-left p-2 text-sm font-medium text-gray-500">Vencimento</th>
                    <th className="text-left p-2 text-sm font-medium text-gray-500">Pagamento</th>
                    <th className="text-left p-2 text-sm font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => {
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
                    
                    const statusInfo = getPaymentStatusInfo(payment.status, payment.due_date);
                    
                    return (
                      <tr key={payment.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{formatCurrency(payment.amount)}</td>
                        <td className="p-2">{formatDate(payment.due_date)}</td>
                        <td className="p-2">{payment.payment_date ? formatDate(payment.payment_date) : '—'}</td>
                        <td className="p-2">
                          <StatusBadge status={statusInfo.label} color={statusInfo.color} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Nenhum pagamento registrado para este serviço.</p>
          )}
          
          <div className="mt-4">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate(`/clients/${service.client_id}`)}
            >
              Ver Todos os Pagamentos
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceDetail;
