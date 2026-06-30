import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Outlet } from 'react-router-dom';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-bgAlt font-inter text-brand-text flex flex-col">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
