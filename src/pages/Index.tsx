
import React, { useEffect, useState } from 'react';
import { ProductionScenario, OrderSchedule } from '../types';
import { generateProductionScenarios } from '../utils/dataGenerator';
import { calculateOrderSchedule } from '../utils/reorderAlgorithm';
import OrderScheduleTable from '../components/OrderScheduleTable';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [scenarios, setScenarios] = useState<ProductionScenario[]>([]);
  const [schedules, setSchedules] = useState<OrderSchedule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Generate data and calculate schedules
  const generateData = () => {
    setLoading(true);
    
    // Generate 100 production scenarios
    const newScenarios = generateProductionScenarios(100);
    setScenarios(newScenarios);
    
    // Calculate order schedules for each scenario
    const newSchedules = newScenarios.map(scenario => calculateOrderSchedule(scenario));
    setSchedules(newSchedules);
    
    setLoading(false);
  };

  // Generate data on component mount
  useEffect(() => {
    generateData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[95%] mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Reorder Algorithm Scheduler</h1>
              <p className="text-gray-600 mt-2">
                Optimizing inventory levels for manufacturing parts
              </p>
            </div>
            <Button 
              onClick={generateData} 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Calculating..." : "Generate New Data"}
            </Button>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-xl text-gray-500">Loading data...</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <OrderScheduleTable scenarios={scenarios} schedules={schedules} />
            </div>
          )}
          
          <div className="mt-6 text-sm text-gray-500">
            <h3 className="font-semibold mb-2">Color Legend:</h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-100 mr-2"></div>
                <span>Zero inventory (critical)</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-orange-100 mr-2"></div>
                <span>Below safety stock</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-100 mr-2"></div>
                <span>Excessive inventory (&gt;3x target)</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-50 mr-2"></div>
                <span>High inventory (1.5-3x target)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
