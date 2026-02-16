import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Shield, Search, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleAuthClick = () => navigate('/auth');
  const handleSignOut = async () => { await signOut(); navigate('/'); };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold text-foreground">
              ID Mkononi
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#community" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Community</a>
            <a href="#collection-points" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Locations</a>
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/search')}>
              <Search className="w-4 h-4 mr-1" />
              Find My ID
            </Button>
            {user ? (
              <>
                <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
                  <LayoutDashboard className="w-4 h-4 mr-1" />
                  Dashboard
                </Button>
                <Button variant="ghost" size="icon" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button variant="default" size="sm" onClick={handleAuthClick}>
                Sign In
              </Button>
            )}
          </div>

          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-3 border-t border-border">
            <nav className="flex flex-col gap-1">
              <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground py-2 px-2">How It Works</a>
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground py-2 px-2">Features</a>
              <a href="#community" className="text-sm text-muted-foreground hover:text-foreground py-2 px-2">Community</a>
              <a href="#collection-points" className="text-sm text-muted-foreground hover:text-foreground py-2 px-2">Locations</a>
              <div className="flex flex-col gap-2 pt-3 border-t border-border mt-2">
                <Button variant="outline" className="w-full" onClick={() => navigate('/search')}>
                  <Search className="w-4 h-4 mr-2" />
                  Find My ID
                </Button>
                {user ? (
                  <>
                    <Button variant="outline" className="w-full" onClick={() => navigate('/dashboard')}>
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                    <Button variant="ghost" className="w-full" onClick={handleSignOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Button variant="default" className="w-full" onClick={handleAuthClick}>
                    Sign In
                  </Button>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
