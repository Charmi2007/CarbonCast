import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';

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
      const data = Object.fromEntries(formData.entries());
      
      const res = await apiClient.post('/auth/login', data);
      
      if (res.data.status === 'success') {
        await login(res.data.token, res.data.user);
        
        // Redirect to where they were trying to go, or community feed as default
        const from = (location.state as any)?.from?.pathname || '/community';
        navigate(from, { replace: true });
      }
    } catch (error: any) {
      setStatus('error');
      setErrorMsg(error.response?.data?.message || 'Invalid email or password.');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto py-20"
    >
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-brand-text mb-2">Welcome Back</h1>
        <p className="text-brand-textSecondary">Log in to track your carbon footprint.</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Email Address" 
            name="email" 
            type="email" 
            placeholder="jane@example.com" 
            required 
          />
          <Input 
            label="Password" 
            name="password" 
            type="password" 
            placeholder="••••••••" 
            required 
          />
          
          {status === 'error' && (
            <div className="p-3 bg-brand-error/10 text-brand-error rounded-xl text-sm font-medium">
              {errorMsg}
            </div>
          )}

          <Button type="submit" className="w-full" isLoading={status === 'loading'}>
            Log In
          </Button>
          
          <p className="text-center text-sm text-brand-textSecondary mt-4">
            Don't have an account? <Link to="/signup" className="text-brand-primary font-medium hover:underline">Sign up</Link>
          </p>
        </form>
      </Card>
    </motion.div>
  );
};

export default LoginPage;
