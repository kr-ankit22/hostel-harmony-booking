
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  LogIn, 
  Menu, 
  X, 
  User, 
  LogOut, 
  BookOpen, 
  LayoutDashboard,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Base navigation links
  const navLinks = [
    { title: 'Home', path: '/' },
    { title: 'About', path: '/about' },
    { title: 'Facilities', path: '/facilities' },
    { title: 'Contact', path: '/contact' },
  ];

  // Role-specific links
  const getRoleSpecificLinks = () => {
    if (!user) return [];
    
    switch (user.role) {
      case 'student':
        return [
          { title: 'Dashboard', path: '/student', icon: <LayoutDashboard className="h-4 w-4 mr-2" /> },
          { title: 'New Booking', path: '/booking-request', icon: <BookOpen className="h-4 w-4 mr-2" /> }
        ];
      case 'reception':
        return [
          { title: 'Reception Dashboard', path: '/reception', icon: <LayoutDashboard className="h-4 w-4 mr-2" /> }
        ];
      case 'admin':
        return [
          { title: 'Admin Dashboard', path: '/admin', icon: <LayoutDashboard className="h-4 w-4 mr-2" /> }
        ];
      default:
        return [];
    }
  };

  const roleSpecificLinks = getRoleSpecificLinks();

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'py-3 bg-white/80 backdrop-blur-lg shadow-sm'
          : 'py-5 bg-transparent'
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-academic-light rounded-full flex items-center justify-center">
            <span className="font-serif text-white text-lg font-bold">B</span>
          </div>
          <span className="font-serif text-academic text-xl font-semibold">BITS Hostel</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                'nav-link',
                isActive(link.path) && 'text-academic font-semibold'
              )}
            >
              {link.title}
            </Link>
          ))}

          {isAuthenticated && roleSpecificLinks.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-1">
                  My Account
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {roleSpecificLinks.map((link) => (
                  <DropdownMenuItem key={link.path} asChild>
                    <Link to={link.path} className="flex items-center w-full">
                      {link.icon}
                      {link.title}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>

        {/* Login/User Profile Button - Desktop */}
        <div className="hidden md:block">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profileImage} />
                    <AvatarFallback className="bg-academic-light text-white">
                      {user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-sm">{user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-2 py-1.5 text-sm">
                  <div className="font-medium">{user?.name}</div>
                  <div className="text-muted-foreground text-xs">{user?.role}</div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center cursor-pointer">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="default" className="bg-academic hover:bg-academic/90 btn-transition">
              <Link to="/login" className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                <span>Login</span>
              </Link>
            </Button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-academic-text p-1"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white/90 backdrop-blur-lg shadow-md p-4 flex flex-col gap-4 md:hidden animate-fade-in-up">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'py-2 px-4 rounded-md transition-colors',
                  isActive(link.path)
                    ? 'bg-academic text-white'
                    : 'hover:bg-academic/10'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.title}
              </Link>
            ))}

            {isAuthenticated ? (
              <>
                <div className="pt-2 mt-2 border-t border-gray-200">
                  <div className="px-4 py-2 flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profileImage} />
                      <AvatarFallback className="bg-academic-light text-white">
                        {user?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">{user?.name}</div>
                      <div className="text-xs text-muted-foreground capitalize">{user?.role}</div>
                    </div>
                  </div>
                </div>

                {roleSpecificLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="py-2 px-4 rounded-md flex items-center transition-colors hover:bg-academic/10"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.icon}
                    {link.title}
                  </Link>
                ))}

                <Button 
                  variant="ghost" 
                  className="justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Button asChild variant="default" className="bg-academic hover:bg-academic/90 w-full">
                <Link 
                  to="/login" 
                  className="flex items-center justify-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
