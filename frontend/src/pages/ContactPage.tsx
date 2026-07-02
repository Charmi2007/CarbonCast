import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const ContactPage: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const formData = new FormData(e.currentTarget);
      const data = Object.fromEntries(formData.entries());
      
      await axios.post(`${API_BASE_URL}/api/v1/contact`, data);
      setStatus('success');
      e.currentTarget.reset();
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto py-10"
    >
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-brand-text mb-4">Get in Touch</h1>
        <p className="text-brand-textSecondary">Have questions or feedback? We'd love to hear from you.</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Full Name" 
            name="name" 
            placeholder="John Doe" 
            required 
          />
          <Input 
            label="Email Address" 
            name="email" 
            type="email" 
            placeholder="john@example.com" 
            required 
          />
          <div className="flex flex-col gap-1.5 mb-4">
            <label className="text-sm font-medium text-brand-text">Message</label>
            <textarea 
              name="message"
              required
              rows={5}
              className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:ring-brand-primary bg-brand-bg text-brand-text placeholder-brand-textSecondary focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
              placeholder="How can we help you?"
            ></textarea>
          </div>
          
          {status === 'success' && (
            <div className="p-4 bg-brand-success/10 text-brand-success rounded-xl text-sm font-medium">
              Thank you! Your message has been received.
            </div>
          )}
          
          {status === 'error' && (
            <div className="p-4 bg-brand-error/10 text-brand-error rounded-xl text-sm font-medium">
              Failed to send message. Please try again later.
            </div>
          )}

          <Button type="submit" className="w-full" isLoading={status === 'loading'}>
            Send Message
          </Button>
        </form>
      </Card>
    </motion.div>
  );
};

export default ContactPage;
