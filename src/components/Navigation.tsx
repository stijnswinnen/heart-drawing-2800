import { Link, useLocation } from "react-router-dom";
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

export const Navigation = ({
  isDrawing,
  transparentOverHero = false,
}: {
  isDrawing?: boolean;
  transparentOverHero?: boolean;
}) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [showAuth, setShowAuth] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [navT, setNavT] = useState(transparentOverHero ? 0 : 1);
  const [scrolled, setScrolled] = useState(!transparentOverHero);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!transparentOverHero) {
      setNavT(1);
      setScrolled(true);
      return;
    }
    setNavT(0);
    setScrolled(window.scrollY > 8);
    const onState = (e: Event) => {
      const detail = (e as CustomEvent).detail as { navT: number; scrollY: number };
      setNavT(detail.navT);
      setScrolled(detail.scrollY > 8);
    };
    window.addEventListener("hero-nav-state", onState as EventListener);
    return () => window.removeEventListener("hero-nav-state", onState as EventListener);
  }, [transparentOverHero]);

  const floating = transparentOverHero;
  const headerStyle = floating
    ? {
        background: `rgba(251,250,247,${0.92 * navT})`,
        backdropFilter: navT > 0.05 ? "saturate(140%) blur(12px)" : "none",
        WebkitBackdropFilter: navT > 0.05 ? "saturate(140%) blur(12px)" : "none",
        borderBottomColor: `rgba(235,229,222,${navT})`,
      }
    : {
        background: "rgba(251,250,247,0.85)",
        backdropFilter: "saturate(140%) blur(10px)",
        WebkitBackdropFilter: "saturate(140%) blur(10px)",
      };
  const headerClass = floating
    ? "fixed top-0 left-0 right-0 z-50 border-b"
    : "sticky top-0 z-50 border-b border-line";
  const isLight = floating && !scrolled;

  if (isDrawing) {
    return null;
  }

  const links = [
    { path: "/", label: "Teken een hart" },
    { path: "/mijn-favoriete-plek", label: "Deel jouw plek" },
    { path: "/locaties", label: "Hartjes" },
    { path: "/over", label: "Over" },
  ];

  const handleLogout = async () => {
    try {
      cleanupAuthState();
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (error: any) {
        if (!error?.message?.includes('session_not_found')) {
          console.error('Logout error:', error);
        }
      }
      setSession(null);
      toast.success('Je bent succesvol uitgelogd');
      setTimeout(() => { window.location.href = '/'; }, 100);
    } catch (error) {
      setSession(null);
      cleanupAuthState();
      window.location.href = '/';
    }
  };

  const Brand = () => (
    <Link
      to="/"
      className="inline-flex items-center gap-2 font-sans font-semibold tracking-[-0.01em] text-[15px] text-ink"
    >
      <span className="w-2 h-2 rounded-full bg-pink-500" aria-hidden="true" />
      <span>2800<span className="opacity-50">.love</span></span>
    </Link>
  );

  const DesktopLinks = () => (
    <nav className="flex gap-7 ml-2 font-sans">
      {links.map((link) => {
        const active = location.pathname === link.path;
        return (
          <Link
            key={link.path}
            to={link.path}
            className={`text-[14px] font-normal py-1.5 border-b-[1.5px] transition-colors ${
              active
                ? "text-ink border-ink"
                : "text-ink-muted border-transparent hover:text-ink"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );

  const ghostBtn =
    "inline-flex items-center justify-center gap-2 h-10 px-[18px] rounded-full text-[14px] font-medium font-sans text-ink bg-transparent border border-transparent hover:bg-pink-50 transition-colors";
  const outlineBtn =
    "inline-flex items-center justify-center gap-2 h-10 px-[18px] rounded-full text-[14px] font-medium font-sans text-ink bg-surface border border-line-strong hover:border-ink-2 transition-colors";

  const Actions = () => (
    <div className="flex items-center gap-2">
      {session ? (
        <>
          <Link to="/profile" className={ghostBtn}>
            <User className="h-4 w-4" />
            Mijn profiel
          </Link>
          <button onClick={handleLogout} className={outlineBtn}>
            Uitloggen
          </button>
        </>
      ) : (
        <button onClick={() => setShowAuth(true)} className={outlineBtn}>
          Inloggen
        </button>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <>
        <header
          className="sticky top-0 z-50 border-b border-line"
          style={{
            background: "rgba(251,250,247,0.85)",
            backdropFilter: "saturate(140%) blur(10px)",
            WebkitBackdropFilter: "saturate(140%) blur(10px)",
          }}
        >
          <div className="h-16 px-5 flex items-center justify-between max-w-[1200px] mx-auto">
            <Brand />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent className="!bg-background">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="mt-8 flex flex-col gap-1 font-sans">
                  {links.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`px-3 py-2 rounded-md text-sm ${
                        location.pathname === link.path
                          ? "bg-pink-50 text-ink"
                          : "text-ink-muted hover:text-ink"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="mt-6">
                    <Actions />
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </header>
        {showAuth && <AuthDialog onClose={() => setShowAuth(false)} />}
      </>
    );
  }

  return (
    <>
      <header
        className="sticky top-0 z-50 border-b border-line"
        style={{
          background: "rgba(251,250,247,0.85)",
          backdropFilter: "saturate(140%) blur(10px)",
          WebkitBackdropFilter: "saturate(140%) blur(10px)",
        }}
      >
        <div className="max-w-[1200px] mx-auto h-16 px-7 flex items-center gap-8">
          <Brand />
          <DesktopLinks />
          <div className="flex-1" />
          <Actions />
        </div>
      </header>
      {showAuth && <AuthDialog onClose={() => setShowAuth(false)} />}
    </>
  );
};
