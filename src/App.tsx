
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import FloatingActionButton from "@/components/ui/floating-action-button";
import { MessageCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

// Pages
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/clients/Clients";
import ClientDetail from "./pages/clients/ClientDetail";
import Services from "./pages/services/Services";
import ServiceDetail from "./pages/services/ServiceDetail";
import Projects from "./pages/projects/Projects";
import ProjectDetail from "./pages/projects/ProjectDetail";
import Finances from "./pages/finances/Finances";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const isMobile = useIsMobile();
  
  const openWhatsApp = () => {
    window.open('https://wa.me/5517997799982', '_blank');
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
        <Route path="/clients" element={<AppLayout><Clients /></AppLayout>} />
        <Route path="/clients/:id" element={<AppLayout><ClientDetail /></AppLayout>} />
        <Route path="/services" element={<AppLayout><Services /></AppLayout>} />
        <Route path="/services/:id" element={<AppLayout><ServiceDetail /></AppLayout>} />
        <Route path="/projects" element={<AppLayout><Projects /></AppLayout>} />
        <Route path="/projects/:id" element={<AppLayout><ProjectDetail /></AppLayout>} />
        <Route path="/finances" element={<AppLayout><Finances /></AppLayout>} />
        <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <FloatingActionButton 
        variant="whatsapp" 
        icon={<MessageCircle className="h-6 w-6" />} 
        onClick={openWhatsApp} 
        position={isMobile ? "bottom-right" : "bottom-right"}
        className={isMobile ? "mb-4 mr-4" : ""}
        aria-label="Contato via WhatsApp"
      />
    </>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
