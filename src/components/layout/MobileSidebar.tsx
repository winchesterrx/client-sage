
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Users, 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  CreditCard, 
  Settings, 
  LogOut,
  CircleUser,
  Menu,
  X
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
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

const MobileSidebar = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed top-0 left-0 z-40 w-full bg-white border-b border-gray-200 h-16 flex items-center px-4">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="mr-4">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <div className="h-full flex flex-col">
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
            
            <nav className="flex-1 p-4 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={() => setOpen(false)}
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
          </div>
        </SheetContent>
      </Sheet>
      
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-1.5">
          <CircleUser className="h-5 w-5 text-white" />
        </div>
        <h1 className="text-base font-semibold text-gray-900">Client Manager</h1>
      </div>
    </div>
  );
};

export default MobileSidebar;
