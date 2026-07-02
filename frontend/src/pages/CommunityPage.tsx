import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Leaf, PlusCircle, Clock, Tag } from 'lucide-react';
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

const CommunityPage: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Compositor state
  const [text, setText] = useState('');
  const [category, setCategory] = useState('lifestyle');
  const [carbonSaved, setCarbonSaved] = useState<number>(0.5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await apiClient.get('/posts');
      if (res.data) {
        // The API returns the list directly or wrapped in data. Let's assume it's a list for now based on spec.
        // Or if it's wrapped, handle it. Let's handle both.
        const postList = Array.isArray(res.data) ? res.data : res.data.posts || [];
        setPosts(postList);
      }
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
      // Prepend the new post locally
      setPosts([res.data, ...posts]);
      setText('');
      setCarbonSaved(0.5);
      setCategory('lifestyle');
    } catch (error) {
      console.error('Failed to submit post', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryColor = (cat: string) => {
    switch(cat.toLowerCase()) {
      case 'transport': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'energy': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'food': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-purple-100 text-purple-700 border-purple-200';
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-brand-text mb-4">Community Feed</h1>
        <p className="text-brand-textSecondary">Share your daily green wins and get inspired by others.</p>
      </div>

      {/* Post Compositor */}
      {user ? (
        <Card className="mb-10 bg-brand-bgAlt border-brand-primary/20">
          <form onSubmit={handlePostSubmit}>
            <div className="mb-4">
              <label className="text-sm font-semibold text-brand-text mb-2 block">Share your daily green win</label>
              <textarea 
                className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white text-brand-text placeholder-brand-textSecondary focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all resize-none"
                rows={3}
                placeholder="e.g., Walked to lunch today instead of driving!"
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={280}
                required
              />
              <div className="text-right text-xs text-brand-textSecondary mt-1">
                {text.length}/280
              </div>
            </div>
            
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex gap-4 flex-1">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-brand-textSecondary mb-1 block">Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-brand-border bg-white text-sm focus:ring-2 focus:ring-brand-primary outline-none"
                  >
                    <option value="transport">Transport</option>
                    <option value="energy">Energy</option>
                    <option value="food">Food</option>
                    <option value="lifestyle">Lifestyle</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-xs font-semibold text-brand-textSecondary mb-1 block">Est. CO₂ Saved (kg)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    min="0"
                    value={carbonSaved}
                    onChange={(e) => setCarbonSaved(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-brand-border bg-white text-sm focus:ring-2 focus:ring-brand-primary outline-none"
                    required
                  />
                </div>
              </div>
              <Button type="submit" isLoading={isSubmitting} disabled={!text.trim()}>
                <PlusCircle className="w-4 h-4 mr-2" /> Post
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Card className="mb-10 text-center py-8">
          <Leaf className="w-10 h-10 text-brand-primary/50 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-brand-text mb-2">Join the Conversation</h3>
          <p className="text-brand-textSecondary mb-4">Sign up or log in to share your sustainability achievements with the community.</p>
          <div className="flex justify-center gap-3">
            <Link to="/login"><Button variant="outline" size="sm">Log In</Button></Link>
            <Link to="/signup"><Button size="sm">Sign Up</Button></Link>
          </div>
        </Card>
      )}

      {/* Feed List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-10 text-brand-textSecondary">Loading feed...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-10 text-brand-textSecondary bg-brand-surface rounded-2xl">
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
              <Card>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center font-bold text-brand-primary">
                      {post.user_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-brand-text">{post.user_name}</div>
                      <div className="flex items-center text-xs text-brand-textSecondary gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(post.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                      </div>
                    </div>
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${getCategoryColor(post.category)}`}>
                    <Tag className="w-3 h-3" />
                    {post.category}
                  </div>
                </div>
                
                <p className="text-brand-text text-[15px] mb-4 leading-relaxed whitespace-pre-wrap">
                  {post.text}
                </p>
                
                <div className="inline-flex items-center gap-2 bg-brand-success/10 px-3 py-1.5 rounded-lg border border-brand-success/20">
                  <Leaf className="w-4 h-4 text-brand-success" />
                  <span className="text-sm font-semibold text-brand-success">Saved {post.carbon_saved.toFixed(1)} kg CO₂e</span>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommunityPage;
