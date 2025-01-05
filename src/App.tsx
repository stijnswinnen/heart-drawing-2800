import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import Privacy from "./pages/Privacy";
import Verify from "./pages/Verify";
import Hearts from "./pages/Hearts";
import Over from "./pages/Over";
import FavoritePlek from "./pages/FavoritePlek";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SessionContextProvider supabaseClient={supabase}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout hideNavigation><Index /></Layout>} />
            <Route path="/admin" element={<Layout><Admin /></Layout>} />
            <Route path="/privacy" element={<Layout><Privacy /></Layout>} />
            <Route path="/verify" element={<Layout><Verify /></Layout>} />
            <Route path="/hearts" element={<Layout><Hearts /></Layout>} />
            <Route path="/over" element={<Layout><Over /></Layout>} />
            <Route path="/mijn-favoriete-plek" element={<Layout><FavoritePlek /></Layout>} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </SessionContextProvider>
  </QueryClientProvider>
);

export default App;