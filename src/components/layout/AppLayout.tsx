
import React, { useEffect } from 'react';
import Sidebar from './Sidebar';
import { initializeDatabase } from '@/services/api';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  useEffect(() => {
    // Initialize database with sample data
    initializeDatabase();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64">
        <div className="container mx-auto py-8 px-6 max-w-7xl animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
