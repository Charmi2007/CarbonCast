import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { Download, CheckCircle2, Clipboard, Plus, Trash, History } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import axios from 'axios';

const COLORS = ['#2E7D32', '#66BB6A', '#A5D6A7', '#F59E0B'];

const getRoastMessage = (score: number, category: string) => {
  if (score < 40 || category === "High") {
    const roasts = [
      "Are you trying to speedrun global warming? Your AC usage alone is keeping the coal plants in business. The polar bears have put a bounty on your head. Please buy a bicycle.",
      "Your carbon footprint is larger than some small developing nations. If we had a leaderboard, you'd be in the coal tier. Maybe try walking once in a while?",
      "Single-handedly keeping the oil drillers rich, are we? Glaciers melt when you wake up in the morning. Turn off the AC before the penguins start sending you utility bills.",
      "Your lifestyle is practically a sponsor of the carbon industrial complex. 5 flights a year and an SUV commute? Nature called, it wants its atmosphere back."
    ];
    return roasts[Math.floor((score + 1) % roasts.length)];
  }
  if (score <= 70 || category === "Moderate") {
    const roasts = [
      "Not terrible, but you aren't saving the planet either. You're like the person who recycles a plastic cup but leaves the hose running. Average citizen. 6/10.",
      "You're doing okay, but those weekend drives and online orders are doing some heavy lifting. Time to plant some more trees or skip that second burger.",
      "Ah, the classic 'I care about the environment but love shopping' archetype. You are the reason carbon offsets exist. Doing okay, but room to grow!",
      "A textbook case of climate moderation. You walk to the grocery store but fly to vacation three times a year. Perfectly average."
    ];
    return roasts[Math.floor((score + 2) % roasts.length)];
  }
  const praises = [
    "Alright, we get it, you're a saint. You probably apologize to plants before eating them. But seriously, great job! You are actually helping. Take a gold star.",
    "You breathe clean air, walk everywhere, and live on leaves. The trees thank you for your service. You're practically carbon-negative at this rate.",
    "Eco-warrior status unlocked! Your emissions are low enough to make Greta Thunberg smile. Go enjoy a plant-based shake, you earned it.",
    "Almost zero plastic, electric/transit commuting, and you plant trees? You're basically the final boss of sustainability. Excellent work!"
  ];
  return praises[Math.floor((score + 3) % praises.length)];
};

export default function DashboardPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [modelInfo, setModelInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // History tracking states
  const [personalHistory, setPersonalHistory] = useState<any[]>([]);

  // Live what-if simulation states
  const [transportPct, setTransportPct] = useState(0);
  const [electricityPct, setElectricityPct] = useState(0);
  const [meatPct, setMeatPct] = useState(0);
  const [flightsPct, setFlightsPct] = useState(0);
  const [shoppingPct, setShoppingPct] = useState(0);
  const [simResults, setSimResults] = useState<any>(null);
  const [simLoading, setSimLoading] = useState(false);

  // Personalized Quick-Win checklist states
  const [customGoals, setCustomGoals] = useState<string[]>([
    "Swap beef or pork for chicken/fish once a week",
    "Turn off air conditioning or heater 30 mins before leaving",
    "Unplug standby chargers & desktop power strips at night"
  ]);
  const [newGoalText, setNewGoalText] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const [res, modelRes, historyRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/v1/results/${id}`),
          axios.get(`http://localhost:5000/api/v1/model-info`),
          axios.get(`http://localhost:5000/history`)
        ]);

        setData(res.data.data.record);
        setModelInfo(modelRes.data.data);

        // Fetch my_calcs and filter history
        const myCalcs: string[] = JSON.parse(localStorage.getItem('my_calcs') || '[]');
        // If the current calculation is not in local storage yet, add it
        if (id && !myCalcs.includes(id)) {
          myCalcs.push(id);
          localStorage.setItem('my_calcs', JSON.stringify(myCalcs));
        }

        const filteredHistory = historyRes.data
          .filter((h: any) => myCalcs.includes(h.id))
          .map((h: any) => ({
            id: h.id,
            date: new Date(h.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            rawDate: new Date(h.timestamp),
            footprint: Number((h.prediction / 1000).toFixed(2)),
            score: h.carbon_score
          }))
          .sort((a: any, b: any) => a.rawDate.getTime() - b.rawDate.getTime());

        setPersonalHistory(filteredHistory);

      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
        // Fallback to fetch just results if model info fails
        try {
          const res = await axios.get(`http://localhost:5000/api/v1/results/${id}`);
          setData(res.data.data.record);
        } catch (err) {
          console.error("Secondary fetch failed", err);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [id]);

  // Debounced simulation effect to prevent server hammering while dragging
  useEffect(() => {
    if (!data || !data.mapped_inputs) return;

    const runSimulation = async () => {
      setSimLoading(true);
      try {
        const payload = {
          transport_km: data.mapped_inputs.transport_km || 0.0,
          electricity_kwh: data.mapped_inputs.electricity_kwh || 0.0,
          meat_meals: data.mapped_inputs.meat_meals || 0.0,
          flights: data.mapped_inputs.flights || 0.0,
          shopping: data.mapped_inputs.shopping || 0.0,
          transport_reduction_pct: transportPct,
          electricity_reduction_pct: electricityPct,
          meat_reduction_pct: meatPct,
          flights_reduction_pct: flightsPct,
          shopping_reduction_pct: shoppingPct
        };
        const res = await axios.post('http://localhost:5000/simulate', payload);
        setSimResults(res.data);
      } catch (err) {
        console.error("Live simulation request failed", err);
      } finally {
        setSimLoading(false);
      }
    };

    const timeout = setTimeout(runSimulation, 400);
    return () => clearTimeout(timeout);
  }, [transportPct, electricityPct, meatPct, flightsPct, shoppingPct, data]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-brand-primary font-medium animate-pulse">Analyzing results...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-brand-text mb-4">Results Not Found</h2>
        <p className="text-brand-textSecondary mb-6">We couldn't retrieve the requested carbon assessment record.</p>
        <Link to="/calculator">
          <Button>Start New Calculation</Button>
        </Link>
      </div>
    );
  }

  const { results } = data;

  const breakdownData = [
    { name: 'Transport', value: results.breakdown.transportation * 100 },
    { name: 'Electricity', value: results.breakdown.electricity * 100 },
    { name: 'Food', value: results.breakdown.food * 100 },
    { name: 'Shopping', value: results.breakdown.lifestyle * 100 },
  ];

  const addCustomGoal = () => {
    if (newGoalText.trim()) {
      setCustomGoals([...customGoals, newGoalText.trim()]);
      setNewGoalText("");
    }
  };

  const removeGoal = (index: number) => {
    setCustomGoals(customGoals.filter((_, idx) => idx !== index));
  };

  const copyActionPlan = () => {
    const savings = simResults ? Math.round(simResults.reduction) : 0;
    const simulatedTotal = simResults ? (simResults.new_prediction / 1000).toFixed(2) : results.totalCarbonFootprint;
    const text = `## My CarbonCast Action Plan\n\n` +
      `### Target Footprint Profile\n` +
      `- Current Footprint: ${results.totalCarbonFootprint} tonnes CO₂e/yr\n` +
      `- Target Footprint: ${simulatedTotal} tonnes CO₂e/yr\n` +
      `- Planned Savings: ${savings} kg CO₂e/yr\n\n` +
      `### My Checklist Goals\n` +
      customGoals.map(g => `- [ ] ${g}`).join('\n') +
      `\n\nGenerated via CarbonCast AI Estimator.`;

    navigator.clipboard.writeText(text);
    alert("Action Plan copied to clipboard! You can paste it directly in Notion, Apple Notes, or reminders.");
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-brand-text">Your Carbon Footprint</h1>
          <p className="text-brand-textSecondary">Here is the detailed breakdown of your estimated emissions.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={() => window.open(`http://localhost:5000/api/v1/report/${id}`, '_blank')}><Download className="w-4 h-4"/> Download PDF</Button>
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
          {results.percentile !== undefined && (
            <div className="mt-6 text-sm font-medium bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm text-brand-accent">
              🌱 Cleaner than <span className="font-bold text-white text-base">{results.percentile}%</span> of the community
            </div>
          )}
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

      {/* AI Carbon Roast / Review Card */}
      <Card className="mb-8 border border-brand-primary/20 bg-brand-primary/5">
        <h3 className="text-xl font-bold text-brand-text mb-2 flex items-center gap-2">
          🤖 AI Climate Roast & Review
        </h3>
        <p className="text-sm text-brand-textSecondary mb-4">
          We asked our carbon-conscious AI model to assess your lifestyle. Here is what it thinks:
        </p>
        <div className="bg-brand-bg/50 border border-brand-border/60 p-5 rounded-2xl">
          <p className="text-brand-text font-medium leading-relaxed italic text-base">
            "{getRoastMessage(results.carbonScore, results.category)}"
          </p>
        </div>
      </Card>

      {/* Historical Journey Progress Tracker Card */}
      <Card className="mb-8">
        <h3 className="text-xl font-bold text-brand-text mb-2 flex items-center gap-2">
          <History className="w-5 h-5 text-brand-primary" /> My Carbon Footprint Journey
        </h3>
        <p className="text-sm text-brand-textSecondary mb-6">
          Track your personal progress curve over time as you make lifestyle improvements and re-calculate.
        </p>

        {personalHistory.length > 1 ? (
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={personalHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="date" tickLine={false} stroke="#6B7280" style={{ fontSize: '11px' }} />
                <YAxis unit=" t" tickLine={false} axisLine={false} stroke="#6B7280" style={{ fontSize: '11px' }} />
                <Tooltip formatter={(value: number) => [`${value} tonnes CO₂e`, "Emissions"]} />
                <Line type="monotone" dataKey="footprint" stroke="#10B981" strokeWidth={3} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-8 bg-brand-bgAlt rounded-2xl border border-brand-border/60">
            <div className="text-3xl mb-3">📈</div>
            <h4 className="font-semibold text-brand-text text-sm mb-1">First Calculation Logged!</h4>
            <p className="text-xs text-brand-textSecondary max-w-sm">
              Make some of your planned lifestyle changes, then return in a week or two to re-calculate and watch your carbon emissions curve decline on this chart!
            </p>
          </div>
        )}
      </Card>

      {/* Interactive What-If Simulation Sandbox */}
      {data.mapped_inputs && (
        <Card className="mb-8">
          <h3 className="text-xl font-bold text-brand-text mb-2 flex items-center gap-2">
            🧪 What-If Simulation Sandbox
          </h3>
          <p className="text-sm text-brand-textSecondary mb-6">
            Drag the sliders below to see how reducing specific consumption targets instantly adjusts your predicted footprint.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-brand-bgAlt p-6 rounded-2xl border border-brand-border/60 mb-8">
            <div className="text-center md:border-r border-brand-border/60 py-2">
              <div className="text-xs uppercase text-brand-textSecondary font-semibold">Original Footprint</div>
              <div className="text-3xl font-bold text-brand-text mt-1">{results.totalCarbonFootprint} t CO₂e/yr</div>
            </div>
            <div className="text-center md:border-r border-brand-border/60 py-2">
              <div className="text-xs uppercase text-brand-textSecondary font-semibold">Simulated Target</div>
              <div className="text-3xl font-bold text-brand-primary mt-1 relative">
                {simLoading ? (
                  <span className="text-brand-primary animate-pulse">Calculating...</span>
                ) : (
                  <span>{simResults ? (simResults.new_prediction / 1000).toFixed(2) : results.totalCarbonFootprint} t CO₂e/yr</span>
                )}
              </div>
            </div>
            <div className="text-center py-2">
              <div className="text-xs uppercase text-brand-textSecondary font-semibold">Saved Emissions</div>
              <div className="text-3xl font-bold text-amber-600 mt-1">
                {simResults ? Math.round(simResults.reduction) : 0} kg CO₂e/yr
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {data.mapped_inputs.transport_km > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-semibold text-brand-text">
                  <span>Reduce Travel Commute Mileage</span>
                  <span className="text-brand-primary">-{transportPct}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={transportPct}
                  onChange={(e) => setTransportPct(Number(e.target.value))}
                  className="w-full h-2 bg-brand-border rounded-lg appearance-none cursor-pointer accent-brand-primary focus:outline-none"
                />
              </div>
            )}

            {data.mapped_inputs.electricity_kwh > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-semibold text-brand-text">
                  <span>Reduce Electricity Consumption</span>
                  <span className="text-brand-primary">-{electricityPct}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={electricityPct}
                  onChange={(e) => setElectricityPct(Number(e.target.value))}
                  className="w-full h-2 bg-brand-border rounded-lg appearance-none cursor-pointer accent-brand-primary focus:outline-none"
                />
              </div>
            )}

            {data.mapped_inputs.meat_meals > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-semibold text-brand-text">
                  <span>Reduce Meat Meals</span>
                  <span className="text-brand-primary">-{meatPct}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={meatPct}
                  onChange={(e) => setMeatPct(Number(e.target.value))}
                  className="w-full h-2 bg-brand-border rounded-lg appearance-none cursor-pointer accent-brand-primary focus:outline-none"
                />
              </div>
            )}

            {data.mapped_inputs.flights > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-semibold text-brand-text">
                  <span>Reduce Airplane Flight Trips</span>
                  <span className="text-brand-primary">-{flightsPct}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={flightsPct}
                  onChange={(e) => setFlightsPct(Number(e.target.value))}
                  className="w-full h-2 bg-brand-border rounded-lg appearance-none cursor-pointer accent-brand-primary focus:outline-none"
                />
              </div>
            )}

            {data.mapped_inputs.shopping > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-semibold text-brand-text">
                  <span>Reduce Shopping / Consumer Goods</span>
                  <span className="text-brand-primary">-{shoppingPct}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={shoppingPct}
                  onChange={(e) => setShoppingPct(Number(e.target.value))}
                  className="w-full h-2 bg-brand-border rounded-lg appearance-none cursor-pointer accent-brand-primary focus:outline-none"
                />
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Model statistics plot */}
      {modelInfo && (
        <Card className="mb-8">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <span className="bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">AI/ML Powered Prediction</span>
              <h3 className="text-2xl font-bold text-brand-text mt-3 mb-4">CarbonCast Estimator Model</h3>
              <p className="text-brand-textSecondary mb-4">
                This footprint estimation was generated by a machine learning model trained on our real dataset containing <strong>{modelInfo["Dataset rows"]}</strong> rows of lifestyle and environmental logs.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-brand-bgAlt p-4 rounded-xl border border-brand-border">
                  <div className="text-xs text-brand-textSecondary uppercase tracking-wider">Algorithm</div>
                  <div className="text-md font-bold text-brand-text truncate" title={modelInfo["Selected algorithm"]}>{modelInfo["Selected algorithm"]}</div>
                </div>
                <div className="bg-brand-bgAlt p-4 rounded-xl border border-brand-border">
                  <div className="text-xs text-brand-textSecondary uppercase tracking-wider">R² Score</div>
                  <div className="text-md font-bold text-brand-text">{modelInfo["R2 Score"]}</div>
                </div>
                <div className="bg-brand-bgAlt p-4 rounded-xl border border-brand-border">
                  <div className="text-xs text-brand-textSecondary uppercase tracking-wider">MAE</div>
                  <div className="text-md font-bold text-brand-text">{modelInfo["MAE"]} kg</div>
                </div>
                <div className="bg-brand-bgAlt p-4 rounded-xl border border-brand-border">
                  <div className="text-xs text-brand-textSecondary uppercase tracking-wider">RMSE</div>
                  <div className="text-md font-bold text-brand-text">{modelInfo["RMSE"]} kg</div>
                </div>
              </div>
              <p className="text-sm text-brand-textSecondary italic">
                * Features used: {modelInfo["Feature names"].join(", ")}. Unlike basic calculators, this model learns complex non-linear interactions between variables.
              </p>
            </div>
            <div className="w-full md:w-[320px] shrink-0 flex flex-col items-center">
              <h4 className="text-sm font-semibold text-brand-text mb-2">Model Regression Fit</h4>
              <div className="border border-brand-border rounded-xl overflow-hidden shadow-sm bg-white p-2">
                <img 
                  src="http://localhost:5000/static/regression_plot.png" 
                  alt="Model Regression Plot" 
                  className="w-full h-auto max-h-[220px] object-contain rounded-lg"
                />
              </div>
              <span className="text-[10px] text-brand-textSecondary mt-2">Predicted vs. Actual Total CO₂e on test set</span>
            </div>
          </div>
        </Card>
      )}

      {/* AI Explainability & Equivalents Section */}
      {results.ai_explanation && (
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* AI Decision Explainability Card */}
          <Card>
            <h3 className="text-xl font-bold text-brand-text mb-4">AI Driver Analysis (Feature Contribution)</h3>
            <p className="text-sm text-brand-textSecondary mb-6">
              Our machine learning model calculates your footprint by weighting your specific inputs based on relationships learned from the training dataset. Here is how each factor contributed to your score (in kg CO₂e):
            </p>
            <div className="space-y-4">
              {Object.entries(results.ai_explanation).map(([key, value]: [string, any]) => {
                if (key === "Baseline") return null;
                const numVal = Number(value);
                const isNegative = numVal < 0;
                
                return (
                  <div key={key} className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-sm font-medium">
                      <span className="text-brand-text">{key}</span>
                      <span className={`font-bold ${isNegative ? 'text-green-600' : 'text-amber-600'}`}>
                        {isNegative ? '' : '+'}{numVal.toFixed(1)} kg CO₂e
                      </span>
                    </div>
                    <div className="w-full bg-brand-border/40 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${isNegative ? 'bg-green-500' : 'bg-brand-primary'}`}
                        style={{ width: `${Math.min(100, (Math.abs(numVal) / 200) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
              <div className="flex justify-between items-center text-sm font-semibold border-t border-brand-border pt-4 mt-2">
                <span className="text-brand-text">Dataset Baseline Intercept</span>
                <span className="text-brand-textSecondary">{results.ai_explanation.Baseline} kg CO₂e</span>
              </div>
            </div>
          </Card>

          {/* Tangible Carbon Equivalents Card */}
          <Card className="flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-brand-text mb-4">Tangible Environmental Impact</h3>
              <p className="text-sm text-brand-textSecondary mb-6">
                Carbon emissions can feel abstract. To put your annual carbon footprint of <strong>{results.totalCarbonFootprint} tonnes</strong> into context, it is equivalent to:
              </p>
              {results.equivalents && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 bg-brand-bgAlt p-4 rounded-xl border border-brand-border/40">
                    <div className="text-3xl">🚗</div>
                    <div>
                      <div className="text-lg font-bold text-brand-text">{results.equivalents.km_driven.toLocaleString()} km</div>
                      <div className="text-xs text-brand-textSecondary">Driven in a typical passenger vehicle</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-brand-bgAlt p-4 rounded-xl border border-brand-border/40">
                    <div className="text-3xl">📱</div>
                    <div>
                      <div className="text-lg font-bold text-brand-text">{results.equivalents.phones_charged.toLocaleString()}</div>
                      <div className="text-xs text-brand-textSecondary">Smartphones charged to full capacity</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-brand-bgAlt p-4 rounded-xl border border-brand-border/40">
                    <div className="text-3xl">🌲</div>
                    <div>
                      <div className="text-lg font-bold text-brand-text">{results.equivalents.tree_offset} Trees</div>
                      <div className="text-xs text-brand-textSecondary">Required to absorb this carbon for 1 full year</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Recommendations & Action Plan Checklist Grid */}
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

        {/* Dynamic Action Checklist Generator */}
        <Card className="flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-brand-text mb-2">My Eco-Action Plan</h3>
            <p className="text-sm text-brand-textSecondary mb-6">
              Select or type actions you are willing to commit to. Copy them to your notebook or reminders before leaving.
            </p>

            <div className="space-y-3 mb-6">
              {customGoals.map((goal, idx) => (
                <div key={idx} className="flex justify-between items-center bg-brand-bgAlt px-4 py-3 rounded-xl border border-brand-border/40 group">
                  <span className="text-sm font-semibold text-brand-text">{goal}</span>
                  <button 
                    type="button" 
                    onClick={() => removeGoal(idx)}
                    className="text-brand-textSecondary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input 
                type="text"
                placeholder="Add custom goal (e.g. Turn off office lights)..."
                value={newGoalText}
                onChange={(e) => setNewGoalText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCustomGoal()}
                className="flex-1 px-4 py-2.5 rounded-xl border border-brand-border bg-brand-bg text-brand-text text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
              <Button onClick={addCustomGoal} variant="outline" className="px-3">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="border-t border-brand-border/60 pt-6 mt-6 flex justify-between items-center">
            <span className="text-xs text-brand-textSecondary">Stored in session local cache</span>
            <Button onClick={copyActionPlan} className="gap-2 bg-brand-primary hover:bg-brand-primary/95 text-white font-medium text-xs">
              <Clipboard className="w-4 h-4" /> Copy Action Checklist
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
