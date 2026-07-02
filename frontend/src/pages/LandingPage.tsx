import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, BarChart3, Sparkles, Flame, 
  MessageSquare, LayoutGrid, Sun, Bike, Utensils, 
  Check, Compass, Target, ShieldCheck
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';

const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const [latestRecordId, setLatestRecordId] = useState<string | null>(null);

  // Archetype Selector State
  const [activeArchetype, setActiveArchetype] = useState<'solar' | 'commuter' | 'diet'>('solar');

  // "Cast Your Offset" Micro-Action Widget State
  const [selectedDeed, setSelectedDeed] = useState('walk');
  const [hasCastWin, setHasCastWin] = useState(false);

  // Simulated Live Ticker Data
  const tickerItems = [
    { name: "John Abraham", action: "Gym commute swapped to cycling", saved: "3.2kg", icon: "🚲" },
    { name: "Dia Mirza", action: "Zero-waste community composting", saved: "8.5kg", icon: "🍂" },
    { name: "Sarah Green", action: "Installed low-flow aerators", saved: "4.2kg", icon: "💧" },
    { name: "Michael Chen", action: "Avoided fast-fashion purchases", saved: "15.0kg", icon: "🥾" },
    { name: "Aarav Mehta", action: "Swapped to 100% LED lighting", saved: "1.8kg", icon: "💡" },
    { name: "Priya Sharma", action: "100% plant-based meal day", saved: "2.4kg", icon: "🥗" }
  ];

  const doubleTickerItems = [...tickerItems, ...tickerItems];

  useEffect(() => {
    if (user) {
      const fetchLatest = async () => {
        try {
          const res = await apiClient.get('/results/my-history');
          if (res.data && res.data.length > 0) {
            const sorted = [...res.data].sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            setLatestRecordId(sorted[0].id);
          }
        } catch (e) {
          console.error("Failed to load user history", e);
        }
      };
      fetchLatest();
    }
  }, [user]);

  const getDeedResult = () => {
    switch (selectedDeed) {
      case 'walk': return { saved: "1.5 kg CO₂e", detail: "equivalent to charging 180 smartphones!" };
      case 'compost': return { saved: "2.8 kg CO₂e", detail: "diverted organic waste from producing toxic methane in landfills!" };
      case 'diet': return { saved: "3.1 kg CO₂e", detail: "reduced land use and carbon intensity compared to beef or pork!" };
      default: return { saved: "4.5 kg CO₂e", detail: "saved water footprint and manufacturing supply chain emissions!" };
    }
  };

  return (
    <div className="flex flex-col items-center overflow-x-hidden min-h-screen text-left">
      {/* Custom Styles for Scrolling Marquee */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 25s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Background Neon Glows */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="absolute top-40 right-1/4 w-80 h-80 bg-brand-secondary/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>

      {/* Infinite Social Ticker */}
      <div className="w-full bg-brand-surface/40 border-y border-brand-border/60 py-3 overflow-hidden backdrop-blur-md">
        <div className="animate-marquee gap-8">
          {doubleTickerItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-brand-bg/60 border border-brand-border px-4 py-1.5 rounded-full text-xs font-semibold text-brand-text select-none shrink-0 shadow-sm">
              <span className="text-base">{item.icon}</span>
              <span className="text-brand-primary font-bold">{item.name}</span>
              <span className="text-brand-textSecondary">{item.action}</span>
              <span className="bg-brand-success/15 border border-brand-success/20 text-brand-success px-2 py-0.5 rounded-full font-bold text-[10px]">-{item.saved}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cinematic Hero */}
      <section className="w-full pt-16 pb-12 max-w-6xl mx-auto px-4 grid md:grid-cols-12 gap-12 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="md:col-span-7 space-y-6"
        >
          {user ? (
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/25 text-orange-400 text-xs font-semibold uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" /> Keep the 5-Day Streak Burning!
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/25 text-brand-primary text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> The Planet's Social Network
            </div>
          )}

          {user ? (
            <h1 className="text-5xl md:text-7xl font-black text-brand-text leading-tight tracking-tight">
              Welcome back, <br />
              <span className="bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent bg-clip-text text-transparent">
                {user.name}
              </span>
            </h1>
          ) : (
            <h1 className="text-5xl md:text-7xl font-black text-brand-text leading-tight tracking-tight">
              Carbon logging. <br />
              <span className="bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent bg-clip-text text-transparent">
                With a personality.
              </span>
            </h1>
          )}

          <p className="text-base text-brand-textSecondary max-w-2xl leading-relaxed">
            Welcome to CarbonCast. We calculate avoided emissions using validated scientific models, roast your lifestyle choices, track daily streaks, and connect you to fellow climate leaders.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            {user ? (
              <>
                <Link to="/community">
                  <Button size="lg" className="w-full sm:w-auto gap-2 px-8 py-6 rounded-2xl shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/45 transition-all text-base font-bold bg-gradient-to-r from-brand-primary to-brand-secondary text-white">
                    <MessageSquare className="w-5 h-5" /> Open Community Feed
                  </Button>
                </Link>
                {latestRecordId ? (
                  <Link to={`/dashboard/${latestRecordId}`}>
                    <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 px-8 py-6 rounded-2xl border-brand-border text-brand-text font-semibold">
                      <LayoutGrid className="w-5 h-5 text-brand-primary" /> View Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link to="/calculator">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 px-8 py-6 rounded-2xl border-brand-border text-brand-text font-semibold">
                      <BarChart3 className="w-5 h-5 text-brand-primary" /> Run Onboarding Scorecard
                  </Button>
                </Link>
              )}
              </>
            ) : (
              <>
                <Link to="/signup">
                  <Button size="lg" className="w-full sm:w-auto gap-2 px-8 py-6 rounded-2xl shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/45 transition-all text-base font-bold bg-gradient-to-r from-brand-primary to-brand-secondary text-white">
                    Begin Journey & Setup Profile <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-6 rounded-2xl border-brand-border text-brand-text font-medium">
                    Methodology & AI Model
                  </Button>
                </Link>
              </>
            )}
          </div>
        </motion.div>

        {/* Right Side Mock Dashboard Graphic */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="md:col-span-5"
        >
          <Card className="border border-brand-primary/25 bg-brand-surface/40 backdrop-blur-xl p-6 rounded-3xl relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/10 rounded-full blur-xl pointer-events-none"></div>
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-brand-primary/15 flex items-center justify-center font-bold text-brand-primary text-xs">JA</div>
                <div>
                  <h4 className="text-xs font-bold text-brand-text leading-none">John Abraham</h4>
                  <span className="text-[9px] text-brand-textSecondary">Active Leader</span>
                </div>
              </div>
              <span className="text-[10px] bg-orange-500/10 border border-orange-500/30 text-orange-400 font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                🔥 12d Streak
              </span>
            </div>

            {/* Score info */}
            <div className="p-4 bg-brand-bg/50 border border-brand-border/60 rounded-2xl text-center mb-4">
              <div className="text-[9px] uppercase tracking-widest text-brand-textSecondary font-bold mb-1">Eco Score Rank</div>
              <div className="text-4xl font-black text-brand-primary">88<span className="text-xs font-semibold text-brand-textSecondary">/100</span></div>
              <p className="text-[9px] text-brand-textSecondary mt-1">Saves equivalent to planting 15 trees this month!</p>
            </div>

            {/* Mock feed post */}
            <div className="p-3 bg-brand-bg/30 border border-brand-border/40 rounded-xl text-left text-xs mb-2">
              <p className="text-brand-text italic mb-2 leading-relaxed">
                "Swapped my daily gym transit to cycling! Saved 3.2 kg CO₂e."
              </p>
              <div className="flex justify-between items-center text-[10px] text-brand-primary font-bold">
                <span>#transport</span>
                <span className="text-brand-success font-semibold">-3.2kg Saved</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </section>

      {/* Archetype Selector Interactive Feature */}
      <section className="w-full max-w-5xl px-4 py-16 text-center border-t border-brand-border/30">
        <h2 className="text-3xl font-black text-brand-text mb-2">Choose Your Sustainability Path</h2>
        <p className="text-xs text-brand-textSecondary mb-8 max-w-lg mx-auto">Click the archetypes below to preview your sustainability journey and look-up the praise/roasts of your decisions.</p>
        
        <div className="flex justify-center gap-3 mb-8">
          <button 
            onClick={() => setActiveArchetype('solar')}
            className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${activeArchetype === 'solar' ? 'bg-brand-primary border-brand-primary text-white shadow-md shadow-brand-primary/10' : 'bg-brand-surface border-brand-border text-brand-text'}`}
          >
            <Sun className="w-4 h-4" /> Solar Pioneer
          </button>
          <button 
            onClick={() => setActiveArchetype('commuter')}
            className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${activeArchetype === 'commuter' ? 'bg-brand-primary border-brand-primary text-white shadow-md shadow-brand-primary/10' : 'bg-brand-surface border-brand-border text-brand-text'}`}
          >
            <Bike className="w-4 h-4" /> Active Commuter
          </button>
          <button 
            onClick={() => setActiveArchetype('diet')}
            className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${activeArchetype === 'diet' ? 'bg-brand-primary border-brand-primary text-white shadow-md shadow-brand-primary/10' : 'bg-brand-surface border-brand-border text-brand-text'}`}
          >
            <Utensils className="w-4 h-4" /> Diet Champion
          </button>
        </div>

        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {activeArchetype === 'solar' && (
              <motion.div 
                key="solar"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-brand-surface/40 border border-brand-border p-6 rounded-2xl text-left space-y-3"
              >
                <div className="flex justify-between items-center border-b border-brand-border/40 pb-2">
                  <h4 className="font-bold text-sm text-brand-text">☀️ 100% Renewable Household Power</h4>
                  <span className="text-[10px] bg-brand-success/10 border border-brand-success/20 text-brand-success px-2 py-0.5 rounded-full font-bold">Low Footprint</span>
                </div>
                <p className="text-xs text-brand-textSecondary leading-relaxed">
                  Generating clean electricity removes local grid dependencies. By pairing solar energy with off-peak load shifting, household utility operations are practically carbon-neutral.
                </p>
                <div className="bg-brand-primary/5 p-3 rounded-xl border border-brand-primary/15 text-[11px] text-brand-primary italic">
                  <strong>AI Praise:</strong> "Eco-warrior status unlocked! Your emissions are low enough to make Greta Thunberg smile. Excellent work!"
                </div>
              </motion.div>
            )}

            {activeArchetype === 'commuter' && (
              <motion.div 
                key="commuter"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-brand-surface/40 border border-brand-border p-6 rounded-2xl text-left space-y-3"
              >
                <div className="flex justify-between items-center border-b border-brand-border/40 pb-2">
                  <h4 className="font-bold text-sm text-brand-text">🚲 Active Travel & EV Commuting</h4>
                  <span className="text-[10px] bg-brand-success/10 border border-brand-success/20 text-brand-success px-2 py-0.5 rounded-full font-bold">Zero Transit Carbon</span>
                </div>
                <p className="text-xs text-brand-textSecondary leading-relaxed">
                  Swapping fossil-fuel vehicle journeys for high-speed rail, cycling, EV, or hybrid commutes is the single most effective individual offset action for transportation impact.
                </p>
                <div className="bg-brand-primary/5 p-3 rounded-xl border border-brand-primary/15 text-[11px] text-brand-primary italic">
                  <strong>AI Praise:</strong> "Almost zero plastic, electric/transit commuting, and you plant trees? You're basically the final boss of sustainability!"
                </div>
              </motion.div>
            )}

            {activeArchetype === 'diet' && (
              <motion.div 
                key="diet"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-brand-surface/40 border border-brand-border p-6 rounded-2xl text-left space-y-3"
              >
                <div className="flex justify-between items-center border-b border-brand-border/40 pb-2">
                  <h4 className="font-bold text-sm text-brand-text">🥗 Plant-Based Meal Replacements</h4>
                  <span className="text-[10px] bg-brand-success/10 border border-brand-success/20 text-brand-success px-2 py-0.5 rounded-full font-bold">Food Avoided Offsets</span>
                </div>
                <p className="text-xs text-brand-textSecondary leading-relaxed">
                  Reducing weekly consumption of red meats prevents upstream agricultural methane emissions, deforestational transport logistics, and high packing footprints.
                </p>
                <div className="bg-brand-primary/5 p-3 rounded-xl border border-brand-primary/15 text-[11px] text-brand-primary italic">
                  <strong>AI Praise:</strong> "Alright, we get it, you're a saint. You probably apologize to plants before eating them. But seriously, great job!"
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* "Cast Your Offset" Interactive Micro-Widget */}
      <section className="w-full max-w-4xl px-4 pb-24">
        <Card className="border border-brand-primary/20 bg-brand-surface/40 backdrop-blur-xl p-8 rounded-3xl shadow-xl text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-24 h-24 bg-brand-primary/5 rounded-full blur-2xl pointer-events-none"></div>
          
          <h3 className="text-2xl font-black text-brand-text mb-2">Cast Your Offset Today</h3>
          <p className="text-xs text-brand-textSecondary mb-6 max-w-md mx-auto">Logged a sustainability win today? Select your action below to calculate the impact immediately in real-time.</p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-lg mx-auto mb-6">
            <select 
              value={selectedDeed}
              onChange={(e) => {
                setSelectedDeed(e.target.value);
                setHasCastWin(false);
              }}
              className="px-4 py-3 rounded-xl border border-brand-border bg-brand-bg text-brand-text text-xs focus:ring-2 focus:ring-brand-primary outline-none flex-grow"
            >
              <option value="walk">Walked/cycled to work instead of driving</option>
              <option value="compost">Composted organic kitchen waste</option>
              <option value="diet">Substituted meat for vegetarian/vegan meal</option>
              <option value="clothes">Mended clothing instead of buying new fast-fashion</option>
            </select>
            
            <Button 
              onClick={() => setHasCastWin(true)}
              className="bg-brand-primary text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md shadow-brand-primary/10 flex items-center justify-center gap-1.5 shrink-0"
            >
              Cast Action
            </Button>
          </div>

          <AnimatePresence>
            {hasCastWin && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-4 bg-brand-success/10 border border-brand-success/20 rounded-2xl max-w-md mx-auto text-left flex gap-3 items-center"
              >
                <div className="w-8 h-8 rounded-full bg-brand-success/15 border border-brand-success/30 flex items-center justify-center text-brand-success shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-brand-success">Win Cast! Avoided {getDeedResult().saved}</h4>
                  <p className="text-[10px] text-brand-textSecondary mt-0.5 leading-normal">
                    This choice {getDeedResult().detail} {!user && "Create your Eco Profile to save this win permanently!"}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </section>

      {/* Core Design Features Grid */}
      <section className="w-full max-w-6xl px-4 pb-24 grid md:grid-cols-3 gap-8">
        <FeatureCard 
          icon={<Compass className="w-6 h-6 text-brand-primary" />}
          title="Interactive Eco Onboarding"
          description="Build your default green profile directly inside the compulsory account wizard, eliminating repetitive form fatigue."
        />
        <FeatureCard 
          icon={<Target className="w-6 h-6 text-brand-primary" />}
          title="Streak & Offset Tracking"
          description="Log daily carbon offsets, maintain your streak fire, and monitor avoiding waste, plastic, and energy."
        />
        <FeatureCard 
          icon={<ShieldCheck className="w-6 h-6 text-brand-primary" />}
          title="Privacy-First Calculations"
          description="All calculated footprints are processed locally on the client using secure, privacy-preserving AI estimation techniques."
        />
      </section>

      {/* Final Call to Action */}
      {!user && (
        <section className="w-full max-w-5xl px-4 pb-20">
          <div className="p-10 bg-gradient-to-br from-brand-surface to-brand-bgAlt border border-brand-primary/15 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none"></div>
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-brand-text mb-3">Begin Your Sustainability Quest</h3>
              <p className="text-sm text-brand-textSecondary max-w-xl leading-relaxed mb-6 md:mb-0">
                Unlock daily challenges, social profiles, connection requests, and real-time carbon offsets calculation by setting up your Eco Profile.
              </p>
            </div>
            <div className="shrink-0 w-full md:w-auto">
              <Link to="/signup" className="w-full">
                <Button size="lg" className="w-full gap-2 px-8 py-5 rounded-xl bg-brand-primary text-white font-bold">
                  Create Eco Profile <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <motion.div 
    whileHover={{ y: -6, borderColor: 'var(--brand-primary)' }}
    className="bg-brand-surface/40 backdrop-blur p-8 rounded-2xl border border-brand-border/60 hover:border-brand-primary/30 transition-all duration-300 shadow-sm flex flex-col items-start"
  >
    <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center mb-6">
      {icon}
    </div>
    <h3 className="text-lg font-bold text-brand-text mb-3">{title}</h3>
    <p className="text-xs text-brand-textSecondary leading-relaxed">{description}</p>
  </motion.div>
);

export default LandingPage;
