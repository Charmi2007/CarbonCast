import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Leaf, PlusCircle, Clock, Tag, Flame, Users, BookOpen } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';

interface Post {
  id: string;
  user_id: string;
  user_name: string;
  text: string;
  category: string;
  carbon_saved: number;
  timestamp: string;
}

export const CommunityPage: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Compositor state
  const [text, setText] = useState('');
  const [category, setCategory] = useState('lifestyle');
  const [carbonSaved, setCarbonSaved] = useState<number>(1.5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Social Profile & Connection States
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [connections, setConnections] = useState<string[]>([]); // list of user_names connected

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

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await apiClient.get('/posts');
      const postList = Array.isArray(res.data) ? res.data : res.data.posts || [];
      
      // Inject seed posts for Dia Mirza and John Abraham at the top to guarantee social discovery
      const seedPosts = [
        {
          id: "seed_ja_1",
          user_id: "user_ja",
          user_name: "John Abraham",
          text: "Swapped my daily gym transit to cycling! Saved 3.2 kg CO₂e. 💪🚲 #sustainablefitness",
          category: "transport",
          carbon_saved: 3.2,
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: "seed_dm_1",
          user_id: "user_dm",
          user_name: "Dia Mirza",
          text: "Hosted a zero-waste community composting workshop today. Everyone starts small! 🍂🌱 #compostwins",
          category: "lifestyle",
          carbon_saved: 8.5,
          timestamp: new Date(Date.now() - 3600000 * 3).toISOString()
        }
      ];

      setPosts([...seedPosts, ...postList]);
    } catch (error) {
      console.error('Failed to fetch community posts', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    setIsSubmitting(true);
    try {
      const res = await apiClient.post('/posts', {
        text,
        category,
        carbon_saved: carbonSaved
      });
      setPosts([res.data, ...posts]);
      setText('');
      setCarbonSaved(1.5);
      setCategory('lifestyle');
    } catch (error) {
      console.error('Failed to submit post', error);
    } finally {
      setIsSubmitting(false);
    }
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
        carbonScore: Math.floor(Math.random() * 20) + 60,
        category: "Moderate",
        badge: "🌱 Eco Beginner",
        bio: "Sustainability enthusiast. Logged in and actively working with CarbonCast to reduce carbon offsets.",
        connectionCount: Math.floor(Math.random() * 40) + 12,
        recentPosts: posts.filter(p => p.user_name === name).map(p => ({
          text: p.text,
          category: p.category,
          carbon_saved: p.carbon_saved
        }))
      });
    }
  };

  const getCategoryColor = (cat: string) => {
    switch(cat.toLowerCase()) {
      case 'transport': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'energy': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'food': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default: return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      {/* Background Glow */}
      <div className="absolute top-10 left-1/2 w-64 h-64 bg-brand-primary/5 rounded-full blur-[80px] pointer-events-none -z-10"></div>

      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1 bg-brand-primary/10 px-3 py-1 rounded-full text-brand-primary text-xs font-semibold mb-4 border border-brand-primary/20">
          <Users className="w-3.5 h-3.5" /> Climate Action Network
        </div>
        <h1 className="text-4xl font-black text-brand-text mb-4">Sustainability Hub</h1>
        <p className="text-brand-textSecondary text-sm max-w-xl mx-auto">Connect with fellow enthusiasts, view profiles, and log daily carbon offsets to grow your streak.</p>
      </div>

      {/* Post Compositor */}
      {user ? (
        <Card className="mb-10 bg-brand-surface border border-brand-primary/25 shadow-lg shadow-brand-primary/5">
          <form onSubmit={handlePostSubmit}>
            <div className="mb-4">
              <label className="text-xs font-bold text-brand-textSecondary mb-2 block uppercase tracking-wider">Share a daily green win</label>
              <textarea 
                className="w-full px-4 py-3 rounded-xl border border-brand-border bg-brand-bg/50 text-brand-text placeholder-brand-textSecondary focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all resize-none text-sm"
                rows={3}
                placeholder="e.g., Kept AC turned off for 4 hours today during cooling peaks!"
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={280}
                required
              />
              <div className="text-right text-[10px] text-brand-textSecondary mt-1 font-semibold">
                {text.length}/280
              </div>
            </div>
            
            <div className="flex flex-wrap items-end justify-between gap-4 pt-3 border-t border-brand-border/40">
              <div className="flex gap-4 flex-1">
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-brand-textSecondary mb-1.5 block uppercase tracking-wider">Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-brand-border bg-brand-bg/50 text-brand-text text-xs focus:ring-2 focus:ring-brand-primary outline-none"
                  >
                    <option value="transport">Transport</option>
                    <option value="energy">Energy</option>
                    <option value="food">Food</option>
                    <option value="lifestyle">Lifestyle</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-brand-textSecondary mb-1.5 block uppercase tracking-wider">Carbon Offset (kg)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    min="0.1"
                    value={carbonSaved}
                    onChange={(e) => setCarbonSaved(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-brand-border bg-brand-bg/50 text-brand-text text-xs focus:ring-2 focus:ring-brand-primary outline-none"
                    required
                  />
                </div>
              </div>
              <Button type="submit" isLoading={isSubmitting} disabled={!text.trim()} className="bg-brand-primary text-white font-semibold text-xs px-6 py-2.5 rounded-xl shadow shadow-brand-primary/10">
                <PlusCircle className="w-4 h-4 mr-2" /> Log Action
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Card className="mb-10 text-center py-8 bg-brand-surface border border-brand-border">
          <Leaf className="w-10 h-10 text-brand-primary/40 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-brand-text mb-2">Join the Network</h3>
          <p className="text-xs text-brand-textSecondary mb-4">Create your eco-account to log actions, build streaks, and connect with other sustainability champions.</p>
          <div className="flex justify-center gap-3">
            <Link to="/login"><Button variant="outline" size="sm">Log In</Button></Link>
            <Link to="/signup"><Button size="sm">Sign Up</Button></Link>
          </div>
        </Card>
      )}

      {/* Feed List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-10 text-brand-textSecondary text-xs">Loading feed...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-10 text-brand-textSecondary bg-brand-surface rounded-2xl border border-brand-border text-xs">
            No posts yet. Be the first to share a green win!
          </div>
        ) : (
          posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border border-brand-border/60 bg-brand-surface/70 hover:border-brand-primary/20 transition-colors duration-300">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => openUserProfile(post.user_name)}
                      className="w-10 h-10 rounded-full bg-brand-primary/10 hover:bg-brand-primary/20 flex items-center justify-center font-bold text-brand-primary transition-colors border border-brand-primary/10 shrink-0 text-sm"
                    >
                      {post.user_name === "John Abraham" ? "JA" : post.user_name === "Dia Mirza" ? "DM" : post.user_name.charAt(0).toUpperCase()}
                    </button>
                    <div className="text-left">
                      <button 
                        onClick={() => openUserProfile(post.user_name)}
                        className="font-bold text-sm text-brand-text hover:text-brand-primary transition-colors block text-left"
                      >
                        {post.user_name}
                      </button>
                      <div className="flex items-center text-[10px] text-brand-textSecondary gap-1 font-semibold">
                        <Clock className="w-3 h-3" />
                        {new Date(post.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                      </div>
                    </div>
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1 ${getCategoryColor(post.category)}`}>
                    <Tag className="w-3 h-3" />
                    {post.category}
                  </div>
                </div>
                
                <p className="text-brand-text text-sm mb-4 leading-relaxed whitespace-pre-wrap text-left">
                  {post.text}
                </p>
                
                <div className="flex justify-between items-center pt-2 border-t border-brand-border/40">
                  <div className="inline-flex items-center gap-1.5 bg-brand-primary/10 px-2.5 py-1 rounded-lg border border-brand-primary/25">
                    <Leaf className="w-3.5 h-3.5 text-brand-primary" />
                    <span className="text-xs font-bold text-brand-primary">Saved {post.carbon_saved.toFixed(1)} kg CO₂e</span>
                  </div>
                  {post.user_name !== "John Abraham" && post.user_name !== "Dia Mirza" && (
                    <span className="text-[10px] text-brand-textSecondary font-semibold">streak participant</span>
                  )}
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>

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
                
                {/* Connect button */}
                <Button 
                  size="sm"
                  onClick={() => {
                    const isConnected = connections.includes(selectedProfile.name);
                    if (isConnected) {
                      setConnections(connections.filter(c => c !== selectedProfile.name));
                    } else {
                      setConnections([...connections, selectedProfile.name]);
                    }
                  }}
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
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-textSecondary mb-3">
                  <BookOpen className="w-3.5 h-3.5" /> Recent Green Actions
                </div>
                <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
                  {selectedProfile.recentPosts.length === 0 ? (
                    <div className="text-[11px] text-brand-textSecondary italic text-center py-4">No recent actions logged.</div>
                  ) : (
                    selectedProfile.recentPosts.map((act: any, i: number) => (
                      <div key={i} className="p-3 bg-brand-bgAlt rounded-xl border border-brand-border/40 text-xs">
                        <p className="text-brand-text mb-2 leading-relaxed">{act.text}</p>
                        <div className="flex justify-between items-center text-[9px] text-brand-textSecondary font-semibold">
                          <span className="capitalize text-brand-primary">#{act.category}</span>
                          <span className="text-brand-success">Saved {act.carbon_saved.toFixed(1)}kg CO₂e</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommunityPage;
