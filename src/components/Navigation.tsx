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
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        toast.error('Er ging iets mis bij het uitloggen');
        return;
      }
      
      // Clear any stored session data
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.clear();
      
      // Reset session state
      setSession(null);
      
      // Navigate to home and show success message
      navigate('/');
      toast.success('Je bent succesvol uitgelogd');
    } catch (error) {
      console.error('Unexpected error during logout:', error);
      toast.error('Er ging iets mis bij het uitloggen');
    }
  };

  const NavLinks = () => (
    <div className="flex flex-col md:flex-row items-center w-full relative">
      <ul className="flex flex-col md:flex-row justify-center items-center gap-8 font-['Inter'] w-full">
        {links.map((link) => (
          <li key={link.path}>
            <Link
              to={link.path}
              className={`text hover:opacity-70 transition-opacity ${
                location.pathname === link.path ? "opacity-70" : "opacity-100"
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
              asChild
            >
              <Link to="/profile">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Link>
            </Button>
            <Button 
              variant="outline" 
              onClick={handleLogout}
            >
              Uitloggen
            </Button>
          </>
        ) : (
          <Button 
            variant="outline" 
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
      <div className="fixed top-4 right-4 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent>
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
    );
  }

  return (
    <>
      <nav className="w-full py-8">
        <NavLinks />
      </nav>
      {showAuth && <AuthDialog onClose={() => setShowAuth(false)} />}
    </>
  );
};