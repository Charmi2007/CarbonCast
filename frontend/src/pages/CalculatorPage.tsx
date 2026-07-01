import { useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useForm as useHookForm } from 'react-hook-form';
import axios from 'axios';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';

const STEPS = ['Personal', 'Home', 'Transportation', 'Food', 'Lifestyle'];

export default function CalculatorPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const methods = useHookForm();
  const { register, handleSubmit } = methods;
  const nextStep = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep(curr => curr + 1);
  };
  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(curr => curr - 1);
  };

  const onSubmit = async (data: any) => {
    if (currentStep !== STEPS.length - 1) {
      nextStep();
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Structure data correctly for the API
      const formattedData = {
        personal: { name: data.name, age: Number(data.age) },
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
          plasticBottlesWeekly: Number(data.plasticBottlesWeekly) 
        }
      };

      const res = await axios.post('http://localhost:5000/api/v1/calculate', formattedData);
      const recordId = res.data.data.record._id;
      navigate(`/dashboard/${recordId}`);
    } catch (error) {
      console.error("Calculation failed", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-brand-text mb-2 text-center">Carbon Footprint Calculator</h1>
        <p className="text-brand-textSecondary text-center">Complete the steps below to estimate your annual emissions.</p>
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
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold mb-6">Personal Details (Optional)</h2>
                  <Input label="Name" {...register('name')} placeholder="Your name" />
                  <Input label="Age" type="number" {...register('age')} placeholder="Your age" />
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold mb-6">Home Environment</h2>
                  <div className="flex flex-col gap-1.5 mb-4">
                    <label className="text-sm font-medium text-brand-text">Home Type</label>
                    <select {...register('homeType')} className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-brand-bg text-brand-text focus:ring-2 focus:ring-brand-primary">
                      <option value="Apartment">Apartment</option>
                      <option value="Independent House">Independent House</option>
                      <option value="Hostel">Hostel</option>
                      <option value="PG">PG</option>
                    </select>
                  </div>
                  <Input label="Number of People" type="number" {...register('peopleCount')} placeholder="e.g. 4" />
                  <Input label="Monthly Electricity Bill (Avg $)" type="number" {...register('electricityBill')} placeholder="e.g. 100" />
                  <Input label="Number of ACs" type="number" {...register('acCount')} placeholder="e.g. 2" />
                  <Input label="Daily AC Usage (Hours/day)" type="number" {...register('acUsageDaily')} placeholder="e.g. 4" />
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold mb-6">Transportation</h2>
                  <div className="flex flex-col gap-1.5 mb-4">
                    <label className="text-sm font-medium text-brand-text">Primary Transport</label>
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
                  <Input label="Weekly Distance (km/miles)" type="number" {...register('weeklyDistance')} placeholder="e.g. 150" />
                  <Input label="Flights in Last 12 Months" type="number" {...register('flightsYearly')} placeholder="e.g. 2" />
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold mb-6">Food & Diet</h2>
                  <div className="flex flex-col gap-1.5 mb-4">
                    <label className="text-sm font-medium text-brand-text">Diet Preference</label>
                    <select {...register('diet')} className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-brand-bg text-brand-text focus:ring-2 focus:ring-brand-primary">
                      <option value="Vegan">Vegan</option>
                      <option value="Vegetarian">Vegetarian</option>
                      <option value="Eggetarian">Eggetarian</option>
                      <option value="Non-Vegetarian">Non-Vegetarian</option>
                    </select>
                  </div>
                  <Input label="Chicken Meals Per Week" type="number" {...register('chickenMealsWeekly')} placeholder="e.g. 3" />
                  <Input label="Red Meat Meals Per Month" type="number" {...register('redMeatMealsMonthly')} placeholder="e.g. 1" />
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold mb-6">Lifestyle</h2>
                  <Input label="Online Shopping Orders (per month)" type="number" {...register('onlineShoppingMonthly')} placeholder="e.g. 5" />
                  <Input label="New Clothes Bought (per month)" type="number" {...register('newClothesMonthly')} placeholder="e.g. 2" />
                  <Input label="Plastic Water Bottles (per week)" type="number" {...register('plasticBottlesWeekly')} placeholder="e.g. 10" />
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between mt-8 pt-6 border-t border-brand-border">
            <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 0 || isSubmitting}>
              Back
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {currentStep === STEPS.length - 1 ? 'Calculate My Footprint' : 'Next Step'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
