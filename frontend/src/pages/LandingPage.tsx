import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Leaf, BarChart2, Shield } from 'lucide-react';
import { Button } from '../components/ui/Button';

const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-20 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold text-brand-text leading-tight mb-6">
            Estimate your annual carbon footprint in <span className="text-brand-primary">under a minute.</span>
          </h1>
          <p className="text-lg text-brand-textSecondary max-w-2xl mx-auto mb-10">
            Understand your environmental impact with an intuitive carbon footprint calculator and personalized sustainability insights.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/calculator">
              <Button size="lg" className="gap-2">
                Calculate My Footprint <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="outline" size="lg">Learn More</Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="w-full py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<BarChart2 className="w-8 h-8 text-brand-primary" />}
            title="Data-Driven Insights"
            description="Receive a comprehensive breakdown of your emissions based on your daily lifestyle choices."
          />
          <FeatureCard 
            icon={<Leaf className="w-8 h-8 text-brand-primary" />}
            title="Actionable Recommendations"
            description="Get personalized, practical tips to reduce your carbon footprint effectively."
          />
          <FeatureCard 
            icon={<Shield className="w-8 h-8 text-brand-primary" />}
            title="Enterprise Security"
            description="Your personal data is securely handled and anonymized for privacy."
          />
        </div>
      </section>

      {/* Statistics / Trust Section */}
      <section className="w-full py-16 bg-brand-primary rounded-3xl text-white text-center my-10">
        <h2 className="text-3xl font-bold mb-8">Join the Movement</h2>
        <div className="flex flex-col md:flex-row justify-center gap-12">
          <div>
            <p className="text-4xl font-bold mb-2">10k+</p>
            <p className="text-brand-accent">Users Calculated</p>
          </div>
          <div>
            <p className="text-4xl font-bold mb-2">50 Tonnes</p>
            <p className="text-brand-accent">CO₂ Reduced</p>
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-brand-bg p-8 rounded-2xl shadow-soft border border-brand-border text-center"
  >
    <div className="mx-auto w-16 h-16 bg-brand-surface rounded-full flex items-center justify-center mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-brand-text mb-3">{title}</h3>
    <p className="text-brand-textSecondary">{description}</p>
  </motion.div>
);

export default LandingPage;
