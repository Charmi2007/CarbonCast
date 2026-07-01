import { Suspense, lazy } from "react";
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Loader2 } from 'lucide-react';

// Lazy loading pages for performance
const LandingPage = lazy(() => import('./pages/LandingPage'));
const CalculatorPage = lazy(() => import('./pages/CalculatorPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));
const TipsPage = lazy(() => import('./pages/TipsPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));

const PageLoader = () => (
  <div className="flex h-[50vh] items-center justify-center">
    <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
  </div>
);

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="calculator" element={<CalculatorPage />} />
          <Route path="dashboard/:id" element={<DashboardPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route path="tips" element={<TipsPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
