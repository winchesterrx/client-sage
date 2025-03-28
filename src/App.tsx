
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import FloatingActionButton from "@/components/ui/floating-action-button";
import { WhatsappIcon } from "lucide-react";

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

const App = () => {
  const openWhatsApp = () => {
    window.open('https://wa.me/5517997799982', '_blank');
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
            icon={<WhatsappIcon className="h-6 w-6" />} 
            onClick={openWhatsApp} 
            aria-label="Contato via WhatsApp"
          />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
