
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { formatDate } from '@/utils/formatters';
import { ArrowLeft, Calendar, CalendarCheck, Edit, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from '@/components/ui/status-badge';

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const projectId = Number(id);
  const navigate = useNavigate();
  
  // Fetch project data
  const { data: project, isLoading: isLoadingProject } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => api.projects.getById(projectId),
  });

  // Fetch client data for this project
  const { data: client } = useQuery({
    queryKey: ['client', project?.client_id],
    queryFn: () => api.clients.getById(project?.client_id as number),
    enabled: !!project?.client_id,
  });

  if (isLoadingProject) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-gray-500">Carregando...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Projeto não encontrado</h2>
        <p className="text-gray-500 mb-6">O projeto que você está procurando não existe ou foi removido.</p>
        <Button asChild>
          <Link to="/projects">Voltar para Projetos</Link>
        </Button>
      </div>
    );
  }

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

  const statusInfo = getProjectStatusInfo(project.status);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" asChild>
            <Link to="/projects">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
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
            onClick={() => navigate(`/clients/${project.client_id}`)}
          >
            <Edit className="h-4 w-4" />
            <span>Editar</span>
          </Button>
        </div>
      </div>

      {/* Project Info Card */}
      <Card className="bg-white shadow-sm border">
        <CardHeader>
          <CardTitle>Detalhes do Projeto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Nome do Projeto</p>
                <p className="font-medium">{project.name}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <StatusBadge status={statusInfo.label} color={statusInfo.color} />
              </div>
              
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-gray-500">Data de Início</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p>{formatDate(project.start_date)}</p>
                  </div>
                </div>
                
                {project.end_date && (
                  <div>
                    <p className="text-sm text-gray-500">Data de Conclusão</p>
                    <div className="flex items-center gap-2 mt-1">
                      <CalendarCheck className="h-4 w-4 text-gray-400" />
                      <p>{formatDate(project.end_date)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Cliente</p>
                <div className="flex items-center gap-2 mt-1">
                  <User className="h-4 w-4 text-gray-400" />
                  {client ? (
                    <Link 
                      to={`/clients/${client.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {client.name}
                    </Link>
                  ) : (
                    <p>Cliente não encontrado</p>
                  )}
                </div>
              </div>
              
              {project.description && (
                <div>
                  <p className="text-sm text-gray-500">Descrição</p>
                  <p className="mt-1">{project.description}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* For future development: Add tasks, notes, files, etc. */}
      <Card className="bg-white shadow-sm border">
        <CardHeader>
          <CardTitle>Tarefas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">Ainda não há tarefas para este projeto.</p>
          <Button variant="outline" className="w-full">
            Adicionar Tarefa
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectDetail;
