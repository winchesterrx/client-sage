import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Home, Users, Settings, BarChart3, ListChecks, DollarSign, Package } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar = ({ isOpen }: SidebarProps) => {
  const { user } = useAuth();
  const { pathname } = useLocation();

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-gray-50 border-r border-gray-200 transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0 lg:sticky top-0 h-screen"
      )}
    >
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <Link to="/" className="text-2xl font-bold text-blue-600">
          Clientes<span className="text-gray-600">OWL</span>
        </Link>
      </div>

      <div className="px-4 py-6">
        {/* Main Navigation */}
        <div className="space-y-1">
          <Link
            to="/dashboard"
            className={cn(
              "flex items-center py-2 px-4 text-sm font-medium rounded-md",
              pathname === "/dashboard"
                ? "bg-primary-foreground text-primary"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <Home className="mr-3 h-5 w-5" />
            Dashboard
          </Link>

          <Link
            to="/clients"
            className={cn(
              "flex items-center py-2 px-4 text-sm font-medium rounded-md",
              pathname === "/clients" || pathname.startsWith("/clients/")
                ? "bg-primary-foreground text-primary"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <Users className="mr-3 h-5 w-5" />
            Clientes
          </Link>

          <Link
            to="/services"
            className={cn(
              "flex items-center py-2 px-4 text-sm font-medium rounded-md",
              pathname === "/services" || pathname.startsWith("/services/")
                ? "bg-primary-foreground text-primary"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <Package className="mr-3 h-5 w-5" />
            Serviços
          </Link>

          <Link
            to="/projects"
            className={cn(
              "flex items-center py-2 px-4 text-sm font-medium rounded-md",
              pathname === "/projects" || pathname.startsWith("/projects/")
                ? "bg-primary-foreground text-primary"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <ListChecks className="mr-3 h-5 w-5" />
            Projetos
          </Link>

          <Link
            to="/finances"
            className={cn(
              "flex items-center py-2 px-4 text-sm font-medium rounded-md",
              pathname === "/finances"
                ? "bg-primary-foreground text-primary"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <DollarSign className="mr-3 h-5 w-5" />
            Financeiro
          </Link>

          <Link
            to="/settings"
            className={cn(
              "flex items-center py-2 px-4 text-sm font-medium rounded-md",
              pathname === "/settings"
                ? "bg-primary-foreground text-primary"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <Settings className="mr-3 h-5 w-5" />
            Configurações
          </Link>
          
          {/* Show user management link only for master users */}
          {user && user.role === 'master' && (
            <Link
              to="/admin/users"
              className={cn(
                "flex items-center py-2 px-4 text-sm font-medium rounded-md",
                pathname === "/admin/users" 
                  ? "bg-primary-foreground text-primary"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <Users className="mr-3 h-5 w-5" />
              Usuários
            </Link>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full border-t border-gray-200 p-4">
        {user ? (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-900">{user.name}</div>
            <div className="text-xs text-gray-500">{user.email}</div>
            <Button variant="secondary" size="sm" className="w-full" onClick={() => {}}>
              Sair
            </Button>
          </div>
        ) : (
          <Link to="/login" className="text-sm font-medium text-blue-600 hover:text-blue-500">
            Entrar
          </Link>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
