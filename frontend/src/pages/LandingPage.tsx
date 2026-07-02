import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Sparkles, MessageSquare, LayoutGrid, BarChart3,
  ChevronRight
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import { parseGreenWinAI } from '../utils/winParser';

const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const [latestRecordId, setLatestRecordId] = useState<string | null>(null);

  // Green Deed Sandbox State
  const [customDeedText, setCustomDeedText] = useState('');
  const [hasCastWin, setHasCastWin] = useState(false);
  const [parsedResult, setParsedResult] = useState<any | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Quick suggestion tags to autofill the input
  const suggestions = [
    { text: "swapped gym transit to cycling", label: "🚲 Cycling Commute" },
    { text: "swapped beef burger for a vegan lunch", label: "🥗 Vegan Meal" },
    { text: "installed home solar panels", label: "☀️ Solar Upgrade" }
  ];

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

  const handleAnalyze = async () => {
    if (!customDeedText.trim()) return;
    setIsAnalyzing(true);
    setHasCastWin(false);
    try {
      const apiKey = localStorage.getItem('deepseek_api_key');
      const res = await parseGreenWinAI(customDeedText, apiKey);
      setParsedResult(res);
      setHasCastWin(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSuggestionClick = async (text: string) => {
    setCustomDeedText(text);
    setIsAnalyzing(true);
    setHasCastWin(false);
    try {
      const apiKey = localStorage.getItem('deepseek_api_key');
      const res = await parseGreenWinAI(text, apiKey);
      setParsedResult(res);
      setHasCastWin(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col items-center overflow-x-hidden min-h-screen text-left max-w-4xl mx-auto py-12 px-4 space-y-24">
      {/* Background Glow */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand-primary/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      {/* Hero Section */}
      <section className="grid md:grid-cols-12 gap-8 items-center w-full">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="md:col-span-7 space-y-6"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" /> Avoided Carbon Tracker
          </div>

          <h1 className="text-5xl md:text-6xl font-black text-brand-text leading-tight tracking-tight">
            Carbon logging. <br />
            <span className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
              With a personality.
            </span>
          </h1>

          <p className="text-sm text-brand-textSecondary leading-relaxed max-w-md">
            Welcome to CarbonCast. We calculate your starting baseline once, and from there, we focus strictly on the daily choices you avoid—building streaks, earning quests, and competing on leaderboards.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {user ? (
              <>
                <Link to="/community">
                  <Button size="lg" className="w-full sm:w-auto gap-2 px-6 py-4 rounded-xl text-sm font-bold bg-brand-primary text-white">
                    <MessageSquare className="w-4 h-4" /> Open Community Feed
                  </Button>
                </Link>
                {latestRecordId ? (
                  <Link to={`/dashboard/${latestRecordId}`}>
                    <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 px-6 py-4 rounded-xl border-brand-border text-brand-text text-sm font-semibold">
                      <LayoutGrid className="w-4 h-4 text-brand-primary" /> View Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link to="/calculator">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 px-6 py-4 rounded-xl border-brand-border text-brand-text text-sm font-semibold">
                      <BarChart3 className="w-4 h-4 text-brand-primary" /> Setup Scorecard
                    </Button>
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link to="/signup">
                  <Button size="lg" className="w-full sm:w-auto gap-2 px-6 py-4 rounded-xl text-sm font-bold bg-brand-primary text-white shadow-md shadow-brand-primary/10">
                    Begin Journey & Setup Profile <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto px-6 py-4 rounded-xl border-brand-border text-brand-text text-sm font-medium">
                    Methodology
                  </Button>
                </Link>
              </>
            )}
          </div>
        </motion.div>

        {/* Hero Mock Profile Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="md:col-span-5"
        >
          <Card className="border border-brand-primary/15 bg-brand-surface/40 backdrop-blur-xl p-5 rounded-2xl shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-brand-primary/15 flex items-center justify-center font-bold text-brand-primary text-[11px]">JA</div>
                <div>
                  <h4 className="text-[11px] font-bold text-brand-text leading-none">John Abraham</h4>
                  <span className="text-[9px] text-brand-textSecondary">Active Leader</span>
                </div>
              </div>
              <span className="text-[9px] bg-orange-500/15 border border-orange-500/30 text-orange-400 font-bold px-2 py-0.5 rounded-full">
                🔥 12d Streak
              </span>
            </div>

            <div className="p-3 bg-brand-bg/50 border border-brand-border/60 rounded-xl text-center mb-3">
              <div className="text-[8px] uppercase tracking-widest text-brand-textSecondary font-bold mb-0.5">Eco Score</div>
              <div className="text-3xl font-black text-brand-primary">88<span className="text-xs font-semibold text-brand-textSecondary">/100</span></div>
            </div>

            <div className="p-2.5 bg-brand-bg/30 border border-brand-border/40 rounded-lg text-left text-[11px] text-brand-textSecondary leading-normal">
              "Swapped my daily gym transit to cycling! Saved 3.2 kg CO₂e."
            </div>
          </Card>
        </motion.div>
      </section>

      {/* The Try-Out Sandbox Widget */}
      <section className="w-full space-y-6">
        <div className="text-center max-w-lg mx-auto space-y-2">
          <h2 className="text-2xl font-black text-brand-text">Test the avoided carbon parser</h2>
          <p className="text-xs text-brand-textSecondary">
            Type any green win in natural language or click a suggestion below to see how our ledger estimates emissions instantly.
          </p>
        </div>

        <Card className="border border-brand-border bg-brand-surface/30 backdrop-blur-xl p-6 rounded-2xl shadow-lg space-y-5 max-w-xl mx-auto">
          {/* Quick Suggestions */}
          <div className="flex flex-wrap gap-2 justify-center">
            {suggestions.map((s) => (
              <button 
                key={s.label}
                onClick={() => handleSuggestionClick(s.text)}
                className="text-[10px] bg-brand-surface border border-brand-border hover:border-brand-primary text-brand-textSecondary hover:text-brand-primary px-2.5 py-1 rounded-lg transition-all font-semibold"
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Form Input */}
          <div className="flex gap-2">
            <input 
              type="text"
              placeholder="Type a deed, e.g. I commuted by train today instead of driving..."
              value={customDeedText}
              onChange={(e) => {
                setCustomDeedText(e.target.value);
                setHasCastWin(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAnalyze();
              }}
              className="flex-1 px-3 py-2.5 rounded-xl border border-brand-border bg-brand-bg text-brand-text text-xs focus:ring-1 focus:ring-brand-primary outline-none"
              disabled={isAnalyzing}
            />
            <Button 
              onClick={handleAnalyze}
              isLoading={isAnalyzing}
              className="bg-brand-primary text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow shadow-brand-primary/10"
            >
              Analyze
            </Button>
          </div>

          {/* Parsed Result Box */}
          <AnimatePresence>
            {hasCastWin && parsedResult && customDeedText.trim() && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="p-3.5 bg-brand-success/10 border border-brand-success/20 rounded-xl text-left flex gap-3 items-center"
              >
                <div className="w-7 h-7 rounded-full bg-brand-success/15 border border-brand-success/30 flex items-center justify-center text-brand-success text-sm shrink-0">
                  {parsedResult.icon}
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="text-xs font-bold text-brand-success leading-none">
                    Avoided {parsedResult.carbonSaved} kg CO₂e ({parsedResult.category.toUpperCase()})
                  </h4>
                  <p className="text-[10px] text-brand-textSecondary leading-normal">
                    This choice {parsedResult.detail}
                  </p>
                  {!user && (
                    <Link to="/signup" className="inline-flex items-center gap-0.5 text-[9px] text-brand-primary font-bold hover:underline">
                      Create profile to log this win permanently & start your streak <ChevronRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </section>

      {/* Footer Invitation CTA */}
      {!user && (
        <section className="w-full text-center p-8 bg-brand-surface/30 border border-brand-border/60 rounded-2xl relative overflow-hidden">
          <h3 className="text-xl font-bold text-brand-text mb-2">Begin Your Sustainability Quest</h3>
          <p className="text-xs text-brand-textSecondary max-w-md mx-auto mb-5 leading-normal">
            Establish your starting baseline scorecard once, and unlock daily quest tracking, profiles, and streaks.
          </p>
          <Link to="/signup">
            <Button size="lg" className="gap-1.5 px-6 py-3.5 rounded-xl bg-brand-primary text-white text-xs font-bold shadow shadow-brand-primary/10">
              Create Eco Profile <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </section>
      )}
    </div>
  );
};

export default LandingPage;
