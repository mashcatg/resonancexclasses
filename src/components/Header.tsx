import { Button } from "@/components/ui/button";
import { GraduationCap, Menu, X, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCoursesDropdownOpen, setIsCoursesDropdownOpen] = useState(false);
  const [isMobileCoursesOpen, setIsMobileCoursesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const courseCategories = [
    { name: "SSC", href: "/courses?category=SSC" },
    { name: "HSC", href: "/courses?category=HSC" },
    { name: "Admission", href: "/courses?category=Admission" },
  ];

  const navigation = [
    { name: "About", href: "#about" },
    { name: "Contact", href: "#contact" },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCoursesDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleCategoryClick = (href: string) => {
    navigate(href);
    setIsCoursesDropdownOpen(false);
    setIsMenuOpen(false);
    setIsMobileCoursesOpen(false);
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
            {/* Courses Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors duration-200 cursor-pointer"
                onMouseEnter={() => setIsCoursesDropdownOpen(true)}
                onClick={() => setIsCoursesDropdownOpen(!isCoursesDropdownOpen)}
              >
                Courses
                <ChevronDown className={`h-4 w-4 transition-transform ${isCoursesDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isCoursesDropdownOpen && (
                <div 
                  className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-border py-2 animate-fade-in"
                  onMouseLeave={() => setIsCoursesDropdownOpen(false)}
                >
                  {courseCategories.map((category) => (
                    <button
                      key={category.name}
                      onClick={() => handleCategoryClick(category.href)}
                      className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-secondary/50 transition-colors"
                    >
                      {category.name}
                    </button>
                  ))}
                  <button
                    onClick={() => handleCategoryClick('/courses')}
                    className="w-full text-left px-4 py-2 text-sm font-medium text-primary hover:bg-secondary/50 transition-colors"
                  >
                    View All Courses
                  </button>
                </div>
              )}
            </div>

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
            <div className="flex flex-col space-y-1">
              {/* Mobile Courses Dropdown */}
              <div>
                <button
                  onClick={() => setIsMobileCoursesOpen(!isMobileCoursesOpen)}
                  className="w-full flex items-center justify-between text-muted-foreground hover:text-primary transition-colors duration-200 px-4 py-2 cursor-pointer"
                >
                  <span>Courses</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isMobileCoursesOpen ? 'rotate-180' : ''}`} />
                </button>
                {isMobileCoursesOpen && (
                  <div className="bg-secondary/30 rounded-lg mx-2 py-2">
                    {courseCategories.map((category) => (
                      <button
                        key={category.name}
                        onClick={() => handleCategoryClick(category.href)}
                        className="w-full text-left px-6 py-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {category.name}
                      </button>
                    ))}
                    <button
                      onClick={() => handleCategoryClick('/courses')}
                      className="w-full text-left px-6 py-2 text-sm font-medium text-primary transition-colors"
                    >
                      View All Courses
                    </button>
                  </div>
                )}
              </div>

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