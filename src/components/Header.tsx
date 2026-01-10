import { Button } from "@/components/ui/button";
import { GraduationCap, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const navigation = [
    { name: "Courses", href: "/courses" },
    { name: "About", href: "#about" },
    { name: "Contact", href: "#contact" },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    // If link is a route, navigate directly
    if (href.startsWith('/')) {
      navigate(href);
      setIsMenuOpen(false);
      return;
    }

    const sectionId = href.replace('#', '');
    
    // If not on home page, navigate to home first then scroll
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: sectionId } });
      return;
    }
    
    // Smooth scroll to section
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
              <img src="/icon transparent.png" alt="Logo" className="w-12 h-12" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="text-muted-foreground hover:text-primary transition-colors duration-200 cursor-pointer"
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* Sign In / Dashboard Button */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to={user ? "/dashboard" : "/login"}>
              <Button variant="outline" className="border-primary bg-primary text-white hover:bg-primary/80 hover:text-white">
                {user ? "Dashboard" : "Sign In"}
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 animate-fade-in">
            <div className="flex flex-col space-y-3">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-muted-foreground hover:text-primary transition-colors duration-200 px-4 py-2 cursor-pointer"
                  onClick={(e) => handleNavClick(e, item.href)}
                >
                  {item.name}
                </a>
              ))}
              <div className="px-4 pt-4">
                <Link to={user ? "/dashboard" : "/login"}>
                  <Button 
                    variant="outline" 
                    className="w-full border-primary bg-primary text-white hover:bg-primary/90 hover:text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {user ? "Dashboard" : "Sign In"}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;