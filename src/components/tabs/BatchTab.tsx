
import React, { useState, useEffect } from 'react';
import { ProductionScenario, OrderSchedule, SAMPLES } from '@/types';
import { generateProductionScenarios } from '@/utils/dataGenerator';
import { calculateOrderSchedules } from '@/utils/reorderAlgorithm';
import OrderScheduleTable from '@/components/OrderScheduleTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

type AlgorithmType = 'Mock' | 'Algo1' | 'Algo2' | 'AlgoRealistic';
type DataSourceType = 'Random' | 'Customer' | 'Set1';

interface BatchTabProps {
  apiUrl: string;
  setApiUrl: (url: string) => void;
}

const BatchTab: React.FC<BatchTabProps> = ({ apiUrl, setApiUrl }) => {
  const [scenarios, setScenarios] = useState<ProductionScenario[]>([]);
  const [schedules, setSchedules] = useState<OrderSchedule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [apiLoading, setApiLoading] = useState<boolean>(false);
  
  const [algorithmType, setAlgorithmType] = useState<AlgorithmType>('Mock');
  const [dataSource, setDataSource] = useState<DataSourceType>('Customer');
  
  const generateData = () => {
    setLoading(true);
    
    // Generate scenarios based on dataSource selection
    let newScenarios: ProductionScenario[];
    
    switch (dataSource) {
      case 'Random':
        newScenarios = generateProductionScenarios(SAMPLES, 'random');
        break;
      case 'Set1':
        newScenarios = generateProductionScenarios(SAMPLES, 'set1');
        break;
      case 'Customer':
      default:
        newScenarios = generateProductionScenarios(SAMPLES, 'customer');
        break;
    }
    
    setScenarios(newScenarios);
    
    // Calculate schedules using the selected algorithm
    const newSchedules = calculateOrderSchedules(newScenarios, algorithmType);
    setSchedules(newSchedules);
    
    setLoading(false);
  };

  const simulateViaApi = async () => {
    try {
      setApiLoading(true);
      const response = await fetch(`${apiUrl}/SimulateOrders?DataSource=${dataSource}&AlgorithmType=${algorithmType}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.scenarios && result.schedules) {
        setScenarios(result.scenarios);
        setSchedules(result.schedules);
        toast({
          title: "API simulation completed",
          description: `Successfully processed ${result.schedules.length} schedules`,
        });
      } else {
        throw new Error("Invalid response from API");
      }
    } catch (error) {
      console.error("API simulation error:", error);
      toast({
        title: "API Error",
        description: "Failed to simulate orders via API. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setApiLoading(false);
    }
  };

  useEffect(() => {
    generateData();
  }, [algorithmType, dataSource]);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
            <div className="w-full sm:w-48">
              <Select value={dataSource} onValueChange={(value: DataSourceType) => setDataSource(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Data Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Data Source</SelectLabel>
                    <SelectItem value="Random">Random</SelectItem>
                    <SelectItem value="Customer">Customer</SelectItem>
                    <SelectItem value="Set1">Set1</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full sm:w-48">
              <Select value={algorithmType} onValueChange={(value: AlgorithmType) => setAlgorithmType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Algorithm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Algorithm</SelectLabel>
                    <SelectItem value="Mock">Mock</SelectItem>
                    <SelectItem value="Algo1">Algo1</SelectItem>
                    <SelectItem value="Algo2">Algo2</SelectItem>
                    <SelectItem value="AlgoRealistic">AlgoRealistic</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                onClick={generateData} 
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-auto"
              >
                {loading ? "Calculating..." : "Run Algorithm Locally"}
              </Button>
              
              <Button 
                onClick={simulateViaApi} 
                disabled={apiLoading}
                className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-auto"
              >
                {apiLoading ? "Simulating..." : "Simulate Via API"}
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="api-url" className="block text-sm font-medium text-gray-700 mb-1">
            API URL
          </label>
          <Input
            id="api-url"
            type="text"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            className="w-full"
            placeholder="Enter API Gateway URL"
          />
        </div>
        
        {loading || apiLoading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-xl text-gray-500">
              {apiLoading ? "Simulating via API..." : "Calculating locally..."}
            </p>
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
  );
};

export default BatchTab;
