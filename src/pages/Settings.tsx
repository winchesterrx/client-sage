
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Database, Github, Globe, Mail, Phone, Settings as SettingsIcon, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const Settings = () => {
  const [supabaseStatus, setSupabaseStatus] = React.useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  
  React.useEffect(() => {
    const checkConnection = async () => {
      try {
        const { data, error } = await supabase.from('clients').select('count', { count: 'exact', head: true });
        setSupabaseStatus(error ? 'disconnected' : 'connected');
      } catch (e) {
        setSupabaseStatus('disconnected');
      }
    };
    
    checkConnection();
  }, []);

  const openGithub = () => {
    window.open('https://github.com/winchesterrx', '_blank');
  };
  
  const toggleFeature = (feature: string, value: boolean) => {
    // Simulando a alteração das configurações
    toast.success(`${feature} ${value ? 'ativado' : 'desativado'} com sucesso!`);
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-500 mt-1">Gerencie as configurações do sistema</p>
      </div>
      
      <Tabs defaultValue="perfil" className="w-full">
        <TabsList className="grid grid-cols-3 md:grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="banco">Banco de Dados</TabsTrigger>
          <TabsTrigger value="sistema">Sistema</TabsTrigger>
          <TabsTrigger value="avancado">Avançado</TabsTrigger>
        </TabsList>
        
        <TabsContent value="perfil" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                Gerencie seus dados de contato e informações pessoais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input id="name" defaultValue="Gabriel Silva" />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="contato@gabrielsilva.dev" />
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" defaultValue="+55 17 99779-9982" />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" defaultValue="gabrielsilva.dev" />
                </div>
              </div>
              
              <div className="flex items-center space-x-2 mt-4">
                <Button onClick={openGithub} variant="outline" size="sm">
                  <Github className="mr-2 h-4 w-4" />
                  Github
                </Button>
                <span className="text-sm text-muted-foreground">github.com/winchesterrx</span>
              </div>
              
              <div className="flex justify-end">
                <Button>Salvar Alterações</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="banco" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Status do Banco de Dados</CardTitle>
                <Badge variant={supabaseStatus === 'connected' ? 'success' : 'destructive'}>
                  {supabaseStatus === 'connected' ? 'Conectado' : 'Desconectado'}
                </Badge>
              </div>
              <CardDescription>
                Informações sobre a conexão com o Supabase
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-md bg-primary-foreground border border-border">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  <span className="font-medium">Supabase Status</span>
                </div>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">URL:</span>
                    <span className="text-sm font-medium">cfukngxrvrajjhiagktj.supabase.co</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Projeto:</span>
                    <span className="text-sm font-medium">Client Manager</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Tabelas:</span>
                    <span className="text-sm font-medium">6 tabelas</span>
                  </div>
                </div>
              </div>
              
              {supabaseStatus === 'disconnected' && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md flex items-start space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Conexão não estabelecida</h4>
                    <p className="mt-1 text-sm text-yellow-700">
                      Verifique suas credenciais do Supabase e tente novamente.
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  className="mr-2"
                  onClick={() => {
                    setSupabaseStatus('checking');
                    setTimeout(() => {
                      setSupabaseStatus('connected');
                      toast.success('Conexão com o banco de dados verificada com sucesso!');
                    }, 1500);
                  }}
                >
                  Testar Conexão
                </Button>
                <Button>Atualizar Credenciais</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sistema" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Preferências do Sistema</CardTitle>
              <CardDescription>
                Personalize a aparência e o comportamento do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode">Modo Escuro</Label>
                  <p className="text-sm text-muted-foreground">
                    Ative o tema escuro para o sistema
                  </p>
                </div>
                <Switch 
                  id="dark-mode" 
                  checked={darkMode} 
                  onCheckedChange={(checked) => {
                    setDarkMode(checked);
                    toggleFeature('Modo escuro', checked);
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Notificações</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba alertas sobre eventos importantes
                  </p>
                </div>
                <Switch 
                  id="notifications" 
                  checked={notificationsEnabled} 
                  onCheckedChange={(checked) => {
                    setNotificationsEnabled(checked);
                    toggleFeature('Notificações', checked);
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-save">Salvamento Automático</Label>
                  <p className="text-sm text-muted-foreground">
                    Salve automaticamente os dados ao editar
                  </p>
                </div>
                <Switch 
                  id="auto-save" 
                  checked={autoSave} 
                  onCheckedChange={(checked) => {
                    setAutoSave(checked);
                    toggleFeature('Salvamento automático', checked);
                  }}
                />
              </div>
              
              <div className="flex justify-end">
                <Button variant="outline" className="mr-2">Restaurar Padrões</Button>
                <Button>Salvar Preferências</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="avancado" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Avançadas</CardTitle>
              <CardDescription>
                Opções avançadas para usuários experientes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Cache e Armazenamento</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" size="sm" className="justify-start">
                    Limpar Cache
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start">
                    Limpar Armazenamento Local
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Backup e Restauração</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" size="sm" className="justify-start">
                    Exportar Dados
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start">
                    Importar Backup
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="api-key">Chave da API</Label>
                <div className="flex">
                  <Input id="api-key" value="sk_live_51NsGw6CYP2sJnPPqXWasjNE0q53Kg" readOnly className="rounded-r-none" />
                  <Button variant="secondary" className="rounded-l-none">
                    Copiar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Use esta chave para acessar a API do sistema. Mantenha-a segura!
                </p>
              </div>
              
              <div className="flex justify-end">
                <Button variant="destructive" className="mr-2">Redefinir Sistema</Button>
                <Button>Salvar</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
