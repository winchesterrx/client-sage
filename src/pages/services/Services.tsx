
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { formatCurrency } from '@/utils/formatters';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from '@/components/ui/status-badge';

const Services = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  
  const { data: services = [], isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: api.services.getAll,
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: api.clients.getAll,
  });
  
  // Filter services based on search query
  const filteredServices = React.useMemo(() => {
    if (!searchQuery.trim()) return services;
    
    const query = searchQuery.toLowerCase();
    return services.filter(
      (service) => 
        service.service_type.toLowerCase().includes(query) ||
        clients.find(c => c.id === service.client_id)?.name.toLowerCase().includes(query)
    );
  }, [services, clients, searchQuery]);

  const getClientName = (clientId: number) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Cliente não encontrado';
  };

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

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Serviços</h1>
        <Button asChild>
          <Link to="/clients" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Novo Serviço</span>
          </Link>
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Buscar serviços ou clientes..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-gray-500">Carregando...</div>
        </div>
      ) : filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((service) => {
            const statusInfo = getServiceStatusInfo(service.status);
            
            return (
              <Card key={service.id} className="border hover:shadow-sm transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{service.service_type}</CardTitle>
                      <Link 
                        to={`/clients/${service.client_id}`}
                        className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
                      >
                        {getClientName(service.client_id)}
                      </Link>
                    </div>
                    <StatusBadge status={statusInfo.label} color={statusInfo.color} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Preço Mensal</span>
                      <span className="font-medium">{formatCurrency(service.price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Link</span>
                      <a 
                        href={service.access_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline truncate max-w-[180px]"
                      >
                        {service.access_link}
                      </a>
                    </div>
                    <div className="flex mt-4">
                      <Button asChild variant="outline" className="w-full">
                        <Link to={`/services/${service.id}`}>Ver Detalhes</Link>
                      </Button>
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
            <p className="text-gray-500 mb-4">Nenhum serviço encontrado</p>
            <Button asChild variant="outline">
              <Link to="/clients" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>Adicionar Serviço</span>
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Services;
