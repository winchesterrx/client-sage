
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { Github, Mail, Phone, Shield, WhatsappIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

const Footer = () => {
  const openWhatsApp = () => {
    window.open('https://wa.me/5517997799982', '_blank');
  };

  return (
    <footer className="mt-auto py-6 px-6 bg-white border-t">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <p className="text-sm text-muted-foreground">
              © 2025 Desenvolvido por Gabriel Silva
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-green-600 border-green-600 hover:bg-green-50"
              onClick={openWhatsApp}
            >
              <WhatsappIcon className="h-4 w-4 mr-2" />
              Contato
            </Button>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Termos de Uso
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Termos de Uso</SheetTitle>
                  <SheetDescription>
                    Última atualização: {new Date().toLocaleDateString()}
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-4 text-sm">
                  <p>
                    Estes Termos de Uso estabelecem as regras para uso do sistema de gerenciamento de clientes.
                    Ao utilizar nossa plataforma, você concorda com estas condições.
                  </p>
                  <h3 className="text-base font-medium">1. Aceitação dos Termos</h3>
                  <p>
                    Ao acessar ou usar o sistema, você concorda em cumprir e estar vinculado a estes Termos de Uso.
                  </p>
                  <h3 className="text-base font-medium">2. Privacidade</h3>
                  <p>
                    Respeitamos sua privacidade. Consulte nossa Política de Privacidade para entender como coletamos e usamos seus dados.
                  </p>
                  <h3 className="text-base font-medium">3. Contas de Usuário</h3>
                  <p>
                    Você é responsável por manter a confidencialidade de sua conta e senha.
                  </p>
                  <h3 className="text-base font-medium">4. Uso do Serviço</h3>
                  <p>
                    O sistema deve ser usado apenas para fins legais e de acordo com estes termos.
                  </p>
                </div>
              </SheetContent>
            </Sheet>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Privacidade
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Política de Privacidade</SheetTitle>
                  <SheetDescription>
                    Última atualização: {new Date().toLocaleDateString()}
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-4 text-sm">
                  <p>
                    Proteger sua privacidade é extremamente importante para nós. Esta Política de Privacidade explica como coletamos, usamos e protegemos suas informações.
                  </p>
                  <h3 className="text-base font-medium">1. Informações Coletadas</h3>
                  <p>
                    Coletamos informações que você fornece diretamente, como dados de cadastro e informações de clientes.
                  </p>
                  <h3 className="text-base font-medium">2. Uso das Informações</h3>
                  <p>
                    Usamos suas informações para fornecer e melhorar nossos serviços, processar transações e enviar comunicações relevantes.
                  </p>
                  <h3 className="text-base font-medium">3. Armazenamento e Segurança</h3>
                  <p>
                    Implementamos medidas de segurança para proteger suas informações contra acesso não autorizado ou alteração.
                  </p>
                  <h3 className="text-base font-medium">4. Compartilhamento de Dados</h3>
                  <p>
                    Não compartilhamos seus dados pessoais com terceiros sem seu consentimento, exceto quando exigido por lei.
                  </p>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          <div className="flex items-center space-x-4">
            <a href="mailto:contato@gabrielsilva.dev" className="text-muted-foreground hover:text-foreground">
              <Mail className="h-4 w-4" />
            </a>
            <a href="https://github.com/gabrielsilva" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
              <Github className="h-4 w-4" />
            </a>
            <a href="tel:+5517997799982" className="text-muted-foreground hover:text-foreground">
              <Phone className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
