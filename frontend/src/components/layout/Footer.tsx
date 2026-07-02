import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Github, Linkedin, Twitter } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-bg border-t border-brand-border pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Leaf className="w-6 h-6 text-brand-primary" />
              <span className="font-poppins font-bold text-xl text-brand-text">CarbonCast</span>
            </Link>
            <p className="text-brand-textSecondary text-sm max-w-sm mb-6">
              Understand your environmental impact with an intuitive carbon footprint calculator and personalized sustainability insights.
            </p>
            <div className="flex space-x-4 text-brand-textSecondary">
              <a href="#" className="hover:text-brand-primary transition-colors"><Github className="w-5 h-5" /></a>
              <a href="#" className="hover:text-brand-primary transition-colors"><Linkedin className="w-5 h-5" /></a>
              <a href="#" className="hover:text-brand-primary transition-colors"><Twitter className="w-5 h-5" /></a>
            </div>
          </div>
          
          <div>
            <h3 className="font-poppins font-semibold text-brand-text mb-4">Product</h3>
            <ul className="space-y-3 text-sm text-brand-textSecondary">
              <li><Link to="/calculator" className="hover:text-brand-primary">Calculator</Link></li>
              <li><Link to="/quests" className="hover:text-brand-primary">Quests</Link></li>
              <li><Link to="/tips" className="hover:text-brand-primary">Tips</Link></li>
              <li><Link to="/contact" className="hover:text-brand-primary">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-poppins font-semibold text-brand-text mb-4">Legal</h3>
            <ul className="space-y-3 text-sm text-brand-textSecondary">
              <li><a href="#" className="hover:text-brand-primary">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-brand-primary">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-brand-border text-center text-sm text-brand-textSecondary">
          <p>© {new Date().getFullYear()} CarbonCast. Built for a greener future.</p>
        </div>
      </div>
    </footer>
  );
};
