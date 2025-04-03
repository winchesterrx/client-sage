
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { clientsDb } from '@/lib/supabase/database/clients';
import { ArrowLeft, Pencil, Trash2, Phone, Mail, MapPin, RefreshCw } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import ClientServicesTable from '@/components/clients/ClientServicesTable';
import ClientPaymentsTable from '@/components/clients/ClientPaymentsTable';
import ClientProjectsTable from '@/components/clients/ClientProjectsTable';
import AddPaymentForm from '@/components/clients/AddPaymentForm';
import { Service, Payment, Project, Client } from '@/types/database';

const ClientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const clientId = parseInt(id || '0');
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<Client | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchClientData = async () => {
    if (!clientId) return;
    
    setLoading(true);
    try {
      const { client, services, payments, projects } = await clientsDb.getWithDetails(clientId);
      
      setClient(client);
      setServices(services);
      setPayments(payments);
      setProjects(projects);
    } catch (error) {
      console.error('Error fetching client details:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar detalhes do cliente',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientData();
  }, [clientId, refreshKey]);

  const handleDeleteClient = async () => {
    if (!client) return;
    
    try {
      await clientsDb.delete(client.id);
      toast({
        title: 'Sucesso',
        description: 'Cliente excluído com sucesso',
      });
      navigate('/clients');
    } catch (error) {
      console.error('Error deleting client:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir cliente',
        variant: 'destructive',
      });
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-4">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">Cliente não encontrado</h2>
          <p className="mb-4">O cliente solicitado não foi encontrado ou não existe.</p>
          <Button asChild>
            <Link to="/clients">Voltar para a lista de clientes</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/clients">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Clientes
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/clients/edit/${client.id}`}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Isso excluirá permanentemente o cliente e todos os dados associados.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteClient}>Excluir</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{client.name}</CardTitle>
          <CardDescription>Detalhes do cliente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
              <span>{client.city || 'Cidade não informada'}</span>
            </div>
            <div className="flex items-center">
              <Phone className="h-5 w-5 mr-2 text-muted-foreground" />
              <span>{client.phone || 'Telefone não informado'}</span>
            </div>
            <div className="flex items-center">
              <Mail className="h-5 w-5 mr-2 text-muted-foreground" />
              <span>{client.email || 'Email não informado'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="services" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="services" className="flex-1">
            Serviços ({services.length})
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex-1">
            Pagamentos ({payments.length})
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex-1">
            Projetos ({projects.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="services" className="mt-4">
          <div className="flex justify-end mb-4">
            <Button asChild>
              <Link to={`/services/new?client_id=${client.id}`}>
                Adicionar Serviço
              </Link>
            </Button>
          </div>
          <ClientServicesTable services={services} />
        </TabsContent>
        
        <TabsContent value="payments" className="mt-4 space-y-6">
          <AddPaymentForm clientId={client.id} onPaymentAdded={handleRefresh} />
          
          <Separator className="my-4" />
          
          <ClientPaymentsTable payments={payments} onPaymentUpdated={handleRefresh} />
        </TabsContent>
        
        <TabsContent value="projects" className="mt-4">
          <div className="flex justify-end mb-4">
            <Button asChild>
              <Link to={`/projects/new?client_id=${client.id}`}>
                Adicionar Projeto
              </Link>
            </Button>
          </div>
          <ClientProjectsTable projects={projects} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientDetail;
