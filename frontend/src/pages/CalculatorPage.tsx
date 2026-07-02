import { useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useForm as useHookForm } from 'react-hook-form';
import apiClient from '../api/client';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';

const STEPS = ['Personal', 'Home', 'Transportation', 'Food', 'Lifestyle'];

const PRESETS: Record<string, any> = {
  champion: {
    name: "Eco Guardian",
    age: "25",
    homeType: "Apartment",
    peopleCount: 1,
    electricityBill: 30,
    acCount: 0,
    acUsageDaily: 0,
    primaryTransport: "Walk",
    weeklyDistance: 10,
    flightsYearly: 0,
    diet: "Vegan",
    chickenMealsWeekly: 0,
    redMeatMealsMonthly: 0,
    onlineShoppingMonthly: 1,
    newClothesMonthly: 0,
    plasticBottlesWeekly: 0,
    treesPlanted: 15,
  },
  average: {
    name: "Average Joe",
    age: "35",
    homeType: "Apartment",
    peopleCount: 3,
    electricityBill: 120,
    acCount: 1,
    acUsageDaily: 3,
    primaryTransport: "Bus",
    weeklyDistance: 60,
    flightsYearly: 1,
    diet: "Non-Vegetarian",
    chickenMealsWeekly: 3,
    redMeatMealsMonthly: 2,
    onlineShoppingMonthly: 4,
    newClothesMonthly: 1,
    plasticBottlesWeekly: 6,
    treesPlanted: 2,
  },
  heavy: {
    name: "VIP Jetsetter",
    age: "42",
    homeType: "Independent House",
    peopleCount: 4,
    electricityBill: 350,
    acCount: 4,
    acUsageDaily: 10,
    primaryTransport: "Car",
    weeklyDistance: 300,
    flightsYearly: 8,
    diet: "Non-Vegetarian",
    chickenMealsWeekly: 10,
    redMeatMealsMonthly: 12,
    onlineShoppingMonthly: 15,
    newClothesMonthly: 5,
    plasticBottlesWeekly: 25,
    treesPlanted: 0,
  }
};

export default function CalculatorPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [presetSelected, setPresetSelected] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const methods = useHookForm({
    defaultValues: {
      name: "",
      age: "",
      homeType: "Apartment",
      peopleCount: 2,
      electricityBill: 100,
      acCount: 1,
      acUsageDaily: 4,
      primaryTransport: "Car",
      weeklyDistance: 60,
      flightsYearly: 0,
      diet: "Non-Vegetarian",
      chickenMealsWeekly: 2,
      redMeatMealsMonthly: 2,
      onlineShoppingMonthly: 3,
      newClothesMonthly: 1,
      plasticBottlesWeekly: 5,
      treesPlanted: 0,
    }
  });

  const { register, handleSubmit, watch, setValue } = methods;

  // Watch values reactively for the interactive UI
  const peopleCount = Number(watch('peopleCount') ?? 2);
  const electricityBill = Number(watch('electricityBill') ?? 100);
  const acCount = Number(watch('acCount') ?? 1);
  const acUsageDaily = Number(watch('acUsageDaily') ?? 4);
  const weeklyDistance = Number(watch('weeklyDistance') ?? 60);
  const flightsYearly = Number(watch('flightsYearly') ?? 0);
  const chickenMealsWeekly = Number(watch('chickenMealsWeekly') ?? 2);
  const redMeatMealsMonthly = Number(watch('redMeatMealsMonthly') ?? 2);
  const onlineShoppingMonthly = Number(watch('onlineShoppingMonthly') ?? 3);
  const newClothesMonthly = Number(watch('newClothesMonthly') ?? 1);
  const plasticBottlesWeekly = Number(watch('plasticBottlesWeekly') ?? 5);
  const treesPlanted = Number(watch('treesPlanted') ?? 0);

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep(curr => curr + 1);
  };
  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(curr => curr - 1);
  };

  const applyPreset = (preset: string) => {
    setPresetSelected(preset);
    const values = PRESETS[preset];
    Object.entries(values).forEach(([key, val]) => {
      setValue(key as any, val);
    });
  };

  const onSubmit = async (data: any) => {
    if (currentStep !== STEPS.length - 1) {
      nextStep();
      return;
    }
    await submitForm(data);
  };

  const submitForm = async (data: any) => {
    setIsSubmitting(true);
    try {
      const formattedData = {
        personal: { name: data.name || "Anonymous", age: Number(data.age || 30) },
        home: { 
          homeType: data.homeType, 
          peopleCount: Number(data.peopleCount), 
          electricityBill: Number(data.electricityBill), 
          acCount: Number(data.acCount), 
          acUsageDaily: Number(data.acUsageDaily) 
        },
        transportation: { 
          primaryTransport: data.primaryTransport, 
          weeklyDistance: Number(data.weeklyDistance), 
          flightsYearly: Number(data.flightsYearly) 
        },
        food: { 
          diet: data.diet, 
          chickenMealsWeekly: Number(data.chickenMealsWeekly), 
          redMeatMealsMonthly: Number(data.redMeatMealsMonthly) 
        },
        lifestyle: { 
          onlineShoppingMonthly: Number(data.onlineShoppingMonthly), 
          newClothesMonthly: Number(data.newClothesMonthly), 
          plasticBottlesWeekly: Number(data.plasticBottlesWeekly),
          treesPlanted: Number(data.treesPlanted)
        }
      };

      const res = await apiClient.post(`/calculate`, formattedData);
      const recordId = res.data.data.record._id;
      const record = res.data.data.record;
      
      // Save last calc to localStorage for achievements
      localStorage.setItem("last_calc", JSON.stringify({
        score: record.results.carbonScore,
        primaryTransport: record.transportation.primaryTransport,
        diet: record.food.diet,
        plasticBottles: record.lifestyle.plasticBottlesWeekly,
        electricityBill: record.home.electricityBill,
        treesPlanted: record.lifestyle.treesPlanted,
      }));

      // Add to personal calculation history log
      const myCalcs = JSON.parse(localStorage.getItem("my_calcs") || "[]");
      if (!myCalcs.includes(recordId)) {
        localStorage.setItem("my_calcs", JSON.stringify([...myCalcs, recordId]));
      }
      
      navigate(`/dashboard/${recordId}`);
    } catch (error) {
      console.error("Calculation failed", error);
      setIsSubmitting(false);
    }
  };

  const handleFastSubmit = () => {
    const data = methods.getValues();
    submitForm(data);
  };

  // Helper to render an interactive slider + numeric input group
  const renderInteractiveSlider = (
    label: string,
    fieldName: any,
    value: number,
    min: number,
    max: number,
    step: number,
    description: string,
    unit: string = ""
  ) => {
    return (
      <div className="flex flex-col gap-2 mb-6 bg-brand-bgAlt p-5 rounded-2xl border border-brand-border/40 shadow-sm hover:border-brand-primary/30 transition-all duration-300">
        <div className="flex justify-between items-center">
          <label className="text-sm font-semibold text-brand-text">{label}</label>
          <div className="flex items-center gap-1 bg-brand-primary/10 border border-brand-primary/20 px-3 py-1 rounded-xl">
            <input 
              type="number" 
              value={isNaN(value) ? "" : value}
              min={min}
              max={max}
              step={step}
              onChange={(e) => {
                const val = e.target.value === "" ? 0 : Number(e.target.value);
                setValue(fieldName, Math.min(max, Math.max(min, val)));
              }}
              className="w-12 bg-transparent text-center font-bold text-brand-primary focus:outline-none focus:ring-0 text-sm p-0 border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            {unit && <span className="text-xs font-semibold text-brand-primary/70">{unit}</span>}
          </div>
        </div>
        <input 
          type="range" 
          min={min} 
          max={max} 
          step={step}
          {...register(fieldName)}
          className="w-full h-2 bg-brand-border rounded-lg appearance-none cursor-pointer accent-brand-primary transition-all focus:outline-none"
        />
        <div className="flex justify-between text-[11px] text-brand-textSecondary mt-0.5 font-medium">
          <span>{min}{unit}</span>
          <span className="text-brand-primary/90 font-semibold">{description}</span>
          <span>{max}{unit}+</span>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-brand-text mb-2 text-center">Carbon Footprint Calculator</h1>
        <p className="text-brand-textSecondary text-center">Estimate your exact annual emissions with our AI-powered model.</p>
      </div>

      {/* Progress Bar */}
      <div className="flex justify-between items-center mb-8 relative">
        <div className="absolute left-0 top-1/2 w-full h-1 bg-brand-border -z-10 -translate-y-1/2"></div>
        <div 
          className="absolute left-0 top-1/2 h-1 bg-brand-primary -z-10 -translate-y-1/2 transition-all duration-300"
          style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
        ></div>
        
        {STEPS.map((step, index) => (
          <div key={step} className="flex flex-col items-center bg-brand-bgAlt px-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${index <= currentStep ? 'bg-brand-primary border-brand-primary text-white' : 'bg-brand-surface border-brand-border text-brand-textSecondary'}`}>
              {index + 1}
            </div>
            <span className={`text-xs mt-2 font-medium ${index <= currentStep ? 'text-brand-primary' : 'text-brand-textSecondary'}`}>{step}</span>
          </div>
        ))}
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold mb-2">Lifestyle Presets (Quick Start)</h2>
                    <p className="text-xs text-brand-textSecondary mb-4">Select an archetype to instantly populate all questions, or proceed to details manually.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {Object.keys(PRESETS).map((key) => {
                        const isSelected = presetSelected === key;
                        const icons: Record<string, string> = { champion: "🌱", average: "🏡", heavy: "🚗" };
                        const titles: Record<string, string> = { champion: "Eco-Champion", average: "Average Joe", heavy: "High Consumer" };
                        const descs: Record<string, string> = { 
                          champion: "Bikes/Walks, Vegan, low energy, plants trees.", 
                          average: "Transit rider, mixed diet, normal shopping & utility.", 
                          heavy: "SUV driver, heavy flights, steak lover, high shopping." 
                        };
                        return (
                          <div 
                            key={key}
                            onClick={() => applyPreset(key)}
                            className={`cursor-pointer p-4 rounded-2xl border-2 transition-all text-center flex flex-col justify-between ${
                              isSelected 
                                ? 'border-brand-primary bg-brand-primary/5 shadow-sm' 
                                : 'border-brand-border/40 bg-brand-bgAlt hover:border-brand-primary/40 hover:bg-brand-surface'
                            }`}
                          >
                            <div className="text-3xl mb-2">{icons[key]}</div>
                            <div className="font-bold text-sm text-brand-text mb-1">{titles[key]}</div>
                            <p className="text-[10px] text-brand-textSecondary leading-normal">{descs[key]}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border-t border-brand-border/60 pt-6">
                    <h3 className="text-lg font-semibold text-brand-text mb-4">Personal Details (Optional)</h3>
                    <div className="space-y-4">
                      <Input label="Name" {...register('name')} placeholder="Your name" />
                      <Input label="Age" type="number" {...register('age')} placeholder="Your age" />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold mb-6">Home Environment</h2>
                  <div className="flex flex-col gap-1.5 mb-6">
                    <label className="text-sm font-semibold text-brand-text">Home Type</label>
                    <select {...register('homeType')} className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-brand-bg text-brand-text focus:ring-2 focus:ring-brand-primary">
                      <option value="Apartment">Apartment</option>
                      <option value="Independent House">Independent House</option>
                      <option value="Hostel">Hostel</option>
                      <option value="PG">PG</option>
                    </select>
                  </div>

                  {renderInteractiveSlider(
                    "Number of People in Household",
                    "peopleCount",
                    peopleCount,
                    1,
                    10,
                    1,
                    peopleCount === 1 ? "Living Single" : peopleCount <= 3 ? "Small Household" : peopleCount <= 5 ? "Medium Household" : "Large Household"
                  )}

                  {renderInteractiveSlider(
                    "Average Monthly Electricity Bill",
                    "electricityBill",
                    electricityBill,
                    0,
                    500,
                    5,
                    electricityBill < 50 ? "Low Usage" : electricityBill <= 150 ? "Moderate Usage" : electricityBill <= 300 ? "High Usage" : "Very High Usage",
                    "$"
                  )}

                  {renderInteractiveSlider(
                    "Number of Air Conditioners (ACs)",
                    "acCount",
                    acCount,
                    0,
                    8,
                    1,
                    acCount === 0 ? "No AC units" : acCount === 1 ? "1 AC unit" : `${acCount} AC units`
                  )}

                  {renderInteractiveSlider(
                    "Daily AC Usage",
                    "acUsageDaily",
                    acUsageDaily,
                    0,
                    24,
                    1,
                    acUsageDaily === 0 ? "No AC use" : acUsageDaily <= 3 ? "Light use" : acUsageDaily <= 8 ? "Moderate use" : "Heavy use",
                    "h"
                  )}
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold mb-6">Transportation</h2>
                  <div className="flex flex-col gap-1.5 mb-6">
                    <label className="text-sm font-semibold text-brand-text">Primary Mode of Transport</label>
                    <select {...register('primaryTransport')} className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-brand-bg text-brand-text focus:ring-2 focus:ring-brand-primary">
                      <option value="Car">Car</option>
                      <option value="Bike">Bike</option>
                      <option value="Bus">Bus</option>
                      <option value="Train">Train</option>
                      <option value="Metro">Metro</option>
                      <option value="Walk">Walk</option>
                      <option value="Cycle">Cycle</option>
                    </select>
                  </div>

                  {renderInteractiveSlider(
                    "Weekly Travel Distance",
                    "weeklyDistance",
                    weeklyDistance,
                    0,
                    1000,
                    10,
                    weeklyDistance < 20 ? "Rare travel" : weeklyDistance <= 100 ? "Short commute" : weeklyDistance <= 250 ? "Moderate commute" : weeklyDistance <= 500 ? "Long commute" : "Extreme travel",
                    "km"
                  )}

                  {renderInteractiveSlider(
                    "Number of Flights per Year (Round trips)",
                    "flightsYearly",
                    flightsYearly,
                    0,
                    20,
                    1,
                    flightsYearly === 0 ? "No flights" : flightsYearly <= 2 ? "Occasional flyer" : flightsYearly <= 5 ? "Frequent flyer" : "Very frequent flyer"
                  )}
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold mb-6">Food & Diet</h2>
                  <div className="flex flex-col gap-1.5 mb-6">
                    <label className="text-sm font-semibold text-brand-text">Diet Preference</label>
                    <select {...register('diet')} className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-brand-bg text-brand-text focus:ring-2 focus:ring-brand-primary">
                      <option value="Vegan">Vegan</option>
                      <option value="Vegetarian">Vegetarian</option>
                      <option value="Eggetarian">Eggetarian</option>
                      <option value="Non-Vegetarian">Non-Vegetarian</option>
                    </select>
                  </div>

                  {renderInteractiveSlider(
                    "Chicken/Poultry Meals per Week",
                    "chickenMealsWeekly",
                    chickenMealsWeekly,
                    0,
                    21,
                    1,
                    chickenMealsWeekly === 0 ? "No chicken meals" : chickenMealsWeekly <= 3 ? "Occasional poultry" : chickenMealsWeekly <= 7 ? "Regular poultry" : "Heavy poultry consumption"
                  )}

                  {renderInteractiveSlider(
                    "Red Meat Meals (Beef, Lamb, Pork) per Month",
                    "redMeatMealsMonthly",
                    redMeatMealsMonthly,
                    0,
                    30,
                    1,
                    redMeatMealsMonthly === 0 ? "No red meat meals" : redMeatMealsMonthly <= 4 ? "Occasional red meat" : redMeatMealsMonthly <= 10 ? "Regular red meat" : "Heavy red meat consumption"
                  )}
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold mb-6">Lifestyle</h2>
                  
                  {renderInteractiveSlider(
                    "Online Shopping frequency",
                    "onlineShoppingMonthly",
                    onlineShoppingMonthly,
                    0,
                    30,
                    1,
                    onlineShoppingMonthly <= 1 ? "Rarely shop" : onlineShoppingMonthly <= 5 ? "Occasional shopper" : onlineShoppingMonthly <= 12 ? "Frequent shopper" : "Heavy shopper",
                    " orders"
                  )}

                  {renderInteractiveSlider(
                    "New Clothes bought per Month",
                    "newClothesMonthly",
                    newClothesMonthly,
                    0,
                    15,
                    1,
                    newClothesMonthly <= 1 ? "Rarely buy clothes" : newClothesMonthly <= 4 ? "Occasional buyer" : "Frequent buyer",
                    " items"
                  )}

                  {renderInteractiveSlider(
                    "Single-use Plastic Water Bottles per Week",
                    "plasticBottlesWeekly",
                    plasticBottlesWeekly,
                    0,
                    50,
                    1,
                    plasticBottlesWeekly === 0 ? "Never use plastic" : plasticBottlesWeekly <= 5 ? "Occasional use" : plasticBottlesWeekly <= 15 ? "Regular use" : "Heavy bottle use",
                    " bottles"
                  )}

                  {renderInteractiveSlider(
                    "Trees Planted per Year",
                    "treesPlanted",
                    treesPlanted,
                    0,
                    50,
                    1,
                    treesPlanted === 0 ? "No trees planted" : treesPlanted <= 5 ? "Reforestation Supporter" : treesPlanted <= 15 ? "Active Planter" : "Forest Maker",
                    " trees"
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between mt-8 pt-6 border-t border-brand-border">
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 0 || isSubmitting}>
                Back
              </Button>
              {currentStep === 0 && presetSelected && (
                <Button 
                  type="button" 
                  onClick={handleFastSubmit} 
                  variant="outline" 
                  isLoading={isSubmitting}
                  className="border-brand-primary text-brand-primary hover:bg-brand-primary/5 shrink-0"
                >
                  🚀 Fast Calculate (Skip Form)
                </Button>
              )}
            </div>
            <Button type="submit" isLoading={isSubmitting}>
              {currentStep === STEPS.length - 1 ? 'Calculate My Footprint' : 'Next Step'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
