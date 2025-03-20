
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { formatDate } from '@/utils/formatters';
import { Plus, Search, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import StatusBadge from '@/components/ui/status-badge';

const Projects = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: api.projects.getAll,
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: api.clients.getAll,
  });
  
  // Filter projects based on search query
  const filteredProjects = React.useMemo(() => {
    if (!searchQuery.trim()) return projects;
    
    const query = searchQuery.toLowerCase();
    return projects.filter(
      (project) => 
        project.name.toLowerCase().includes(query) ||
        (project.description?.toLowerCase().includes(query) || false) ||
        clients.find(c => c.id === project.client_id)?.name.toLowerCase().includes(query)
    );
  }, [projects, clients, searchQuery]);

  const getClientName = (clientId: number) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Cliente não encontrado';
  };

  const getProjectStatusInfo = (status: string) => {
    switch (status) {
      case 'planning':
        return { label: 'Planejamento', color: 'blue' };
      case 'in_progress':
        return { label: 'Em Andamento', color: 'yellow' };
      case 'completed':
        return { label: 'Concluído', color: 'green' };
      case 'on_hold':
        return { label: 'Em Espera', color: 'gray' };
      default:
        return { label: status, color: 'gray' };
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Projetos</h1>
        <Button asChild>
          <Link to="/clients" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Novo Projeto</span>
          </Link>
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Buscar projetos ou clientes..."
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
      ) : filteredProjects.length > 0 ? (
        <div className="space-y-4">
          {filteredProjects.map((project) => {
            const statusInfo = getProjectStatusInfo(project.status);
            
            return (
              <Card key={project.id} className="border hover:shadow-sm transition-shadow">
                <CardContent className="p-0">
                  <div className="p-4 border-b flex justify-between items-center">
                    <div className="flex flex-col">
                      <h3 className="font-medium">{project.name}</h3>
                      <Link 
                        to={`/clients/${project.client_id}`}
                        className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
                      >
                        {getClientName(project.client_id)}
                      </Link>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={statusInfo.label} color={statusInfo.color} />
                    </div>
                  </div>
                  <div className="p-4 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">
                        {formatDate(project.start_date)}
                        {project.end_date && ` - ${formatDate(project.end_date)}`}
                      </p>
                      {project.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-1">{project.description}</p>
                      )}
                    </div>
                    <Button asChild variant="ghost" size="icon">
                      <Link to={`/projects/${project.id}`}>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="bg-gray-50 border-dashed border-2 border-gray-200">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="text-gray-500 mb-4">Nenhum projeto encontrado</p>
            <Button asChild variant="outline">
              <Link to="/clients" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>Adicionar Projeto</span>
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Projects;
