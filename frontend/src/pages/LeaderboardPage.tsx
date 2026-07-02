import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award } from 'lucide-react';
import { Card } from '../components/ui/Card';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface Leader {
  rank: number;
  user: string;
  score: number;
  category: string;
  badge: string;
}

const LeaderboardPage: React.FC = () => {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/v1/leaderboard`);
        setLeaders(res.data.data.leaderboard);
      } catch (error) {
        console.error("Failed to fetch leaderboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return <span className="font-bold text-brand-textSecondary">{rank}</span>;
  };

  return (
    <div className="max-w-4xl mx-auto py-10">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-brand-text mb-4">Top Eco Performers</h1>
        <p className="text-brand-textSecondary">See how you stack up against our most sustainable users.</p>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-surface border-b border-brand-border">
                <th className="py-4 px-6 font-semibold text-brand-text">Rank</th>
                <th className="py-4 px-6 font-semibold text-brand-text">User</th>
                <th className="py-4 px-6 font-semibold text-brand-text">Carbon Score</th>
                <th className="py-4 px-6 font-semibold text-brand-text">Category</th>
                <th className="py-4 px-6 font-semibold text-brand-text">Badge</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-brand-textSecondary">
                    Loading leaderboard...
                  </td>
                </tr>
              ) : (
                leaders.map((leader, index) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    key={leader.rank} 
                    className="border-b border-brand-border hover:bg-brand-bgAlt transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-surface">
                        {getRankIcon(leader.rank)}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium text-brand-text">{leader.user}</td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-brand-primary">{leader.score}</span>/100
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${leader.category === 'Low' ? 'bg-brand-success/10 text-brand-success' : 'bg-brand-warning/10 text-brand-warning'}`}>
                        {leader.category}
                      </span>
                    </td>
                    <td className="py-4 px-6">{leader.badge}</td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default LeaderboardPage;
