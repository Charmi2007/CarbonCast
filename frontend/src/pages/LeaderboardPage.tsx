import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Award, Sparkles, Flame, BookOpen } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

interface Leader {
  rank: number;
  user: string;
  score: number;
  category: string;
  badge: string;
  tip: string;
}

const MOCK_LEADERS: Leader[] = [
  { rank: 1, user: "Dia Mirza", score: 94, category: "Low", badge: "🌍 Planet Protector", tip: "Dia has active composting wins. Log a composting win to challenge her rank!" },
  { rank: 2, user: "John Abraham", score: 88, category: "Low", badge: "🌳 Forestry Sponsor", tip: "John is offset-heavy. Swap 2 more fossil-fuel commute trips to compete with him!" },
  { rank: 3, user: "EcoWarrior", score: 75, category: "Low", badge: "🌿 Green Citizen", tip: "EcoWarrior avoided 15kg plastic. Avoid 3 more plastic purchases to pass them!" },
  { rank: 4, user: "Conscious Actioner", score: 68, category: "Moderate", badge: "🌱 Eco Beginner", tip: "Conscious Actioner uses 50% clean energy. Boost clean energy to pass them!" }
];

const MOCK_PROFILES: Record<string, any> = {
  "John Abraham": {
    name: "John Abraham",
    avatar: "JA",
    streak: 12,
    totalSaved: 185.4,
    carbonScore: 88,
    category: "Low",
    badge: "🌳 Forestry Sponsor",
    bio: "Sustainability advocate, actor, and fitness enthusiast. Swapping long transit trips for high-speed cycling commutes and hybrid EVs.",
    connectionCount: 423,
    recentPosts: [
      { text: "Swapped my daily gym transit to cycling! Saved 3.2 kg CO₂e. 💪🚲 #sustainablefitness", category: "transport", carbon_saved: 3.2 },
      { text: "Set up a new 5kW solar paneled roof. 100% off the local grid now! ☀️🏡 #cleanenergy", category: "energy", carbon_saved: 45.0 }
    ]
  },
  "Dia Mirza": {
    name: "Dia Mirza",
    avatar: "DM",
    streak: 18,
    totalSaved: 312.0,
    carbonScore: 94,
    category: "Low",
    badge: "🌍 Planet Protector",
    bio: "UN Environment Goodwill Ambassador. Composting organic waste, reducing single-use plastic, and practicing circular economy principles.",
    connectionCount: 912,
    recentPosts: [
      { text: "Hosted a zero-waste community composting workshop today. Everyone starts small! 🍂🌱 #compostwins", category: "lifestyle", carbon_saved: 8.5 },
      { text: "Swapped to 100% plant-based meal replacements this whole week. Reduced food miles footprint! 🥦🥗", category: "food", carbon_saved: 12.0 }
    ]
  }
};

const LeaderboardPage: React.FC = () => {
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [connections, setConnections] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('connections') || '[]');
    } catch {
      return [];
    }
  });

  const toggleConnection = (name: string) => {
    const isConnected = connections.includes(name);
    let updated: string[];
    if (isConnected) {
      updated = connections.filter(c => c !== name);
    } else {
      updated = [...connections, name];
    }
    localStorage.setItem('connections', JSON.stringify(updated));
    setConnections(updated);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return <span className="font-bold text-xs text-brand-textSecondary">{rank}</span>;
  };

  const openUserProfile = (name: string) => {
    if (MOCK_PROFILES[name]) {
      setSelectedProfile(MOCK_PROFILES[name]);
    } else {
      setSelectedProfile({
        name: name,
        avatar: name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
        streak: Math.floor(Math.random() * 8) + 1,
        totalSaved: Math.round((Math.random() * 50 + 10) * 10) / 10,
        carbonScore: name === "EcoWarrior" ? 75 : 68,
        category: name === "EcoWarrior" ? "Low" : "Moderate",
        badge: name === "EcoWarrior" ? "🌿 Green Citizen" : "🌱 Eco Beginner",
        bio: `${name} is an active member of CarbonCast logging daily clean energy and transit habits.`,
        connectionCount: Math.floor(Math.random() * 40) + 12,
        recentPosts: []
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      {/* Background Glow */}
      <div className="absolute top-10 left-1/4 w-80 h-80 bg-brand-primary/5 rounded-full blur-[80px] pointer-events-none -z-10"></div>

      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-1 bg-brand-primary/10 px-3 py-1 rounded-full text-brand-primary text-xs font-semibold mb-4 border border-brand-primary/20">
          <Sparkles className="w-3.5 h-3.5" /> High Performers Hall
        </div>
        <h1 className="text-4xl font-black text-brand-text mb-4">CarbonCast Leaderboard</h1>
        <p className="text-brand-textSecondary text-sm max-w-xl mx-auto">Click on any profile to see what they are doing, and read the tips to learn how to scale your own rank.</p>
      </div>

      <Card className="overflow-hidden p-0 border border-brand-border bg-brand-surface/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-surface/80 border-b border-brand-border/60">
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-brand-textSecondary">Rank</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-brand-textSecondary">User Profile</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-brand-textSecondary">Eco Score</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-brand-textSecondary">Badge</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-brand-textSecondary">Grow Ranks Action</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_LEADERS.map((leader, index) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={leader.rank} 
                  className="border-b border-brand-border/40 hover:bg-brand-surface/40 transition-colors"
                >
                  <td className="py-5 px-6">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-bg/50 border border-brand-border/60">
                      {getRankIcon(leader.rank)}
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <button 
                      onClick={() => openUserProfile(leader.user)}
                      className="font-bold text-sm text-brand-text hover:text-brand-primary transition-colors text-left"
                    >
                      {leader.user}
                    </button>
                  </td>
                  <td className="py-5 px-6">
                    <span className="font-extrabold text-brand-primary text-sm">{leader.score}</span>
                    <span className="text-[10px] text-brand-textSecondary font-semibold">/100</span>
                  </td>
                  <td className="py-5 px-6">
                    <span className="text-xs font-semibold text-brand-text">{leader.badge}</span>
                  </td>
                  <td className="py-5 px-6 max-w-xs">
                    <p className="text-[11px] text-brand-textSecondary italic leading-relaxed">
                      {leader.tip}
                    </p>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* User Profile Modal */}
      <AnimatePresence>
        {selectedProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-brand-surface border border-brand-border rounded-3xl overflow-hidden shadow-2xl p-6 relative text-left"
            >
              <button 
                onClick={() => setSelectedProfile(null)}
                className="absolute top-4 right-4 text-brand-textSecondary hover:text-brand-text font-bold text-sm"
              >
                ✕ Close
              </button>

              {/* Profile Header */}
              <div className="flex gap-4 items-center mb-6">
                <div className="w-16 h-16 rounded-full bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center font-black text-xl text-brand-primary shrink-0">
                  {selectedProfile.avatar}
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-lg font-bold text-brand-text leading-tight">{selectedProfile.name}</h2>
                    <span className="text-[10px] bg-orange-500/10 border border-orange-500/30 text-orange-400 font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <Flame className="w-3 h-3 fill-orange-500 text-orange-500" /> {selectedProfile.streak}d
                    </span>
                  </div>
                  <p className="text-[10px] text-brand-primary font-bold mt-0.5 uppercase tracking-wider">{selectedProfile.badge}</p>
                </div>
                
                <Button 
                  size="sm"
                  onClick={() => toggleConnection(selectedProfile.name)}
                  className={`text-[10px] font-bold px-4 py-2.5 rounded-xl transition-all ${connections.includes(selectedProfile.name) ? 'bg-brand-surface border border-brand-primary text-brand-primary' : 'bg-brand-primary text-white'}`}
                >
                  {connections.includes(selectedProfile.name) ? '✓ Connected' : '+ Connect'}
                </Button>
              </div>

              {/* Bio */}
              <p className="text-xs text-brand-textSecondary leading-relaxed mb-6 bg-brand-bgAlt p-3.5 rounded-2xl border border-brand-border/40">
                {selectedProfile.bio}
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 text-center mb-6">
                <div className="bg-brand-bgAlt p-3 rounded-2xl border border-brand-border/30">
                  <div className="text-lg font-black text-brand-primary">{selectedProfile.carbonScore}/100</div>
                  <div className="text-[9px] uppercase tracking-wider text-brand-textSecondary font-bold mt-1">Eco Score</div>
                </div>
                <div className="bg-brand-bgAlt p-3 rounded-2xl border border-brand-border/30">
                  <div className="text-lg font-black text-brand-success">{selectedProfile.totalSaved.toFixed(1)}kg</div>
                  <div className="text-[9px] uppercase tracking-wider text-brand-textSecondary font-bold mt-1">Offsets Saved</div>
                </div>
                <div className="bg-brand-bgAlt p-3 rounded-2xl border border-brand-border/30">
                  <div className="text-lg font-black text-brand-text">
                    {selectedProfile.connectionCount + (connections.includes(selectedProfile.name) ? 1 : 0)}
                  </div>
                  <div className="text-[9px] uppercase tracking-wider text-brand-textSecondary font-bold mt-1">Connections</div>
                </div>
              </div>

              {/* Recent Actions list */}
              {selectedProfile.recentPosts && selectedProfile.recentPosts.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-textSecondary mb-3">
                    <BookOpen className="w-3.5 h-3.5" /> Recent Green Actions
                  </div>
                  <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
                    {selectedProfile.recentPosts.map((act: any, i: number) => (
                      <div key={i} className="p-3 bg-brand-bgAlt rounded-xl border border-brand-border/40 text-xs">
                        <p className="text-brand-text mb-2 leading-relaxed">{act.text}</p>
                        <div className="flex justify-between items-center text-[9px] text-brand-textSecondary font-semibold">
                          <span className="capitalize text-brand-primary">#{act.category}</span>
                          <span className="text-brand-success">Saved {act.carbon_saved.toFixed(1)}kg CO₂e</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LeaderboardPage;
