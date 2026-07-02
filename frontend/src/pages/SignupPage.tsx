import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ShieldCheck, Trophy, Target } from 'lucide-react';

const SignupPage: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const { signUp, loginAsDemo } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    
    try {
      const formData = new FormData(e.currentTarget);
      const name = formData.get('name') as string;
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;
      
      await signUp(name, email, password);
      // Step 2 of Onboarding: Redirect directly to Calculator
      navigate('/calculator?onboarding=true');
    } catch (error: any) {
      setStatus('error');
      setErrorMsg(error.message || 'Failed to create account. Please try again.');
    }
  };

  const handleDemoLogin = async () => {
    setStatus('loading');
    try {
      await loginAsDemo();
      navigate('/calculator?onboarding=true');
    } catch (error: any) {
      setStatus('error');
      setErrorMsg(error.message || 'Failed to enter Demo Sanctuary.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      {/* Background Glow */}
      <div className="absolute top-10 left-1/3 w-72 h-72 bg-brand-primary/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>

      <div className="grid md:grid-cols-12 gap-8 items-center">
        
        {/* Left Side: Value Proposition & Psychology */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="md:col-span-6 space-y-6"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Start Your Legacy
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-brand-text leading-tight">
            Create your personalized <span className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">Eco Sanctuary</span>.
          </h1>
          
          <p className="text-sm text-brand-textSecondary leading-relaxed">
            By creating an account, you configure your default habits. Complete your onboarding scorecard once to activate your custom carbon forecast, green badges, and community space.
          </p>

          <div className="space-y-4 pt-4 border-t border-brand-border/40">
            <BenefitItem 
              icon={<ShieldCheck className="w-5 h-5 text-brand-primary" />}
              title="Secure Carbon Logging"
              description="Your habit metrics are processed locally using privacy-preserving algorithms."
            />
            <BenefitItem 
              icon={<Trophy className="w-5 h-5 text-brand-primary" />}
              title="Gamified Green Quests"
              description="Compete in daily challenges to reduce carbon and reach the leaderboard."
            />
            <BenefitItem 
              icon={<Target className="w-5 h-5 text-brand-primary" />}
              title="Interactive Scorecard"
              description="Track avoided emissions and clean offsets dynamically over time."
            />
          </div>
        </motion.div>

        {/* Right Side: Signup Form Card */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="md:col-span-6"
        >
          <Card className="border border-brand-border/60 bg-brand-surface/40 backdrop-blur-xl p-8 rounded-3xl shadow-xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-brand-text">Join CarbonCast</h2>
              <p className="text-xs text-brand-textSecondary mt-1">Takes less than 3 minutes to build your dashboard.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input 
                label="Full Name" 
                name="name" 
                placeholder="Jane Doe" 
                required 
                className="bg-brand-bg/50 border-brand-border focus:border-brand-primary rounded-xl"
              />
              <Input 
                label="Email Address" 
                name="email" 
                type="email" 
                placeholder="jane@example.com" 
                required 
                className="bg-brand-bg/50 border-brand-border focus:border-brand-primary rounded-xl"
              />
              <Input 
                label="Password" 
                name="password" 
                type="password" 
                placeholder="••••••••" 
                required 
                minLength={6}
                className="bg-brand-bg/50 border-brand-border focus:border-brand-primary rounded-xl"
              />
              
              {status === 'error' && (
                <div className="p-3 bg-brand-error/10 text-brand-error rounded-xl text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              <Button type="submit" className="w-full py-3.5 rounded-xl font-bold text-sm bg-brand-primary text-white shadow-md hover:shadow-lg shadow-brand-primary/10 transition-all mt-6" isLoading={status === 'loading'}>
                Sign Up & Set Up Scorecard
              </Button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-brand-border/40"></div>
                <span className="flex-shrink mx-4 text-[10px] text-brand-textSecondary font-bold uppercase tracking-widest">Or Sandbox Mode</span>
                <div className="flex-grow border-t border-brand-border/40"></div>
              </div>

              <Button 
                type="button" 
                variant="outline" 
                onClick={handleDemoLogin} 
                className="w-full py-3.5 rounded-xl font-bold text-xs border-brand-border hover:border-brand-primary hover:text-brand-primary text-brand-textSecondary transition-all"
              >
                Enter Demo Sanctuary (Bypass Auth) 🚀
              </Button>
              
              <p className="text-center text-xs text-brand-textSecondary mt-4">
                Already have an account? <Link to="/login" className="text-brand-primary font-bold hover:underline">Log in</Link>
              </p>
            </form>
          </Card>
        </motion.div>

      </div>
    </div>
  );
};

const BenefitItem = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="flex gap-3.5 items-start">
    <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0">
      {icon}
    </div>
    <div>
      <h4 className="text-sm font-bold text-brand-text leading-tight mb-1">{title}</h4>
      <p className="text-[11px] text-brand-textSecondary leading-normal">{description}</p>
    </div>
  </div>
);

export default SignupPage;
