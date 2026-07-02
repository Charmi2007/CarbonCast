import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, BarChart3, Sparkles, Users, 
  MessageSquare, LayoutGrid, Sun, Bike, Utensils, 
  Compass, Target, ShieldCheck, HelpCircle, ChevronRight
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import { parseGreenWin } from '../utils/winParser';

const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const [latestRecordId, setLatestRecordId] = useState<string | null>(null);

  // Chapter II: Archetype Selector State
  const [activeArchetype, setActiveArchetype] = useState<'solar' | 'commuter' | 'diet'>('solar');

  // Chapter III: Local Live Sandbox Preview States
  const [sandboxTransport, setSandboxTransport] = useState(20); // % transit reduction
  const [sandboxEnergy, setSandboxEnergy] = useState(15); // % energy reduction

  // Chapter IV: Interactive Semantic Win Parser State
  const [customDeedText, setCustomDeedText] = useState('');
  const [hasCastWin, setHasCastWin] = useState(false);

  // Ticker Data representing live activity
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

  // Dynamic sandbox calculation
  const calculateSandboxSavings = () => {
    // baseline average footprint = 8.5 tonnes CO2 per year
    // transport represents ~40% of baseline (3.4t), energy represents ~30% (2.55t)
    const transportSavings = (sandboxTransport / 100) * 3400; // in kg
    const energySavings = (sandboxEnergy / 100) * 2550; // in kg
    return Math.round(transportSavings + energySavings);
  };

  const getDeedResult = () => {
    return parseGreenWin(customDeedText);
  };

  return (
    <div className="flex flex-col items-center overflow-x-hidden min-h-screen text-left">
      {/* Custom Styles for Scrolling Marquee Ticker */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>

      {/* Chapter I: The Narrative Shift (Hero Section) */}
      <section className="w-full max-w-6xl px-4 pt-16 pb-20 grid md:grid-cols-12 gap-12 items-center relative">
        <div className="absolute top-10 left-10 w-72 h-72 bg-brand-primary/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="md:col-span-7 space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" /> Chapter I: The Paradigm Shift
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-brand-text leading-tight tracking-tight">
            Stop counting footprints. <br />
            <span className="bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent bg-clip-text text-transparent">
              Log avoided choices.
            </span>
          </h1>

          <p className="text-base text-brand-textSecondary max-w-2xl leading-relaxed">
            Standard carbon calculators focus on guilt. They give you a number, make you feel small, and leave you in isolation. 
            <strong className="text-brand-text font-bold block mt-3">CarbonCast flips the script.</strong>
            We build your baseline once. From there, we celebrate every choice you avoid, turning daily sustainability into a visual, gamified quest with a community of real climate champions.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
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
                      <BarChart3 className="w-5 h-5 text-brand-primary" /> Setup Eco Scorecard
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
                    How the AI Model Works
                  </Button>
                </Link>
              </>
            )}
          </div>
        </motion.div>

        {/* Right Side: The Living Community Ledger Mockup */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="md:col-span-5"
        >
          <Card className="border border-brand-primary/20 bg-brand-surface/40 backdrop-blur-xl p-6 rounded-3xl relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/10 rounded-full blur-xl pointer-events-none"></div>
            
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-brand-primary/15 flex items-center justify-center font-bold text-brand-primary text-xs">JA</div>
                <div>
                  <h4 className="text-xs font-bold text-brand-text leading-none">John Abraham</h4>
                  <span className="text-[9px] text-brand-textSecondary">Active Leader</span>
                </div>
              </div>
              <span className="text-[10px] bg-orange-500/10 border border-orange-500/30 text-orange-400 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-0.5">
                🔥 12d Streak
              </span>
            </div>

            <div className="p-4 bg-brand-bg/50 border border-brand-border/60 rounded-2xl text-center mb-4">
              <div className="text-[9px] uppercase tracking-widest text-brand-textSecondary font-bold mb-1">Weekly Eco Rank</div>
              <div className="text-4xl font-black text-brand-primary">88<span className="text-xs font-semibold text-brand-textSecondary">/100</span></div>
              <p className="text-[9px] text-brand-textSecondary mt-1">Saves equivalent to planting 15 trees this month!</p>
            </div>

            <div className="p-3 bg-brand-bg/30 border border-brand-border/40 rounded-xl text-left text-xs">
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

      {/* Infinite scrolling ticker representing global avoided ledger */}
      <div className="w-full bg-brand-surface/20 border-y border-brand-border/30 py-4 overflow-hidden relative select-none">
        <div className="flex w-[200%] animate-marquee">
          {doubleTickerItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 mx-8 shrink-0">
              <span className="text-base">{item.icon}</span>
              <span className="text-xs font-bold text-brand-text">{item.name}</span>
              <span className="text-xs text-brand-textSecondary">{item.action}</span>
              <span className="text-xs font-black text-brand-success bg-brand-success/10 border border-brand-success/20 px-2 py-0.5 rounded-md">
                -{item.saved}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Chapter II: Choose Your Sustainable Identity */}
      <section className="w-full max-w-5xl px-4 py-24 text-center border-b border-brand-border/30">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-bold uppercase tracking-widest mb-4">
          <Users className="w-3.5 h-3.5" /> Chapter II: The Protagonists
        </div>
        <h2 className="text-3xl font-black text-brand-text mb-2">Choose Your Carbon Identity</h2>
        <p className="text-xs text-brand-textSecondary mb-8 max-w-lg mx-auto">Sustainability is unique to your lifestyle resources. Select an archetype below to explore their trajectory, praises, and roasts.</p>
        
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
                className="bg-brand-surface/40 border border-brand-border p-6 rounded-2xl text-left space-y-3 shadow-md"
              >
                <div className="flex justify-between items-center border-b border-brand-border/40 pb-2">
                  <h4 className="font-bold text-sm text-brand-text">☀️ 100% Clean Grid & Household Power</h4>
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
                className="bg-brand-surface/40 border border-brand-border p-6 rounded-2xl text-left space-y-3 shadow-md"
              >
                <div className="flex justify-between items-center border-b border-brand-border/40 pb-2">
                  <h4 className="font-bold text-sm text-brand-text">🚲 Active Travel & Transit Commuting</h4>
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
                className="bg-brand-surface/40 border border-brand-border p-6 rounded-2xl text-left space-y-3 shadow-md"
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

      {/* Chapter III: The Live Sandbox Simulator */}
      <section className="w-full max-w-5xl px-4 py-24 border-b border-brand-border/30">
        <div className="grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-bold uppercase tracking-widest">
              <Compass className="w-3.5 h-3.5" /> Chapter III: The Sandbox Playground
            </div>
            <h2 className="text-3xl font-black text-brand-text leading-tight">
              Simulate Your Carbon Fate in Real-Time
            </h2>
            <p className="text-sm text-brand-textSecondary leading-relaxed">
              Don't wait for annual reviews to know if your choices matter. Drag the simulation sliders to the right to see how making simple adjustments in transportation and household energy reduces your predicted annual footprint immediately.
            </p>
            <div className="p-4 bg-brand-surface rounded-2xl border border-brand-border flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-brand-primary shrink-0" />
              <p className="text-xs text-brand-textSecondary">
                This is a preview of the interactive dashboard sandbox. When logged in, your actual calculations will update on-the-fly using our trained AI prediction model.
              </p>
            </div>
          </div>

          <div className="md:col-span-6">
            <Card className="border border-brand-border bg-brand-surface/40 backdrop-blur-xl p-6 rounded-3xl shadow-xl space-y-6">
              <div className="space-y-4">
                {/* Simulator Slider 1 */}
                <div className="space-y-2 text-left">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-brand-text font-bold">Swap Car Commutes to Transit/Cycling</span>
                    <span className="text-brand-primary font-black">{sandboxTransport}% Shift</span>
                  </div>
                  <input 
                    type="range"
                    min="0"
                    max="100"
                    value={sandboxTransport}
                    onChange={(e) => setSandboxTransport(Number(e.target.value))}
                    className="w-full accent-brand-primary bg-brand-bg rounded-lg appearance-none h-1.5"
                  />
                  <div className="flex justify-between text-[10px] text-brand-textSecondary">
                    <span>Baseline (0%)</span>
                    <span>Complete Shift (100%)</span>
                  </div>
                </div>

                {/* Simulator Slider 2 */}
                <div className="space-y-2 text-left">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-brand-text font-bold">Household Clean Energy Adjustments</span>
                    <span className="text-brand-primary font-black">{sandboxEnergy}% Renewable</span>
                  </div>
                  <input 
                    type="range"
                    min="0"
                    max="100"
                    value={sandboxEnergy}
                    onChange={(e) => setSandboxEnergy(Number(e.target.value))}
                    className="w-full accent-brand-primary bg-brand-bg rounded-lg appearance-none h-1.5"
                  />
                  <div className="flex justify-between text-[10px] text-brand-textSecondary">
                    <span>Standard Grid (0%)</span>
                    <span>100% Renewable</span>
                  </div>
                </div>
              </div>

              {/* Dynamic local calculation result */}
              <div className="p-4 bg-brand-bg/50 border border-brand-border rounded-2xl flex justify-between items-center">
                <div className="text-left">
                  <h4 className="text-[10px] uppercase font-bold text-brand-textSecondary tracking-wider">Estimated Yearly Savings</h4>
                  <p className="text-2xl font-black text-brand-success">{calculateSandboxSavings()} <span className="text-xs">kg CO₂e</span></p>
                </div>
                <Link to="/signup">
                  <Button className="bg-brand-primary text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1">
                    Lock In Plan <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Chapter IV: The Daily Ledger Preview (Semantic Win Parser Box) */}
      <section className="w-full max-w-4xl px-4 py-24 text-center border-b border-brand-border/30">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-bold uppercase tracking-widest mb-4">
          <Target className="w-3.5 h-3.5" /> Chapter IV: The Daily Ledger
        </div>
        <h2 className="text-3xl font-black text-brand-text mb-2">Try Before You Buy: AI Assist</h2>
        <p className="text-sm text-brand-textSecondary mb-8 max-w-xl mx-auto">
          Posting on generic social networks is noise. Posting a Green Win on CarbonCast registers your choice directly in the carbon-saving ledger. Describe a green action in plain English below to test our dynamic win parser:
        </p>
        
        <Card className="border border-brand-primary/20 bg-brand-surface/40 backdrop-blur-xl p-8 rounded-3xl shadow-xl text-center relative overflow-hidden max-w-2xl mx-auto">
          <div className="absolute top-0 left-0 w-24 h-24 bg-brand-primary/5 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-lg mx-auto mb-6">
            <input 
              type="text"
              placeholder="e.g. I rode my bicycle to the office instead of driving today..."
              value={customDeedText}
              onChange={(e) => {
                setCustomDeedText(e.target.value);
                setHasCastWin(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && customDeedText.trim()) setHasCastWin(true);
              }}
              className="px-4 py-3 rounded-xl border border-brand-border bg-brand-bg text-brand-text text-xs focus:ring-2 focus:ring-brand-primary outline-none flex-grow"
            />
            
            <Button 
              onClick={() => {
                if (customDeedText.trim()) setHasCastWin(true);
              }}
              className="bg-brand-primary text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md shadow-brand-primary/10 flex items-center justify-center gap-1.5 shrink-0"
            >
              Analyze Win
            </Button>
          </div>

          <AnimatePresence>
            {hasCastWin && customDeedText.trim() && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-4 bg-brand-success/10 border border-brand-success/20 rounded-2xl max-w-md mx-auto text-left flex gap-3 items-center"
              >
                <div className="w-8 h-8 rounded-full bg-brand-success/15 border border-brand-success/30 flex items-center justify-center text-brand-success shrink-0 text-base">
                  {getDeedResult().icon}
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-brand-success">
                    AI Classified: {getDeedResult().category.toUpperCase()} (-{getDeedResult().carbonSaved} kg CO₂e)
                  </h4>
                  <p className="text-[10px] text-brand-textSecondary mt-0.5 leading-normal">
                    By submitting that, you {getDeedResult().detail}
                  </p>
                  <Link to="/signup" className="mt-2 inline-flex items-center gap-0.5 text-[9px] text-brand-primary font-bold hover:underline">
                    Create profile to log this win permanently & start your streak <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </section>

      {/* Core Design Features Grid */}
      <section className="w-full max-w-6xl px-4 py-24 grid md:grid-cols-3 gap-8">
        <FeatureCard 
          icon={<Compass className="w-6 h-6 text-brand-primary" />}
          title="Interactive Onboarding"
          description="Build your green baseline directly inside the account creation wizard, eliminating repetitive forms forever."
        />
        <FeatureCard 
          icon={<Target className="w-6 h-6 text-brand-primary" />}
          title="Streak & Offset Ledger"
          description="Log daily carbon offsets via natural language typing, maintain your streak fire, and connect to connections."
        />
        <FeatureCard 
          icon={<ShieldCheck className="w-6 h-6 text-brand-primary" />}
          title="MongoDB / Supabase Bridges"
          description="A secure and permanent data sync linking Supabase sessions directly with MongoDB Atlas calculations and feeds."
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
                Unlock daily challenges, streaks, community feeds, connection profile cards, and real-time sandbox simulation by setting up your Eco Profile.
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
