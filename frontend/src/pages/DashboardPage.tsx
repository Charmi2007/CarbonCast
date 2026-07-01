import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowRight, Download, Share2, CheckCircle2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import axios from 'axios';

const COLORS = ['#2E7D32', '#66BB6A', '#A5D6A7', '#F59E0B'];

export default function DashboardPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/v1/results/${id}`);
        setData(res.data.data.record);
      } catch (error) {
        console.error("Failed to fetch results", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchResults();
  }, [id]);

  if (loading) {
    return <div className="text-center py-20">Loading your results...</div>;
  }

  if (!data) {
    return <div className="text-center py-20">Result not found.</div>;
  }

  const { results } = data;
  const breakdownData = [
    { name: 'Transportation', value: results.breakdown.transportation * 100 },
    { name: 'Electricity', value: results.breakdown.electricity * 100 },
    { name: 'Food', value: results.breakdown.food * 100 },
    { name: 'Lifestyle', value: results.breakdown.lifestyle * 100 },
  ];

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-brand-text">Your Carbon Footprint</h1>
          <p className="text-brand-textSecondary">Here is the detailed breakdown of your estimated emissions.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="gap-2"><Share2 className="w-4 h-4"/> Share</Button>
          <Button variant="outline" className="gap-2" onClick={() => window.open(`http://localhost:5000/api/v1/report/${id}`, '_blank')}><Download className="w-4 h-4"/> Download Report</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Total Score Card */}
        <Card className="lg:col-span-1 flex flex-col justify-center items-center text-center py-10 bg-gradient-to-br from-brand-primary to-brand-secondary text-white border-none shadow-modern">
          <h3 className="text-lg font-medium text-brand-accent mb-2">Estimated Annual Emissions</h3>
          <div className="text-5xl font-bold font-poppins mb-4">
            {results.totalCarbonFootprint} <span className="text-2xl">tonnes CO₂</span>
          </div>
          <div className="flex gap-4 mt-2">
            <div className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm">
              <div className="text-xs uppercase tracking-wider text-brand-accent">Carbon Score</div>
              <div className="text-xl font-bold">{results.carbonScore}/100</div>
            </div>
            <div className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm">
              <div className="text-xs uppercase tracking-wider text-brand-accent">Category</div>
              <div className="text-xl font-bold">{results.category}</div>
            </div>
          </div>
        </Card>

        {/* Breakdown Charts */}
        <Card className="lg:col-span-2">
          <h3 className="text-xl font-bold text-brand-text mb-6">Emissions Breakdown</h3>
          <div className="h-[250px] flex">
            <ResponsiveContainer width="50%" height="100%">
              <PieChart>
                <Pie
                  data={breakdownData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {breakdownData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
              </PieChart>
            </ResponsiveContainer>
            <ResponsiveContainer width="50%" height="100%">
              <BarChart data={breakdownData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} />
                <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {breakdownData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-xl font-bold text-brand-text mb-6">Personalized Recommendations</h3>
          <ul className="space-y-4">
            {results.recommendations.map((rec: string, index: number) => (
              <motion.li 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                key={index} 
                className="flex items-start gap-3 p-4 bg-brand-surface rounded-xl"
              >
                <CheckCircle2 className="w-6 h-6 text-brand-primary shrink-0" />
                <span className="text-brand-text font-medium">{rec}</span>
              </motion.li>
            ))}
          </ul>
        </Card>

        <Card className="bg-brand-bgAlt flex flex-col justify-center items-center text-center p-10">
          <div className="w-16 h-16 bg-brand-surface rounded-full flex items-center justify-center mb-4">
            <ArrowRight className="w-8 h-8 text-brand-primary" />
          </div>
          <h3 className="text-xl font-bold text-brand-text mb-2">Want to do more?</h3>
          <p className="text-brand-textSecondary mb-6">Explore our full library of sustainability tips to find new ways to reduce your footprint.</p>
          <Link to="/tips">
            <Button>Explore Sustainability Tips</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
