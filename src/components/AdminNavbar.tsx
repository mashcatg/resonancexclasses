import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, BookOpen, Users, CreditCard, Settings, LogOut, User, Shield, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

const AdminNavbar = () => {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const quickLinks = [
    { name: "Courses", href: "/admin/courses", icon: BookOpen },
    { name: "Enrollments", href: "/admin/enrollments", icon: CreditCard },
    { name: "Students", href: "/admin/students", icon: Users },
    { name: "Devices", href: "/admin/device-approvals", icon: Shield },
  ];

  const getInitials = (firstName: string | null, lastName: string | null) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'bg-primary/20 text-primary';
      case 'admin':
        return 'bg-blue-500 hover:bg-blue-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  return (
    <nav className="bg-white">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
              <img src="icon transparent.png" alt="Logo" className="w-12 h-12" />
            
          </Link>

          {/* Quick Links */}
          <div className="hidden md:flex items-center space-x-6">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu and Mobile Menu Button */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 md:h-10 w-8 md:w-10 rounded-full">
                  <Avatar className="h-8 md:h-10 w-8 md:w-10">
                    <AvatarImage src={profile?.avatar_url || ''} alt={profile?.email} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(profile?.first_name, profile?.last_name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">
                    {profile?.first_name} {profile?.last_name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {profile?.email}
                  </p>
                </div>
                <Badge className={`${getRoleBadgeColor(profile?.role || '')} border-primary mx-2`}>
                  {profile?.role?.toUpperCase()}
                </Badge>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem asChild>
                  <Link to="/admin/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-white">
            <div className="py-3 space-y-2">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AdminNavbar;