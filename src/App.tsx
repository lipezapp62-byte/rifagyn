import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Cadastro from "./pages/auth/Cadastro";
import CampaignPage from "./pages/campanha/[id]";
import AppDashboard from "./pages/app/DashboardApp";
import AdminDashboard from "./pages/admin/DashboardAdmin";
import NewCampaign from "./pages/admin/NewCampaign";
import NotFound from "./pages/NotFound";
import DashboardApp from "./pages/app/DashboardApp";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Index />} />
          <Route path="/campanha/:slug" element={<CampaignPage />} />

          {/* Auth */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/cadastro" element={<Cadastro />} />

          {/* User */}
          <Route path="/app/home" element={<DashboardApp />} />
          <Route path="/app/dashboard" element={<DashboardApp />} />

          {/* Admin */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/NewCampaign" element={<NewCampaign />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
