import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Leaf, BarChart3, Globe, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const LandingPage: React.FC = () => {
  const [cleanEnergy, setCleanEnergy] = useState(30);
  const [commuteSaved, setCommuteSaved] = useState(50);
  
  // Calculate simulated savings based on quick inputs
  const simulatedSavings = Math.round((cleanEnergy * 12.5) + (commuteSaved * 0.45 * 52));

  return (
    <div className="flex flex-col items-center overflow-x-hidden min-h-screen">
      {/* Background Neon Glows */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="absolute top-40 right-1/4 w-80 h-80 bg-brand-secondary/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>

      {/* Hero Section */}
      <section className="w-full pt-16 pb-12 text-center max-w-5xl mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/25 text-brand-primary text-xs font-semibold mb-6 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Empowering Sustainability Champions
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-brand-text leading-tight mb-6 tracking-tight">
            Track your sustainability wins. <br />
            <span className="bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent bg-clip-text text-transparent">
              Visualize your impact.
            </span>
          </h1>
          
          <p className="text-base md:text-lg text-brand-textSecondary max-w-3xl mx-auto mb-10 leading-relaxed">
            Welcome to CarbonCast. Build your personalized Eco Profile, log daily green deeds, compete in carbon quests, and connect with a community of climate-conscious leaders.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Link to="/signup">
              <Button size="lg" className="w-full sm:w-auto gap-2 px-8 py-6 rounded-2xl shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/45 transition-all text-base font-bold bg-gradient-to-r from-brand-primary to-brand-secondary text-white">
                Create Eco Profile & Begin <ArrowRight className="w-5 h-5 animate-pulse" />
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-6 rounded-2xl border-brand-border text-brand-text font-medium">
                Explore Methodology
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Interactive Micro-Simulator Card */}
      <section className="w-full max-w-4xl px-4 mb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Card className="relative overflow-hidden border border-brand-primary/20 bg-brand-surface/40 backdrop-blur-xl p-8 rounded-3xl shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-brand-text mb-2">Simulate Your Annual Savings</h3>
                <p className="text-xs text-brand-textSecondary mb-6">Drag the sliders to see a quick projection of the carbon emissions you could prevent this year.</p>
                
                {/* Slider 1 */}
                <div className="mb-6">
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span className="text-brand-text">Renewable Household Energy</span>
                    <span className="text-brand-primary">{cleanEnergy}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={cleanEnergy}
                    onChange={(e) => setCleanEnergy(Number(e.target.value))}
                    className="w-full h-1.5 bg-brand-border rounded-lg appearance-none cursor-pointer accent-brand-primary"
                  />
                </div>

                {/* Slider 2 */}
                <div className="mb-2">
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span className="text-brand-text">Weekly Green Travel (Walk/Cycle/EV/Metro)</span>
                    <span className="text-brand-primary">{commuteSaved} km</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="300" 
                    value={commuteSaved}
                    onChange={(e) => setCommuteSaved(Number(e.target.value))}
                    className="w-full h-1.5 bg-brand-border rounded-lg appearance-none cursor-pointer accent-brand-primary"
                  />
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-6 bg-brand-bg/50 border border-brand-border/60 rounded-2xl text-center">
                <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center mb-3 text-brand-primary">
                  <Leaf className="w-6 h-6" />
                </div>
                <div className="text-xs uppercase tracking-widest text-brand-textSecondary font-bold mb-1">Estimated Annual Offset</div>
                <div className="text-5xl font-black text-brand-primary mb-2">
                  {simulatedSavings.toLocaleString()} <span className="text-sm font-bold text-brand-text">kg CO₂e</span>
                </div>
                <p className="text-[10px] text-brand-textSecondary max-w-[240px] leading-relaxed">
                  Equivalent to planting approximately <span className="font-semibold text-brand-primary">{Math.round(simulatedSavings / 22)} trees</span> this year!
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </section>

      {/* Modern Features Grid */}
      <section className="w-full max-w-6xl px-4 pb-24">
        <h2 className="text-3xl font-black text-brand-text text-center mb-12">Designed for Sustainability Leaders</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<BarChart3 className="w-6 h-6 text-brand-primary" />}
            title="Real-time Impact Metrics"
            description="Visualize your avoidance score and baseline reductions computed using our verified AI models."
          />
          <FeatureCard 
            icon={<Globe className="w-6 h-6 text-brand-primary" />}
            title="Interactive Carbon Quests"
            description="Compete in daily, weekly, and monthly sustainability tasks to gamify your green achievements."
          />
          <FeatureCard 
            icon={<Sparkles className="w-6 h-6 text-brand-primary" />}
            title="Social Sustainability Feed"
            description="Share your green wins daily, see posts from fellow carbon-conscious citizens, and collaborate."
          />
        </div>
      </section>

      {/* Psychology-based Signup Callout */}
      <section className="w-full max-w-5xl px-4 pb-20">
        <div className="p-10 bg-gradient-to-br from-brand-surface to-brand-bgAlt border border-brand-primary/15 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none"></div>
          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-brand-text mb-3">Ready to Join the Movement?</h3>
            <p className="text-sm text-brand-textSecondary max-w-xl leading-relaxed mb-6 md:mb-0">
              Create your compulsory eco-account to permanently store your habits. By logging in, you unlock our fully interactive community dashboard, feed posts, and offset tracker.
            </p>
          </div>
          <div className="shrink-0 w-full md:w-auto">
            <Link to="/signup" className="w-full">
              <Button size="lg" className="w-full gap-2 px-8 py-5 rounded-xl bg-brand-primary text-white font-bold">
                Begin Your Journey <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <motion.div 
    whileHover={{ y: -6, borderColor: 'var(--brand-primary)' }}
    className="bg-brand-surface/40 backdrop-blur p-8 rounded-2xl border border-brand-border/60 hover:border-brand-primary/30 transition-all duration-300 shadow-sm flex flex-col items-start text-left"
  >
    <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center mb-6">
      {icon}
    </div>
    <h3 className="text-lg font-bold text-brand-text mb-3">{title}</h3>
    <p className="text-xs text-brand-textSecondary leading-relaxed">{description}</p>
  </motion.div>
);

export default LandingPage;
