
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Users, 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  CreditCard, 
  Settings, 
  LogOut,
  CircleUser
} from 'lucide-react';
import { cn } from '@/lib/utils';

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    label: 'Clientes',
    href: '/clients',
    icon: <Users className="h-5 w-5" />,
  },
  {
    label: 'Serviços',
    href: '/services',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    label: 'Projetos',
    href: '/projects',
    icon: <Briefcase className="h-5 w-5" />,
  },
  {
    label: 'Finanças',
    href: '/finances',
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    label: 'Configurações',
    href: '/settings',
    icon: <Settings className="h-5 w-5" />,
  },
];

const Sidebar = () => {
  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col fixed">
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-2">
            <CircleUser className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold text-gray-900">Client Manager</h1>
            <p className="text-xs text-gray-500">Gerenciador de clientes</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group hover:bg-gray-100",
                isActive ? "bg-blue-50 text-blue-600" : "text-gray-700"
              )
            }
          >
            <span className="transition-colors duration-200">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t">
        <button className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-all duration-200">
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
