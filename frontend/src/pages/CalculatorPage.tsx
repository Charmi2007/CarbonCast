import { useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useForm as useHookForm } from 'react-hook-form';
import apiClient from '../api/client';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';

const STEPS = ['Personal', 'Home Energy', 'Green Commute', 'Sustainable Diet', 'Lifestyle Wins'];

const PRESETS: Record<string, any> = {
  champion: {
    name: "Green Guardian",
    age: "38",
    homeType: "Apartment",
    peopleCount: 2,
    cleanEnergyPct: 100,
    acHoursAvoided: 24,
    greenTransitKm: 250,
    fossilTransitKm: 0,
    flightsAvoided: 5,
    plantBasedSwaps: 21,
    redMeatAvoided: 15,
    ecoShoppingWins: 15,
    fastFashionAvoided: 5,
    plasticBottlesAvoided: 30,
    treesPlanted: 30,
  },
  average: {
    name: "Conscious Actioner",
    age: "42",
    homeType: "Apartment",
    peopleCount: 3,
    cleanEnergyPct: 50,
    acHoursAvoided: 16,
    greenTransitKm: 80,
    fossilTransitKm: 60,
    flightsAvoided: 2,
    plantBasedSwaps: 10,
    redMeatAvoided: 8,
    ecoShoppingWins: 5,
    fastFashionAvoided: 3,
    plasticBottlesAvoided: 15,
    treesPlanted: 5,
  },
  heavy: {
    name: "Sustainability Beginner",
    age: "47",
    homeType: "Independent House",
    peopleCount: 4,
    cleanEnergyPct: 10,
    acHoursAvoided: 4,
    greenTransitKm: 20,
    fossilTransitKm: 200,
    flightsAvoided: 0,
    plantBasedSwaps: 2,
    redMeatAvoided: 1,
    ecoShoppingWins: 1,
    fastFashionAvoided: 1,
    plasticBottlesAvoided: 5,
    treesPlanted: 1,
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
      cleanEnergyPct: 30,
      acHoursAvoided: 12,
      greenTransitKm: 50,
      fossilTransitKm: 80,
      flightsAvoided: 1,
      plantBasedSwaps: 7,
      redMeatAvoided: 4,
      ecoShoppingWins: 3,
      fastFashionAvoided: 2,
      plasticBottlesAvoided: 10,
      treesPlanted: 0,
    }
  });

  const { register, handleSubmit, watch, setValue } = methods;

  // Watch values reactively for the interactive UI
  const cleanEnergyPct = Number(watch('cleanEnergyPct') ?? 30);
  const acHoursAvoided = Number(watch('acHoursAvoided') ?? 12);
  const greenTransitKm = Number(watch('greenTransitKm') ?? 50);
  const fossilTransitKm = Number(watch('fossilTransitKm') ?? 80);
  const flightsAvoided = Number(watch('flightsAvoided') ?? 1);
  const plantBasedSwaps = Number(watch('plantBasedSwaps') ?? 7);
  const redMeatAvoided = Number(watch('redMeatAvoided') ?? 4);
  const ecoShoppingWins = Number(watch('ecoShoppingWins') ?? 3);
  const fastFashionAvoided = Number(watch('fastFashionAvoided') ?? 2);
  const plasticBottlesAvoided = Number(watch('plasticBottlesAvoided') ?? 10);
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
      // Map positive/avoided metrics back to values needed by the backend emissions predictor
      const cleanEnergy = Number(data.cleanEnergyPct || 30);
      const acAvoided = Number(data.acHoursAvoided || 12);
      const greenKm = Number(data.greenTransitKm || 50);
      const fossilKm = Number(data.fossilTransitKm || 80);
      const flightsSaved = Number(data.flightsAvoided || 1);
      const veggieSwaps = Number(data.plantBasedSwaps || 7);
      const redMeatAvoidedCount = Number(data.redMeatAvoided || 4);
      const greenPurchases = Number(data.ecoShoppingWins || 3);
      const clothesSaved = Number(data.fastFashionAvoided || 2);
      const plasticAvoided = Number(data.plasticBottlesAvoided || 10);
      const trees = Number(data.treesPlanted || 0);

      // 1. Home calculations: clean energy reduces standard baseline bill
      const baselineBill = 220; // Avg bill for 30-50 household
      const electricityBill = Math.round(baselineBill * (1 - cleanEnergy / 100));
      const acUsageDaily = Math.max(0, 10 - acAvoided);
      const acCount = acUsageDaily > 0 ? 2 : 0;

      // 2. Transportation calculations: fossil travel distance
      const weeklyDistance = fossilKm;
      let primaryTransport = "Car";
      if (fossilKm === 0) {
        primaryTransport = greenKm > 150 ? "Metro" : greenKm > 0 ? "Walk" : "Walk";
      }
      const flightsYearly = Math.max(0, 4 - flightsSaved);

      // 3. Diet calculations: meat meal replacements
      let diet = "Non-Vegetarian";
      if (veggieSwaps >= 21) diet = "Vegan";
      else if (veggieSwaps >= 14) diet = "Vegetarian";
      
      const chickenMealsWeekly = Math.max(0, 14 - veggieSwaps);
      const redMeatMealsMonthly = Math.max(0, 15 - redMeatAvoidedCount);

      // 4. Shopping calculations
      const onlineShoppingMonthly = Math.max(0, 10 - greenPurchases);
      const newClothesMonthly = Math.max(0, 5 - clothesSaved);
      const plasticBottlesWeekly = Math.max(0, 25 - plasticAvoided);

      const formattedPayload = {
        personal: { name: data.name || "Eco Citizen", age: Number(data.age || 40) },
        home: { 
          homeType: data.homeType, 
          peopleCount: Number(data.peopleCount), 
          electricityBill: electricityBill, 
          acCount: acCount, 
          acUsageDaily: acUsageDaily 
        },
        transportation: { 
          primaryTransport: primaryTransport, 
          weeklyDistance: weeklyDistance, 
          flightsYearly: flightsYearly 
        },
        food: { 
          diet: diet, 
          chickenMealsWeekly: chickenMealsWeekly, 
          redMeatMealsMonthly: redMeatMealsMonthly 
        },
        lifestyle: { 
          onlineShoppingMonthly: onlineShoppingMonthly, 
          newClothesMonthly: newClothesMonthly, 
          plasticBottlesWeekly: plasticBottlesWeekly,
          treesPlanted: trees
        }
      };

      const res = await apiClient.post(`/calculate`, formattedPayload);
      const recordId = res.data.data.record._id;
      const record = res.data.data.record;
      
      // Save last calc to localStorage for achievements/dashboard fallback
      localStorage.setItem("last_calc", JSON.stringify({
        score: record.results.carbonScore,
        primaryTransport: record.transportation.primaryTransport,
        diet: record.food.diet,
        plasticBottles: record.lifestyle.plasticBottlesWeekly,
        electricityBill: record.home.electricityBill,
        treesPlanted: record.lifestyle.treesPlanted,
      }));

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
        <h1 className="text-3xl font-bold text-brand-text mb-2 text-center">Sustainability Impact Scorecard</h1>
        <p className="text-brand-textSecondary text-center">Record your green habits and carbon offsets to calculate your sustainability performance.</p>
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
                    <h2 className="text-2xl font-semibold mb-2">Select Your Sustainability Level (Quick Start)</h2>
                    <p className="text-xs text-brand-textSecondary mb-4">Choose a preset matching your general lifestyle or manually progress to configure each detail.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {Object.keys(PRESETS).map((key) => {
                        const isSelected = presetSelected === key;
                        const icons: Record<string, string> = { champion: "🌱", average: "🏡", heavy: "⚡" };
                        const titles: Record<string, string> = { champion: "Carbon Neutralist", average: "Eco Improver", heavy: "Green Beginner" };
                        const descs: Record<string, string> = { 
                          champion: "High renewable energy, maximum green commutes, heavy vegan swaps.", 
                          average: "Partial clean energy, mixed transit swaps, regular plant-based replacements.", 
                          heavy: "Just getting started with sustainability, lower offsets, high car usage." 
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
                    <h3 className="text-lg font-semibold text-brand-text mb-4">Profile Details</h3>
                    <div className="space-y-4">
                      <Input label="Name" {...register('name')} placeholder="Your name" />
                      <Input label="Age" type="number" {...register('age')} placeholder="e.g. 40" />
                      <p className="text-[11px] text-brand-textSecondary">CarbonCast is optimized to support sustainability leaders, primarily focusing on ages 30 - 50.</p>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold mb-6">Home Energy Efficiency</h2>
                  <div className="flex flex-col gap-1.5 mb-6">
                    <label className="text-sm font-semibold text-brand-text">Home Configuration</label>
                    <select {...register('homeType')} className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-brand-bg text-brand-text focus:ring-2 focus:ring-brand-primary">
                      <option value="Apartment">Apartment</option>
                      <option value="Independent House">Detached Family House</option>
                      <option value="Hostel">Shared Space</option>
                      <option value="PG">Townhouse</option>
                    </select>
                  </div>

                  {renderInteractiveSlider(
                    "Household Occupancy",
                    "peopleCount",
                    watch('peopleCount') ?? 2,
                    1,
                    10,
                    1,
                    "Total family members sharing home energy"
                  )}

                  {renderInteractiveSlider(
                    "Clean Energy Source Ratio",
                    "cleanEnergyPct",
                    cleanEnergyPct,
                    0,
                    100,
                    5,
                    cleanEnergyPct === 100 ? "100% Clean/Solar powered" : cleanEnergyPct >= 50 ? "Mostly renewable power" : cleanEnergyPct >= 20 ? "Partial solar offset" : "Standard power grid",
                    "%"
                  )}

                  {renderInteractiveSlider(
                    "Heating/Cooling Hours Saved Daily",
                    "acHoursAvoided",
                    acHoursAvoided,
                    0,
                    24,
                    1,
                    acHoursAvoided >= 20 ? "Passive heating/cooling only" : acHoursAvoided >= 12 ? "Smart thermostat & high efficiency" : acHoursAvoided >= 6 ? "Moderate conservation efforts" : "Frequent climate control usage",
                    "h"
                  )}
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold mb-6">Transportation Swaps</h2>

                  {renderInteractiveSlider(
                    "Weekly Green Commutes (Walk, Cycle, Transit, EV)",
                    "greenTransitKm",
                    greenTransitKm,
                    0,
                    1000,
                    10,
                    greenTransitKm > 200 ? "Zero-emissions commute leader" : greenTransitKm >= 80 ? "Frequent eco transit choice" : greenTransitKm >= 20 ? "Occasional green travel" : "Minimal sustainable transit",
                    "km"
                  )}

                  {renderInteractiveSlider(
                    "Weekly Fossil Fuel Driving Distance",
                    "fossilTransitKm",
                    fossilTransitKm,
                    0,
                    1000,
                    10,
                    fossilTransitKm === 0 ? "No fossil fuel travel!" : fossilTransitKm <= 100 ? "Low gas usage" : fossilTransitKm <= 300 ? "Moderate gas usage" : "High gas travel footprint",
                    "km"
                  )}

                  {renderInteractiveSlider(
                    "Flight Trips Replaced / Avoided per Year",
                    "flightsAvoided",
                    flightsAvoided,
                    0,
                    5,
                    1,
                    flightsAvoided === 5 ? "Fully offset flights / Virtual work only" : flightsAvoided >= 3 ? "Replaced long trips with high-speed rail" : flightsAvoided >= 1 ? "Reduced non-essential air travel" : "Standard flight usage"
                  )}
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold mb-6">Sustainable Diet Swaps</h2>

                  {renderInteractiveSlider(
                    "Plant-Based Swaps (Meat Alternatives Chosen) per Week",
                    "plantBasedSwaps",
                    plantBasedSwaps,
                    0,
                    21,
                    1,
                    plantBasedSwaps >= 21 ? "Fully Plant-Based Diet (Vegan)" : plantBasedSwaps >= 14 ? "Vegetarian focus" : plantBasedSwaps >= 7 ? "Flexitarian lifestyle" : "Low plant swaps"
                  )}

                  {renderInteractiveSlider(
                    "Red Meat Avoidance (Meals Consciously Replaced) per Month",
                    "redMeatAvoided",
                    redMeatAvoided,
                    0,
                    15,
                    1,
                    redMeatAvoided >= 15 ? "Complete red meat avoidance" : redMeatAvoided >= 8 ? "Active beef/lamb reduction" : redMeatAvoided >= 4 ? "Occasional meat replacements" : "Minimal red meat restrictions"
                  )}
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold mb-6">Conscious Lifestyle Wins</h2>
                  
                  {renderInteractiveSlider(
                    "Eco-Conscious / Local Shopping Choices per Month",
                    "ecoShoppingWins",
                    ecoShoppingWins,
                    0,
                    15,
                    1,
                    ecoShoppingWins >= 12 ? "Circular economy advocate" : ecoShoppingWins >= 6 ? "Prefers local/low package shopping" : ecoShoppingWins >= 2 ? "Occasional green buying" : "Standard commercial packaging"
                  )}

                  {renderInteractiveSlider(
                    "Wardrobe Items Avoided / Saved from Fast Fashion per Month",
                    "fastFashionAvoided",
                    fastFashionAvoided,
                    0,
                    5,
                    1,
                    fastFashionAvoided >= 5 ? "Slow-fashion minimalist" : fastFashionAvoided >= 3 ? "Sustainable closet cultivator" : fastFashionAvoided >= 1 ? "Avoided impulse clothes buying" : "Standard clothes shopper"
                  )}

                  {renderInteractiveSlider(
                    "Single-Use Plastic Bottles Avoided per Week",
                    "plasticBottlesAvoided",
                    plasticBottlesAvoided,
                    0,
                    30,
                    1,
                    plasticBottlesAvoided >= 25 ? "Zero single-use plastic bottles!" : plasticBottlesAvoided >= 15 ? "Reusable canteen habits" : plasticBottlesAvoided >= 5 ? "Reduced plastic trash" : "Relies on disposable containers"
                  )}

                  {renderInteractiveSlider(
                    "Trees Planted or Funded this Year",
                    "treesPlanted",
                    treesPlanted,
                    0,
                    50,
                    1,
                    treesPlanted >= 30 ? "Forest Creator / Carbon Sink Sponsor" : treesPlanted >= 10 ? "Active Reforester" : treesPlanted >= 2 ? "Backyard Planter" : "No trees funded yet",
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
              {currentStep === STEPS.length - 1 ? 'Save Baseline & Complete Onboarding' : 'Next Step'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
