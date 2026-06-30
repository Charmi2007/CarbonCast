import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';

const AboutPage: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto py-10"
    >
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-brand-text mb-4">About CarbonCast</h1>
        <p className="text-lg text-brand-textSecondary">
          Empowering individuals to build a sustainable future through actionable data.
        </p>
      </div>

      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-bold text-brand-text mb-6">Our Mission</h2>
          <Card>
            <p className="text-brand-textSecondary leading-relaxed">
              Help individuals understand, monitor, and reduce their environmental impact through intelligent carbon footprint estimation and actionable sustainability insights.
            </p>
          </Card>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-brand-text mb-6">Our Vision</h2>
          <Card>
            <p className="text-brand-textSecondary leading-relaxed">
              Build an AI-powered sustainability platform that encourages environmentally responsible decisions using modern technology and data-driven analytics.
            </p>
          </Card>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-brand-text mb-6">Future AI Integration</h2>
          <Card>
            <p className="text-brand-textSecondary leading-relaxed mb-4">
              While our current estimation relies on standardized carbon multipliers, we are architecting CarbonCast to integrate a comprehensive Machine Learning model in the near future.
            </p>
            <p className="text-brand-textSecondary leading-relaxed">
              This ML engine will analyze behavioral patterns and localized geographic data to provide hyper-personalized recommendations, enabling a far more accurate representation of your carbon footprint.
            </p>
          </Card>
        </section>
      </div>
    </motion.div>
  );
};

export default AboutPage;
