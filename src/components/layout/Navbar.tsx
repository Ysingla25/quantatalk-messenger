
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageSquare, Users, Lock, User, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="glass-effect py-4 px-4 md:px-6 fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link 
          to="/" 
          className="flex items-center gap-2 group"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm">
            QT
          </div>
          <span className="text-xl font-bold text-gradient tracking-tight">QuantaTalk</span>
        </Link>

        {/* Mobile menu button */}
        <button 
          className="md:hidden p-2 rounded-md text-foreground focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            )}
          </svg>
        </button>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center space-x-1">
          <NavItem to="/chat" icon={<MessageSquare className="h-4 w-4 mr-1" />} label="Messages" active={location.pathname.includes('/chat')} />
          <NavItem to="/groups" icon={<Users className="h-4 w-4 mr-1" />} label="Groups" active={location.pathname === '/groups'} />
          <NavItem to="/security" icon={<Lock className="h-4 w-4 mr-1" />} label="Security" active={location.pathname === '/security'} />
          <Button variant="ghost" size="sm" className="ml-4 !border border-border">
            <User className="h-4 w-4 mr-1" />
            <span>Profile</span>
          </Button>
        </div>

        {/* Mobile navigation */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 p-4 mt-1 glass-effect flex flex-col space-y-2 md:hidden animate-scale-in">
            <NavItem to="/chat" icon={<MessageSquare className="h-4 w-4 mr-2" />} label="Messages" active={location.pathname.includes('/chat')} />
            <NavItem to="/groups" icon={<Users className="h-4 w-4 mr-2" />} label="Groups" active={location.pathname === '/groups'} />
            <NavItem to="/security" icon={<Lock className="h-4 w-4 mr-2" />} label="Security" active={location.pathname === '/security'} />
            <NavItem to="/profile" icon={<User className="h-4 w-4 mr-2" />} label="Profile" active={location.pathname === '/profile'} />
            <NavItem to="/settings" icon={<Settings className="h-4 w-4 mr-2" />} label="Settings" active={location.pathname === '/settings'} />
          </div>
        )}
      </div>
    </nav>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, active }) => {
  return (
    <Link 
      to={to} 
      className={cn(
        "px-3 py-2 rounded-md text-sm font-medium flex items-center transition-all",
        active 
          ? "bg-secondary text-foreground" 
          : "text-foreground/70 hover:bg-secondary/50 hover:text-foreground"
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

export default Navbar;
