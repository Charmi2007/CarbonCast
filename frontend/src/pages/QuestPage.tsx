import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, CheckCircle, Award, Compass, RotateCcw, Sparkles } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

interface Quest {
  id: string;
  title: string;
  xp: number;
  description: string;
  category: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  xp: number;
  badge: string;
  condition: (calc: any) => boolean;
}

// Class-specific quests to respect differing lifestyles and priorities
const getQuestsForUser = (userClass: 'heavy' | 'average' | 'champion', lastCalc: any): Quest[] => {
  const quests: Quest[] = [];

  if (userClass === 'heavy') {
    // Only show AC Quest if they actually own an AC unit
    if (!lastCalc || Number(lastCalc.acCount) > 0) {
      quests.push({ id: 'h_temp', title: 'The Smart Temp', xp: 15, description: 'Set your air conditioner or thermostat to 24°C (75°F) for just one hour today.', category: 'Energy' });
    } else {
      quests.push({ id: 'h_lights', title: 'Lights Out', xp: 10, description: 'Turn off all lights in rooms you are not currently occupying for the evening.', category: 'Energy' });
    }
    
    quests.push({ id: 'h_digital', title: 'Digital Purge', xp: 15, description: 'Delete 50 promotional or spam emails to reduce remote data center hosting power load.', category: 'Digital' });
    quests.push({ id: 'h_standby', title: 'Power Down Standby', xp: 15, description: 'Unplug your home entertainment center or large chargers overnight rather than leaving them on standby.', category: 'Energy' });
    quests.push({ id: 'h_local', title: 'Micro-Delivery', xp: 10, description: 'Order delivery or takeout from a local merchant under 5km away to reduce delivery courier travel.', category: 'Consumption' });
    
    // Only show flight offset quest if they actually fly
    if (!lastCalc || Number(lastCalc.flightsYearly) > 0) {
      quests.push({ id: 'h_trees', title: 'Virtual Reforestation', xp: 20, description: 'Run a what-if simulation planting virtual trees to calculate an offset for your flight footprint.', category: 'Simulation' });
    } else {
      quests.push({ id: 'h_sim_easy', title: 'Climate Experiment', xp: 15, description: 'Tweak one lifestyle variable in the simulator to see its impact on your footprint.', category: 'Simulation' });
    }
  } 
  else if (userClass === 'average') {
    // Only show meat swap quest if they eat meat
    if (!lastCalc || lastCalc.diet === 'Non-Vegetarian') {
      quests.push({ id: 'a_meat', title: 'The Poultry Pivot', xp: 15, description: 'Swap red meat (beef, lamb, pork) for chicken or fish for just one meal today (no vegan transition required!).', category: 'Food' });
    } else {
      quests.push({ id: 'a_snack', title: 'Local Fruit Snack', xp: 10, description: 'Eat a locally-sourced fruit or vegetable snack instead of imported packaged food today.', category: 'Food' });
    }

    // Only show car commute errand quest if their transport is a car
    if (!lastCalc || lastCalc.primaryTransport === 'Car') {
      quests.push({ id: 'a_errand', title: 'Errand Bundling', xp: 15, description: 'Consolidate multiple driving trips or grocery runs into a single, efficient loop route.', category: 'Transport' });
    } else {
      quests.push({ id: 'a_transit', title: 'Station Walking', xp: 10, description: 'Walk or cycle to your transit stop/station instead of getting dropped off.', category: 'Transport' });
    }

    quests.push({ id: 'a_screen', title: 'Screen-Free Power hour', xp: 15, description: 'Power down all electric screens (TV, laptop, phone) 30 minutes before going to sleep.', category: 'Energy' });
    quests.push({ id: 'a_tote', title: 'Tote Bag Commute', xp: 10, description: 'Bring a reusable canvas tote bag for your shopping run instead of taking plastic bags.', category: 'Consumption' });
    quests.push({ id: 'a_simulate', title: 'Simulated Change', xp: 15, description: 'Simulate a 10% reduction in weekly driving distance in the what-if dashboard.', category: 'General' });
  } 
  else {
    quests.push({ id: 'c_plastic', title: 'Zero-Waste Gladiator', xp: 20, description: 'Avoid buying or using any single-use plastic packaging or plastic bottles today.', category: 'Consumption' });
    
    // Only show vegan challenge if they are not already vegan
    if (!lastCalc || lastCalc.diet !== 'Vegan') {
      quests.push({ id: 'c_vegan', title: '100% Plant Power', xp: 25, description: 'Eat entirely plant-based (vegan) meals for the whole day.', category: 'Food' });
    } else {
      quests.push({ id: 'c_bulk', title: 'Bulk Buy Advocate', xp: 20, description: 'Purchase a household item in bulk or with zero-packaging container refilling.', category: 'Consumption' });
    }

    quests.push({ id: 'c_transit', title: 'Zero-Emission Commute', xp: 25, description: 'Walk, cycle, or use public electric transport for all of your travel today.', category: 'Transport' });
    quests.push({ id: 'c_compost', title: 'Organic Sorting', xp: 15, description: 'Sort, separate, and compost your organic kitchen waste today.', category: 'Waste' });
    quests.push({ id: 'c_sharing', title: 'Green Advocate', xp: 15, description: 'Share a zero-waste tip or water conservation suggestion with a friend.', category: 'Social' });
  }

  return quests;
};

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'green_citizen',
    title: 'Planet Protector',
    description: 'Achieve an ML Carbon Score of 80 or above.',
    xp: 100,
    badge: '🌍',
    condition: (calc) => calc && Number(calc.score) >= 80,
  },
  {
    id: 'green_transport',
    title: 'Clean Commuter',
    description: 'Use Walk, Bike, Train, Bus, Metro, or Cycle as primary transport.',
    xp: 75,
    badge: '🚲',
    condition: (calc) => calc && ['Walk', 'Bike', 'Train', 'Bus', 'Metro', 'Cycle'].includes(calc.primaryTransport),
  },
  {
    id: 'green_diet',
    title: 'Plant Pioneer',
    description: 'Commit to a Vegan, Vegetarian, or Eggetarian diet preference.',
    xp: 75,
    badge: '🥗',
    condition: (calc) => calc && ['Vegan', 'Vegetarian', 'Eggetarian'].includes(calc.diet),
  },
  {
    id: 'zero_plastic',
    title: 'Plastic-Free Hero',
    description: 'Use 0 single-use plastic water bottles in your lifestyle report.',
    xp: 50,
    badge: '🥤',
    condition: (calc) => calc && Number(calc.plasticBottles) === 0,
  },
  {
    id: 'power_saver',
    title: 'Energy Guardian',
    description: 'Maintain a monthly electricity bill under $50.',
    xp: 50,
    badge: '⚡',
    condition: (calc) => calc && Number(calc.electricityBill) <= 50,
  },
  {
    id: 'tree_planter',
    title: 'Forest Weaver',
    description: 'Plant 10 or more trees in your lifestyle report.',
    xp: 100,
    badge: '🌳',
    condition: (calc) => calc && Number(calc.treesPlanted) >= 10,
  },
];

export default function QuestPage() {
  const [xp, setXp] = useState<number>(0);
  const [userClass, setUserClass] = useState<'heavy' | 'average' | 'champion'>('average');
  const [completedQuests, setCompletedQuests] = useState<string[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [lastCalc, setLastCalc] = useState<any>(null);
  const [showLevelUpAlert, setShowLevelUpAlert] = useState(false);

  // Load state and auto-assign Eco-Class based on last calculation results
  useEffect(() => {
    // 1. Load XP
    const storedXp = Number(localStorage.getItem('eco_xp') || 0);
    setXp(storedXp);

    // 2. Load daily quests
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem('eco_quests_date');
    if (storedDate === today) {
      const storedQuests = JSON.parse(localStorage.getItem('eco_quests_completed') || '[]');
      setCompletedQuests(storedQuests);
    } else {
      localStorage.setItem('eco_quests_date', today);
      localStorage.setItem('eco_quests_completed', '[]');
      setCompletedQuests([]);
    }

    // 3. Load last calculation & assign class
    const storedCalcRaw = localStorage.getItem('last_calc');
    let assignedClass: 'heavy' | 'average' | 'champion' = 'average';
    
    if (storedCalcRaw) {
      const calcObj = JSON.parse(storedCalcRaw);
      setLastCalc(calcObj);
      
      const score = Number(calcObj.score);
      if (score < 45) {
        assignedClass = 'heavy';
      } else if (score > 70) {
        assignedClass = 'champion';
      } else {
        assignedClass = 'average';
      }

      // Check achievements
      const unlockedList: string[] = [];
      ACHIEVEMENTS.forEach(ach => {
        if (ach.condition(calcObj)) {
          unlockedList.push(ach.id);
        }
      });
      setUnlockedAchievements(unlockedList);
    }

    // Load manual class override if present, else assign calculated
    const savedClass = localStorage.getItem('eco_class') as 'heavy' | 'average' | 'champion';
    setUserClass(savedClass || assignedClass);
  }, []);

  const changeClass = (newClass: 'heavy' | 'average' | 'champion') => {
    setUserClass(newClass);
    localStorage.setItem('eco_class', newClass);
    // Reset completed quests for the new class to avoid double claims
    setCompletedQuests([]);
    localStorage.setItem('eco_quests_completed', '[]');
  };

  // Compute Level details
  const getLevelInfo = (currentXp: number) => {
    if (currentXp < 100) return { level: 1, title: 'Seedling', min: 0, max: 100 };
    if (currentXp < 250) return { level: 2, title: 'Sprout', min: 100, max: 250 };
    if (currentXp < 500) return { level: 3, title: 'Sapling', min: 250, max: 500 };
    if (currentXp < 1000) return { level: 4, title: 'Canopy Guardian', min: 500, max: 1000 };
    if (currentXp < 2000) return { level: 5, title: 'Old-Growth Oak', min: 1000, max: 2000 };
    return { level: 6, title: 'Carbon Neutral Legend', min: 2000, max: 5000 };
  };

  const levelInfo = getLevelInfo(xp);
  const percentProgress = Math.min(100, ((xp - levelInfo.min) / (levelInfo.max - levelInfo.min)) * 100);

  const handleToggleQuest = (questId: string, questXp: number) => {
    let newCompleted: string[];
    let xpDiff = 0;

    if (completedQuests.includes(questId)) {
      newCompleted = completedQuests.filter(id => id !== questId);
      xpDiff = -questXp;
    } else {
      newCompleted = [...completedQuests, questId];
      xpDiff = questXp;
    }

    const newXp = Math.max(0, xp + xpDiff);
    const prevLevel = getLevelInfo(xp).level;
    const newLevel = getLevelInfo(newXp).level;
    
    if (newLevel > prevLevel) {
      setShowLevelUpAlert(true);
      setTimeout(() => setShowLevelUpAlert(false), 5000);
    }

    setCompletedQuests(newCompleted);
    setXp(newXp);
    localStorage.setItem('eco_xp', String(newXp));
    localStorage.setItem('eco_quests_completed', JSON.stringify(newCompleted));
  };

  const handleResetQuests = () => {
    setCompletedQuests([]);
    localStorage.setItem('eco_quests_completed', '[]');
  };

  const classDisplayDetails = {
    heavy: { name: "VIP Jet-Setter", icon: "🚗", desc: "For high-mileage, high-shopping individuals. Low-friction tasks suited for busy, luxury lifestyles." },
    average: { name: "Pragmatic Citizen", icon: "🏡", desc: "For everyday commuters. Pragmatic sustainability actions that don't disrupt your daily routines." },
    champion: { name: "Green Guardian", icon: "🌱", desc: "For dedicated eco-citizens. Advanced sustainability metrics and low-impact lifestyle goals." }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      {/* Level-Up Toast */}
      <AnimatePresence>
        {showLevelUpAlert && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-amber-500 via-brand-primary to-brand-secondary text-white font-poppins px-6 py-4 rounded-2xl shadow-modern flex items-center gap-3 border border-white/20"
          >
            <span className="text-3xl">🎉</span>
            <div>
              <div className="font-bold text-lg">Level Up!</div>
              <div className="text-sm text-white/90">You are now a <strong>Level {levelInfo.level + 1} {getLevelInfo(xp + 20).title}</strong>!</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-brand-text flex items-center gap-2">
            <Compass className="w-8 h-8 text-brand-primary" /> Eco-Quest Log
          </h1>
          <p className="text-brand-textSecondary mt-1">Smarter, personalized daily challenges suited to your specific lifestyle class.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleResetQuests} className="gap-2">
          <RotateCcw className="w-4 h-4" /> Reset Daily Checks
        </Button>
      </div>

      {/* Class Selector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {(Object.keys(classDisplayDetails) as Array<'heavy' | 'average' | 'champion'>).map((key) => {
          const isSelected = userClass === key;
          const details = classDisplayDetails[key];
          return (
            <div
              key={key}
              onClick={() => changeClass(key)}
              className={`cursor-pointer p-5 rounded-2xl border-2 transition-all flex flex-col justify-between relative overflow-hidden ${
                isSelected 
                  ? 'border-brand-primary bg-brand-primary/5 shadow-sm' 
                  : 'border-brand-border/40 bg-brand-surface hover:border-brand-primary/30 hover:bg-brand-bgAlt'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 text-brand-primary">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{details.icon}</span>
                <span className="font-bold text-brand-text text-sm">{details.name}</span>
              </div>
              <p className="text-[11px] text-brand-textSecondary leading-normal mt-1">{details.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Card: Progress details */}
        <div className="md:col-span-1 space-y-6">
          <Card className="flex flex-col items-center text-center py-10 bg-gradient-to-b from-brand-surface to-brand-bgAlt border-brand-border/40 shadow-modern relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-full blur-2xl"></div>
            
            <div className="w-24 h-24 bg-brand-primary/10 border-4 border-brand-primary/20 rounded-full flex items-center justify-center mb-6 relative">
              <Shield className="w-12 h-12 text-brand-primary" />
              <div className="absolute -bottom-1 -right-1 bg-brand-primary text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center border-2 border-brand-surface">
                {levelInfo.level}
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-brand-text mb-1">{levelInfo.title}</h2>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-primary mb-6">Level {levelInfo.level} {classDisplayDetails[userClass].name}</p>
            
            <div className="w-full px-6">
              <div className="flex justify-between text-xs font-semibold text-brand-textSecondary mb-2">
                <span>{xp} XP</span>
                <span>{levelInfo.max} XP</span>
              </div>
              <div className="w-full bg-brand-border/40 h-3 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary transition-all duration-500 ease-out"
                  style={{ width: `${percentProgress}%` }}
                ></div>
              </div>
              <span className="text-[10px] text-brand-textSecondary mt-2 block">
                {levelInfo.max - xp} XP to Level {levelInfo.level + 1}
              </span>
            </div>
          </Card>

          <Card className="p-6 bg-brand-primary/5 border-brand-primary/10">
            <h4 className="font-semibold text-brand-text mb-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-brand-primary" /> Class-Based Quests
            </h4>
            <p className="text-xs text-brand-textSecondary leading-relaxed">
              Your class was auto-assigned based on your ML footprint score, but you can manually toggle classes above. We suggest tasks that are genuinely achievable for your current profile.
            </p>
          </Card>
        </div>

        {/* Right side: Quest list */}
        <div className="md:col-span-2 space-y-8">
          <Card>
            <h3 className="text-xl font-bold text-brand-text mb-2">
              Daily Checks: {classDisplayDetails[userClass].name}
            </h3>
            <p className="text-xs text-brand-textSecondary mb-6 border-b border-brand-border pb-3">
              Check off daily habits you managed today to claim XP:
            </p>
            <div className="space-y-4">
              {getQuestsForUser(userClass, lastCalc).map((quest) => {
                const isCompleted = completedQuests.includes(quest.id);
                return (
                  <div 
                    key={quest.id} 
                    onClick={() => handleToggleQuest(quest.id, quest.xp)}
                    className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                      isCompleted 
                        ? 'bg-brand-primary/5 border-brand-primary/30 shadow-sm' 
                        : 'bg-brand-surface hover:bg-brand-bgAlt border-brand-border/40'
                    }`}
                  >
                    <div className="mt-0.5">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isCompleted ? 'bg-brand-primary border-brand-primary text-white' : 'border-brand-border'
                      }`}>
                        {isCompleted && <CheckCircle className="w-4 h-4" />}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className={`font-semibold text-sm ${isCompleted ? 'text-brand-text line-through opacity-70' : 'text-brand-text'}`}>
                          {quest.title}
                        </span>
                        <span className="text-xs font-bold bg-brand-primary/10 text-brand-primary px-2.5 py-0.5 rounded-full">
                          +{quest.xp} XP
                        </span>
                      </div>
                      <p className="text-xs text-brand-textSecondary">{quest.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <h3 className="text-xl font-bold text-brand-text mb-2">Unlocked Trophies</h3>
            <p className="text-xs text-brand-textSecondary mb-6 border-b border-brand-border pb-3"> Trophies are evaluated automatically based on your latest footprint prediction:</p>
            
            {lastCalc ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {ACHIEVEMENTS.map((ach) => {
                  const isUnlocked = unlockedAchievements.includes(ach.id);
                  return (
                    <div 
                      key={ach.id}
                      className={`flex items-center gap-3 p-4 rounded-xl border ${
                        isUnlocked 
                          ? 'bg-amber-500/5 border-amber-500/20 text-brand-text' 
                          : 'bg-brand-bgAlt border-brand-border/30 opacity-60'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-brand-surface border ${
                        isUnlocked ? 'border-amber-500/30 shadow-sm' : 'border-brand-border/50'
                      }`}>
                        {ach.badge}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 justify-between">
                          <h4 className="font-semibold text-xs text-brand-text truncate">{ach.title}</h4>
                          <span className="text-[9px] font-bold text-amber-600 shrink-0">+{ach.xp} XP</span>
                        </div>
                        <p className="text-[10px] text-brand-textSecondary leading-normal line-clamp-2 mt-0.5">{ach.description}</p>
                        {isUnlocked ? (
                          <span className="text-[9px] font-semibold text-green-600 mt-1 block">✓ Unlocked</span>
                        ) : (
                          <span className="text-[9px] text-brand-textSecondary mt-1 block">🔒 Locked</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-brand-textSecondary text-xs">
                No recent predictions found. Complete a carbon calculation to unlock trophies!
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
