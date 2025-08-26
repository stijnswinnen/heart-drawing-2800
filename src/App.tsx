import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import Privacy from "./pages/Privacy";
import Verify from "./pages/Verify";
import Hearts from "./pages/Hearts";
import Over from "./pages/Over";
import FavoritePlek from "./pages/FavoritePlek";

import LocatiesList from "./pages/LocatiesList";
import Profile from "./pages/Profile";
import ResetPassword from "./pages/ResetPassword";
import Auth from "./pages/Auth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SessionContextProvider supabaseClient={supabase}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/hearts" element={<Hearts />} />
            <Route path="/over" element={<Over />} />
            <Route path="/mijn-favoriete-plek" element={<FavoritePlek />} />
            
            <Route path="/locaties" element={<LocatiesList />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </SessionContextProvider>
  </QueryClientProvider>
);

export default App;