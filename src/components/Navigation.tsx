import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import { AuthDialog } from "@/components/AuthDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cleanupAuthState } from "@/utils/authCleanup";

export const Navigation = ({ isDrawing }: { isDrawing?: boolean }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [showAuth, setShowAuth] = useState(false);
  const [session, setSession] = useState<any>(null);
  
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);
  
  if (location.pathname === "/" && isDrawing) {
    return null;
  }
  
  const links = [
    { path: "/", label: "Teken een hart" },
    { path: "/mijn-favoriete-plek", label: "Deel jouw plek" },
    { path: "/hearts", label: "Hartjes" },
    { path: "/over", label: "Over 2800.love" },
  ];

  const handleLogout = async () => {
    try {
      // Clean up auth state first
      cleanupAuthState();
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (error: any) {
        // Handle session_not_found as successful logout since user is effectively logged out
        if (!error?.message?.includes('session_not_found')) {
          console.error('Logout error:', error);
          // Don't show error for session_not_found since user is already logged out
        }
      }
      
      // Reset session state
      setSession(null);
      
      // Force page refresh for clean state and show success message
      toast.success('Je bent succesvol uitgelogd');
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    } catch (error) {
      console.error('Unexpected error during logout:', error);
      // Even if there's an error, ensure user is logged out locally
      setSession(null);
      cleanupAuthState();
      window.location.href = '/';
    }
  };

  const NavLinks = () => (
    <div className="flex flex-col md:flex-row items-center w-full relative h-full">
      <ul className="flex flex-col md:flex-row justify-center items-center font-['Inter'] w-full h-full">
        {links.map((link) => (
          <li key={link.path} className="h-full">
            <Link
              to={link.path}
              className={`px-6 h-full flex items-center transition-all duration-300 ${
                location.pathname === link.path 
                  ? "bg-white" 
                  : "text-foreground"
              }`}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-4 md:mt-0 md:absolute md:right-4 flex gap-2">
        {session ? (
          <>
            <Button 
              variant="outline" 
              size="sm"
              asChild
            >
              <Link to="/profile">
                <User className="h-4 w-4 mr-2" />
                Mijn profiel
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLogout}
            >
              Uitloggen
            </Button>
          </>
        ) : (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowAuth(true)}
          >
            Inloggen
          </Button>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <div className="h-16 bg-[#F26D85]/10 backdrop-blur-sm relative" />
        <div className="absolute top-4 right-4 z-50">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="bg-white/90 hover:bg-white">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-white">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="mt-8">
                <NavLinks />
              </nav>
            </SheetContent>
          </Sheet>
          {showAuth && <AuthDialog onClose={() => setShowAuth(false)} />}
        </div>
      </>
    );
  }

  return (
    <>
      <nav className="w-full bg-[#F26D85]/10 backdrop-blur-sm h-16 px-4">
        <NavLinks />
      </nav>
      {showAuth && <AuthDialog onClose={() => setShowAuth(false)} />}
    </>
  );
};