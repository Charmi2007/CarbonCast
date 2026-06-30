import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const location = useLocation();
  
  const navLinks = [
    { name: 'Calculator', path: '/calculator' },
    { name: 'Leaderboard', path: '/leaderboard' },
    { name: 'Tips', path: '/tips' },
    { name: 'About', path: '/about' },
  ];

  return (
    <nav className="w-full bg-brand-bg/80 backdrop-blur-md sticky top-0 z-50 border-b border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-brand-surface rounded-xl group-hover:bg-brand-accent/20 transition-colors">
              <Leaf className="w-6 h-6 text-brand-primary" />
            </div>
            <span className="font-poppins font-bold text-xl text-brand-text">CarbonCast</span>
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
            <Link to="/calculator">
              <Button size="sm">Calculate Now</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
