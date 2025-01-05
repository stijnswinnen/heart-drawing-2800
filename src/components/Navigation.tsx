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

export const Navigation = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const links = [
    { path: "/", label: "Teken een hart" },
    { path: "/hearts", label: "Hartjes" },
    { path: "/over", label: "Over 2800.love" },
  ];

  const NavLinks = () => (
    <ul className="flex flex-col md:flex-row justify-center items-center gap-8 font-['Inter']">
      {links.map((link) => (
        <li key={link.path}>
          <Link
            to={link.path}
            className={`text-lg hover:opacity-70 transition-opacity ${
              location.pathname === link.path ? "opacity-70" : "opacity-100"
            }`}
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
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
      </div>
    );
  }

  return (
    <nav className="w-full py-8">
      <NavLinks />
    </nav>
  );
};