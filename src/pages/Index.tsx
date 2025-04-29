
import React, { useEffect, useState } from 'react';
import { ProductionScenario, OrderSchedule, SAMPLES } from '../types';
import { generateProductionScenarios } from '../utils/dataGenerator';
import { calculateOrderSchedules } from '../utils/algorithm';
import OrderScheduleTable from '../components/OrderScheduleTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const Index = () => {
  const [scenarios, setScenarios] = useState<ProductionScenario[]>([]);
  const [schedules, setSchedules] = useState<OrderSchedule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const generateData = () => {
    setLoading(true);
    const newScenarios = generateProductionScenarios(SAMPLES);
    setScenarios(newScenarios);
    const newSchedules = calculateOrderSchedules(newScenarios);
    setSchedules(newSchedules);
    setLoading(false);
  };

  useEffect(() => {
    generateData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[95%] mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-800">
                  Reorder Algorithm Scheduler
                </CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  Optimizing inventory levels for manufacturing parts
                </CardDescription>
              </div>
              <Button 
                onClick={generateData} 
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? "Calculating..." : "Generate New Data"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-xl text-gray-500">Loading data...</p>
              </div>
            ) : (
              <>
                <div className="border rounded-lg overflow-x-auto">
                  <OrderScheduleTable scenarios={scenarios} schedules={schedules} />
                </div>
                
                <div className="mt-6 text-sm text-gray-500 bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="font-semibold mb-2">Color Legend:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-red-100 mr-2"></div>
                      <span>Zero inventory (critical)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-yellow-100 mr-2"></div>
                      <span>Excessive inventory (&gt;3x target)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-50 mr-2"></div>
                      <span>Order placed or receiving</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
