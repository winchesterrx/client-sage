
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserCheck, UserX, Shield, Users, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const UserManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = React.useState<string | null>(null);

  // Redirect if not master user
  React.useEffect(() => {
    if (user && user.role !== 'master') {
      navigate('/dashboard');
      toast({
        title: 'Acesso negado',
        description: 'Você não tem permissão para acessar esta página.',
        variant: 'destructive',
      });
    }
  }, [user, navigate, toast]);

  // Fetch all users
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const allUsers = await db.users.getAll();
      return allUsers;
    },
  });

  // Mutation para atualizar convite
  const updateUserMutation = useMutation({
    mutationFn: async ({
      userId,
      status,
      active,
    }: {
      userId: number;
      status: 'accepted' | 'rejected';
      active: boolean;
    }) => {
      console.log(`[MUTATION] Atualizando usuário ID: ${userId}, Status: ${status}, Active: ${active}`);

      try {
        const result = await db.users.updateInvitationStatus(userId, status, active);
        console.log('[MUTATION] Resultado:', result);
        return result;
      } catch (error) {
        console.error('[MUTATION] Erro:', error);
        throw error;
      }
    },
    onSuccess: () => {
      setError(null);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err: any) => {
      console.error('Erro na mutação de update:', err);
      setError(err.message || 'Ocorreu um erro ao processar a solicitação.');
    },
  });

  const handleInvitation = async (userId: number, accepted: boolean) => {
    try {
      setError(null);
      const status = accepted ? 'accepted' as const : 'rejected' as const;
      
      await updateUserMutation.mutateAsync({ 
        userId, 
        status, 
        active: accepted 
      });

      toast({
        title: accepted ? 'Convite aceito' : 'Convite rejeitado',
        description: accepted
          ? 'O usuário agora tem acesso ao sistema.'
          : 'O usuário foi rejeitado e não poderá acessar o sistema.',
      });
    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao processar a solicitação.',
        variant: 'destructive',
      });
    }
  };

  const pendingInvitations =
    users?.filter((u) => u.invitation_status === 'pending') || [];

  const activeUsers =
    users?.filter((u) => u.invitation_status !== 'pending') || [];

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
        <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
        <p className="text-gray-500 mt-1">Gerencie os usuários do sistema</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Pending Invitations */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader className="bg-blue-100">
          <CardTitle className="flex items-center text-blue-700">
            <Users className="mr-2 h-6 w-6" />
            Convites Pendentes
          </CardTitle>
          <CardDescription>
            Usuários aguardando aprovação para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingInvitations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Data de Cadastro</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingInvitations.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {user.role === 'admin'
                          ? 'Administrador'
                          : user.role === 'manager'
                          ? 'Gerente'
                          : user.role === 'master'
                          ? 'Master'
                          : 'Usuário'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 border-green-600 hover:bg-green-100"
                          onClick={() => handleInvitation(user.id, true)}
                          disabled={updateUserMutation.isPending}
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          Aceitar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-600 hover:bg-red-100"
                          onClick={() => handleInvitation(user.id, false)}
                          disabled={updateUserMutation.isPending}
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
              Não há convites pendentes no momento.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-6 w-6" />
            Usuários do Sistema
          </CardTitle>
          <CardDescription>
            Todos os usuários com acesso ao sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Último Login</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {user.role === 'admin'
                        ? 'Administrador'
                        : user.role === 'manager'
                        ? 'Gerente'
                        : user.role === 'master'
                        ? 'Master'
                        : 'Usuário'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.active ? (
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800 hover:bg-green-200"
                      >
                        Ativo
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-red-100 text-red-800 hover:bg-red-200"
                      >
                        Inativo
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.last_login
                      ? new Date(user.last_login).toLocaleDateString('pt-BR')
                      : 'Nunca'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
