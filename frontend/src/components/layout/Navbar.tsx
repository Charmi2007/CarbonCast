import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, User as UserIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const navLinks = [
    { name: 'Calculator', path: '/calculator' },
    { name: 'Community', path: '/community' },
    { name: 'Quests', path: '/quests' },
    { name: 'Tips', path: '/tips' },
    { name: 'About', path: '/about' },
  ];

  return (
    <nav className="w-full bg-brand-bg/80 backdrop-blur-md sticky top-0 z-50 border-b border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-white border border-brand-border flex items-center justify-center group-hover:border-brand-primary transition-colors p-0.5">
              <img 
                src="/logo.jpg" 
                alt="CarbonCast Logo Mark" 
                className="w-full h-full object-contain" 
              />
            </div>
            <div className="flex flex-col">
              <span className="font-poppins font-black tracking-wider text-base leading-none">
                <span className="text-brand-text">CΛRBON</span>
                <span className="text-brand-primary ml-1">CΛST</span>
              </span>
              <span className="text-[7.5px] uppercase tracking-widest text-brand-textSecondary font-semibold mt-0.5">
                Measure. Manage. Make a difference.
              </span>
            </div>
          </Link>
          
          <div className="hidden md:flex space-x-8 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-brand-primary ${
                  location.pathname === link.path ? 'text-brand-primary' : 'text-brand-textSecondary'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm font-medium text-brand-text">
                  <UserIcon className="w-4 h-4 text-brand-primary" />
                  {user.name}
                </div>
                <button 
                  onClick={logout}
                  className="text-brand-textSecondary hover:text-brand-error transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Log In</Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
