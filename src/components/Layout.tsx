import { Navigation } from "./Navigation";

interface LayoutProps {
  children: React.ReactNode;
  hideNavigation?: boolean;
}

export const Layout = ({ children, hideNavigation }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      {!hideNavigation && <Navigation />}
      {children}
      <div className="fixed bottom-4 left-4 flex items-center gap-4">
        {/* This div is now present on all pages */}
      </div>
    </div>
  );
};