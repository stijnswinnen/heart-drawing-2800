import { Link, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { AuthDialog } from "@/components/AuthDialog";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export const Navigation = ({ isDrawing }: { isDrawing?: boolean }) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [showAuth, setShowAuth] = useState(false);
  const [session, setSession] = useState<any>(null);
  
  useEffect(() => {
    // Fetch initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);
  
  // Hide navigation when drawing on index page
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
    await supabase.auth.signOut();
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
      <div className="mt-4 md:mt-0 md:absolute md:right-0">
        {session ? (
          <Button 
            variant="outline" 
            onClick={handleLogout}
          >
            Uitloggen
          </Button>
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