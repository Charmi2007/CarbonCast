import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { KeyRound } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    
    try {
      const formData = new FormData(e.currentTarget);
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;
      
      await login(email, password);
      
      const from = (location.state as any)?.from?.pathname || '/community';
      navigate(from, { replace: true });
    } catch (error: any) {
      setStatus('error');
      setErrorMsg(error.message || 'Invalid email or password.');
    }
  };

  return (
    <div className="max-w-md mx-auto py-16 px-4">
      {/* Background Glow */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-brand-primary/5 rounded-full blur-[80px] pointer-events-none -z-10"></div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center mb-4 text-brand-primary">
            <KeyRound className="w-6 h-6 animate-pulse" />
          </div>
          <h1 className="text-3xl font-black text-brand-text mb-1 tracking-tight">Enter Your Sanctuary</h1>
          <p className="text-xs text-brand-textSecondary">Log in to review your baseline score and green achievements.</p>
        </div>

        <Card className="border border-brand-border/60 bg-brand-surface/40 backdrop-blur-xl p-8 rounded-3xl shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
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
              className="bg-brand-bg/50 border-brand-border focus:border-brand-primary rounded-xl"
            />
            
            {status === 'error' && (
              <div className="p-3 bg-brand-error/10 text-brand-error rounded-xl text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <Button type="submit" className="w-full py-3.5 rounded-xl font-bold text-sm bg-brand-primary text-white shadow-md hover:shadow-lg shadow-brand-primary/10 transition-all mt-6" isLoading={status === 'loading'}>
              Access Profile
            </Button>
            
            <p className="text-center text-xs text-brand-textSecondary mt-4">
              Don't have an account? <Link to="/signup" className="text-brand-primary font-bold hover:underline">Sign up</Link>
            </p>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage;
