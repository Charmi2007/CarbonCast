import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Zap, Car, Utensils, Recycle, ShoppingBag } from 'lucide-react';
import { Card } from '../components/ui/Card';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface Tip {
  id: number;
  category: string;
  title: string;
  description: string;
  saving: string;
}

const getCategoryIcon = (category: string) => {
  switch(category) {
    case 'Energy': return <Zap className="text-yellow-500 w-6 h-6" />;
    case 'Transportation': return <Car className="text-blue-500 w-6 h-6" />;
    case 'Food': return <Utensils className="text-brand-success w-6 h-6" />;
    case 'Recycling': return <Recycle className="text-brand-primary w-6 h-6" />;
    case 'Shopping': return <ShoppingBag className="text-purple-500 w-6 h-6" />;
    default: return <Lightbulb className="text-brand-accent w-6 h-6" />;
  }
};

const TipsPage: React.FC = () => {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTips = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/v1/tips`);
        setTips(res.data.data.tips);
      } catch (error) {
        console.error("Failed to fetch tips", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTips();
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-10">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-brand-text mb-4">Sustainability Tips</h1>
        <p className="text-brand-textSecondary max-w-2xl mx-auto">
          Small changes in your daily routine can make a massive impact on the environment. Explore actionable tips to lower your footprint.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-brand-textSecondary">Loading tips...</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tips.map((tip, index) => (
            <motion.div
              key={tip.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hoverable className="h-full flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-brand-surface rounded-xl">
                    {getCategoryIcon(tip.category)}
                  </div>
                  <span className="font-medium text-sm text-brand-textSecondary uppercase tracking-wider">{tip.category}</span>
                </div>
                <h3 className="text-xl font-bold text-brand-text mb-2">{tip.title}</h3>
                <p className="text-brand-textSecondary flex-1 mb-6">{tip.description}</p>
                <div className="mt-auto pt-4 border-t border-brand-border">
                  <span className="text-sm font-semibold text-brand-primary">Est. Savings: {tip.saving}</span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TipsPage;
