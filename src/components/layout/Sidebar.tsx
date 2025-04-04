
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { useAuth } from '@/contexts/AuthContext';
import { 
  Home, Users, Briefcase, FileText, FolderClosed, Settings, 
  DollarSign, LogOut, ShieldAlert, ClipboardList
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  
  const isAdmin = user?.role === 'admin' || user?.role === 'master';

  const handleLogout = () => {
    logout();
  };

  // Navigation items
  const navItems = [
    { icon: <Home className="mr-3 h-5 w-5" />, name: "Dashboard", path: "/dashboard" },
    { icon: <Users className="mr-3 h-5 w-5" />, name: "Clientes", path: "/clients" },
    { icon: <Briefcase className="mr-3 h-5 w-5" />, name: "Serviços", path: "/services" },
    { icon: <FolderClosed className="mr-3 h-5 w-5" />, name: "Projetos", path: "/projects" },
    { icon: <FileText className="mr-3 h-5 w-5" />, name: "Finanças", path: "/finances" },
  ];

  // Admin only items
  const adminItems = [
    { icon: <ShieldAlert className="mr-3 h-5 w-5" />, name: "Usuários", path: "/admin/users" },
    { icon: <ClipboardList className="mr-3 h-5 w-5" />, name: "Solicitações", path: "/admin/requests" },
  ];

  return (
    <aside className="h-full flex flex-col bg-white border-r shadow-sm">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold text-gray-800">SysAdmin</h2>
        <p className="text-sm text-gray-500">Gerenciamento de sistemas</p>
      </div>

      <div className="flex flex-col flex-1 overflow-y-auto p-4">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center text-sm px-3 py-2 rounded-md transition-colors",
                  isActive 
                    ? "text-white bg-blue-600 hover:bg-blue-700" 
                    : "text-gray-700 hover:bg-gray-100"
                )
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {isAdmin && (
          <>
            <div className="my-4">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Administração
              </div>
              <div className="mt-2 space-y-1">
                {adminItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center text-sm px-3 py-2 rounded-md transition-colors",
                        isActive 
                          ? "text-white bg-blue-600 hover:bg-blue-700" 
                          : "text-gray-700 hover:bg-gray-100"
                      )
                    }
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="mt-auto">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                "flex items-center text-sm px-3 py-2 rounded-md transition-colors",
                isActive 
                  ? "text-white bg-blue-600 hover:bg-blue-700" 
                  : "text-gray-700 hover:bg-gray-100"
              )
            }
          >
            <Settings className="mr-3 h-5 w-5" />
            <span>Configurações</span>
          </NavLink>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center text-sm px-3 py-2 mt-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
