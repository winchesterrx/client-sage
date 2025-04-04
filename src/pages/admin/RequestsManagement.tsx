
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserCheck, UserX, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const RequestsManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Redirect if not admin or master user
  React.useEffect(() => {
    if (user && user.role !== 'master' && user.role !== 'admin') {
      navigate('/dashboard');
      toast.error("Você não tem permissão para acessar esta página.");
    }
  }, [user, navigate]);

  // Fetch pending invitations
  const { data: pendingUsers, isLoading } = useQuery({
    queryKey: ['pending-users'],
    queryFn: async () => {
      try {
        const users = await db.users.getPendingInvitations();
        return users;
      } catch (error) {
        console.error('Error fetching pending users:', error);
        toast.error('Erro ao carregar solicitações pendentes');
        return [];
      }
    },
  });

  // Mutation to update user status
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, status, active }: { userId: number, status: 'accepted' | 'rejected', active: boolean }) => {
      return await db.users.updateInvitationStatus(userId, status, active);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-users'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

const handleInvitation = async (userId: number, status: 'accepted' | 'rejected') => {
  console.log(`Aprovando ou rejeitando usuário ID: ${userId} com status: ${status}`);

  try {
    await updateUserMutation.mutateAsync({ 
      userId, 
      status, 
      active: status === 'accepted'
    });
    
    toast.success(status === 'accepted' 
      ? "Usuário aprovado com sucesso" 
      : "Solicitação rejeitada");
  } catch (error) {
    console.error('Error updating user:', error);
    toast.error("Erro ao processar solicitação");
  }
};


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
        <h1 className="text-3xl font-bold text-gray-900">Solicitações de Cadastro</h1>
        <p className="text-gray-500 mt-1">Gerencie as solicitações de novos usuários</p>
      </div>

      <Card className="border-2 border-orange-200 bg-orange-50">
        <CardHeader className="bg-orange-100">
          <CardTitle className="flex items-center text-orange-700">
            <ClipboardList className="mr-2 h-6 w-6" />
            Solicitações Pendentes
          </CardTitle>
          <CardDescription>
            Novos usuários aguardando aprovação para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingUsers && pendingUsers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Data de Solicitação</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {user.role === 'admin' ? 'Administrador' : 
                         user.role === 'manager' ? 'Gerente' : 
                         user.role === 'master' ? 'Master' : 'Usuário'}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-green-600 border-green-600 hover:bg-green-100"
                          onClick={() => handleInvitation(user.id, 'accepted')}
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          Aprovar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 border-red-600 hover:bg-red-100"
                          onClick={() => handleInvitation(user.id, 'rejected')}
                        >
                          <UserX className="h-4 w-4 mr-1" />
                          Rejeitar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6 text-gray-500">
              Não há solicitações pendentes no momento.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RequestsManagement;
