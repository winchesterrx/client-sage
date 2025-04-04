
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileSidebar from './MobileSidebar';
import Footer from './Footer';
import { useIsMobile } from '@/hooks/use-mobile'; // Fixed hook import
import { Menu } from 'lucide-react';

const AppLayout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  // Function to toggle mobile sidebar
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Desktop sidebar - only show on desktop */}
      {!isMobile && (
        <div className="w-64 hidden md:block">
          <Sidebar />
        </div>
      )}

      {/* Mobile sidebar */}
      {isMobile && (
        <MobileSidebar open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen} />
      )}

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm h-16 flex items-center px-4">
          {/* Mobile menu button */}
          {isMobile && (
            <button
              onClick={toggleMobileSidebar}
              className="mr-4 text-gray-500 focus:outline-none"
            >
              <Menu className="h-6 w-6" />
            </button>
          )}

          <div className="flex-1">
            {/* Header content */}
          </div>

          {/* User dropdown can go here */}
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default AppLayout;
