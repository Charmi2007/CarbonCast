import { Suspense, lazy } from "react";
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Loader2 } from 'lucide-react';
import { useAuth } from './context/AuthContext';

// Lazy loading pages for performance
const LandingPage = lazy(() => import('./pages/LandingPage'));
const CalculatorPage = lazy(() => import('./pages/CalculatorPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const QuestPage = lazy(() => import('./pages/QuestPage'));
const TipsPage = lazy(() => import('./pages/TipsPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const CommunityPage = lazy(() => import('./pages/CommunityPage'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));

const PageLoader = () => (
  <div className="flex h-[50vh] items-center justify-center">
    <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
  </div>
);

// Compulsory auth wrapper route
const ProtectedRoute = () => {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!token) {
    return <Navigate to="/signup" replace />;
  }

  return <Outlet />;
};

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="signup" element={<SignupPage />} />
          <Route path="login" element={<LoginPage />} />
          
          {/* Protected Routes — Require compulsory account creation */}
          <Route element={<ProtectedRoute />}>
            <Route path="calculator" element={<CalculatorPage />} />
            <Route path="dashboard/:id" element={<DashboardPage />} />
            <Route path="quests" element={<QuestPage />} />
            <Route path="community" element={<CommunityPage />} />
            <Route path="leaderboard" element={<LeaderboardPage />} />
            <Route path="tips" element={<TipsPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
