import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, User as UserIcon, Flame, X, Award, BadgeCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [deepSeekKey, setDeepSeekKey] = useState(() => localStorage.getItem('deepseek_api_key') || '');
  const [myStats, setMyStats] = useState({ score: 75, saved: 25.4, category: "Low" });

  useEffect(() => {
    if (user) {
      const fetchStats = async () => {
        try {
          const res = await apiClient.get('/results/my-history');
          if (res.data && res.data.length > 0) {
            const sorted = [...res.data].sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            const newest = sorted[0];
            
            // Avoided carbon = Baseline (approx 12000kg) - prediction
            const totalSaved = res.data.reduce((acc: number, curr: any) => {
              const diff = Math.max(0, 12000 - curr.prediction);
              return acc + diff;
            }, 0) / 1000;

            setMyStats({
              score: newest.carbon_score,
              category: newest.category,
              saved: totalSaved > 0 ? Number(totalSaved.toFixed(1)) : 14.5
            });
          }
        } catch (e) {
          console.error("Failed to load navbar profile stats", e);
        }
      };
      fetchStats();
    }
  }, [user]);

  const navLinks = [
    { name: 'Calculator', path: '/calculator' },
    { name: 'Community', path: '/community' },
    { name: 'Leaderboard', path: '/leaderboard' },
    { name: 'Quests', path: '/quests' },
    { name: 'Tips', path: '/tips' },
    { name: 'About', path: '/about' },
  ];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <>
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
                  <button 
                    onClick={() => setShowProfile(true)}
                    className="flex items-center gap-1.5 text-xs font-bold text-orange-500 bg-orange-500/10 border border-orange-500/25 px-2.5 py-1 rounded-full hover:bg-orange-500/20 transition-all"
                  >
                    <Flame className="w-3 h-3 fill-orange-500 text-orange-500" /> 5d Streak
                  </button>
                  <button 
                    onClick={() => setShowProfile(true)}
                    className="flex items-center gap-2 text-sm font-semibold text-brand-text hover:text-brand-primary transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-brand-primary" />
                    {user.name}
                  </button>
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

      {/* Reusable Profile Modal for Current Logged-in User */}
      <AnimatePresence>
        {showProfile && user && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-brand-surface border border-brand-border rounded-3xl overflow-hidden shadow-2xl p-6 relative text-left"
            >
              <button 
                onClick={() => setShowProfile(false)}
                className="absolute top-4 right-4 text-brand-textSecondary hover:text-brand-text font-bold text-sm flex items-center gap-0.5"
              >
                <X className="w-4 h-4" /> Close
              </button>

              {/* Profile Header */}
              <div className="flex gap-4 items-center mb-6">
                <div className="w-16 h-16 rounded-full bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center font-black text-xl text-brand-primary shrink-0">
                  {getInitials(user.name)}
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-lg font-bold text-brand-text leading-tight">{user.name}</h2>
                    <span className="text-[10px] bg-orange-500/10 border border-orange-500/30 text-orange-400 font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <Flame className="w-3 h-3 fill-orange-500 text-orange-500" /> 5d
                    </span>
                  </div>
                  <p className="text-[10px] text-brand-primary font-bold mt-0.5 uppercase tracking-wider flex items-center gap-1">
                    <BadgeCheck className="w-3.5 h-3.5 text-brand-primary" /> Verified Carbon Cast Alliance
                  </p>
                </div>
              </div>

              {/* Bio */}
              <p className="text-xs text-brand-textSecondary leading-relaxed mb-6 bg-brand-bgAlt p-3.5 rounded-2xl border border-brand-border/40">
                Sustainability advocate. Actively tracking carbon scores, completing weekly quests, and working with circular economy practices on CarbonCast.
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 text-center mb-6">
                <div className="bg-brand-bgAlt p-3 rounded-2xl border border-brand-border/30">
                  <div className="text-lg font-black text-brand-primary">{myStats.score}/100</div>
                  <div className="text-[9px] uppercase tracking-wider text-brand-textSecondary font-bold mt-1">Eco Score</div>
                </div>
                <div className="bg-brand-bgAlt p-3 rounded-2xl border border-brand-border/30">
                  <div className="text-lg font-black text-brand-success">{myStats.saved}kg</div>
                  <div className="text-[9px] uppercase tracking-wider text-brand-textSecondary font-bold mt-1">Offsets Saved</div>
                </div>
                <div className="bg-brand-bgAlt p-3 rounded-2xl border border-brand-border/30">
                  <div className="text-lg font-black text-brand-text">Active</div>
                  <div className="text-[9px] uppercase tracking-wider text-brand-textSecondary font-bold mt-1">Status</div>
                </div>
              </div>

              {/* Eco tier callout */}
              <div className="flex items-center gap-3 p-3 bg-brand-primary/5 border border-brand-primary/20 rounded-2xl">
                <Award className="w-5 h-5 text-brand-primary shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-brand-text leading-tight mb-0.5">Tier Category: {myStats.category} Impact</h4>
                  <p className="text-[10px] text-brand-textSecondary leading-snug">Keep logging clean travel and energy avoidance to lower your baseline footprint!</p>
                </div>
              </div>

              {/* API Overrides settings */}
              <div className="mt-4 pt-4 border-t border-brand-border/40">
                <details className="group">
                  <summary className="text-[10px] uppercase font-bold text-brand-textSecondary tracking-widest cursor-pointer list-none flex justify-between items-center select-none group-open:mb-3">
                    <span>🛠️ Sandbox AI Settings</span>
                    <span className="text-[9px] text-brand-primary group-open:rotate-90 transition-transform">▶</span>
                  </summary>
                  <div className="space-y-3 bg-brand-bgAlt p-3.5 rounded-2xl border border-brand-border/30 mt-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-brand-textSecondary uppercase tracking-wider block">DeepSeek API Key</label>
                      <input 
                        type="password"
                        placeholder="sk-deepseek-..."
                        value={deepSeekKey}
                        onChange={(e) => {
                          setDeepSeekKey(e.target.value);
                          localStorage.setItem('deepseek_api_key', e.target.value);
                        }}
                        className="w-full px-3 py-1.5 rounded-xl border border-brand-border bg-brand-bg text-brand-text text-xs focus:ring-1 focus:ring-brand-primary outline-none"
                      />
                      <p className="text-[9px] text-brand-textSecondary leading-normal pt-1">
                        Configure your personal API key here. CarbonCast will directly call DeepSeek's AI endpoints from your browser to generate real-time Satirical Climate Roasts.
                      </p>
                    </div>
                  </div>
                </details>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
