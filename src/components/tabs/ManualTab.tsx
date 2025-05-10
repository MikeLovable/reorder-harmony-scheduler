
import React, { useState } from 'react';
import { ProductionScenario, OrderSchedule } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { calculateOrderSchedules } from '@/utils/reorderAlgorithm';
import ProductionScenarioTable from '@/components/ProductionScenarioTable';
import ManualOrderScheduleTable from '@/components/ManualOrderScheduleTable';
import { generateProductionScenarios } from '@/utils/dataGenerator';
import { useAppConfig } from '@/hooks/useAppConfig';

type AlgorithmType = 'Mock' | 'Algo1' | 'Algo2' | 'AlgoRealistic';
type DataSourceType = 'Random' | 'Customer' | 'Set1';

interface ManualTabProps {
  apiUrl: string;
}

const ManualTab: React.FC<ManualTabProps> = ({ apiUrl }) => {
  const { periods, samples } = useAppConfig();
  const [scenarios, setScenarios] = useState<ProductionScenario[]>([]);
  const [manualSchedules, setManualSchedules] = useState<OrderSchedule[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [algorithmType, setAlgorithmType] = useState<AlgorithmType>('Mock');
  const [dataSource, setDataSource] = useState<DataSourceType>('Customer');
  const [selectAll, setSelectAll] = useState<boolean>(false);

  const getProductionScenarios = async () => {
    setLoading(true);
    try {
      // Try to get scenarios from API first
      if (apiUrl) {
        try {
          const response = await fetch(`${apiUrl}/GetProductionScenarios?DataSource=${dataSource}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            const result = await response.json();
            // Initialize all scenarios with Sel=false
            const scenariosWithSel = result.map((s: ProductionScenario) => ({ 
              ...s, 
              Sel: false 
            }));
            setScenarios(scenariosWithSel);
            
            toast({
              title: "Production Scenarios Loaded from API",
              description: `Successfully loaded ${scenariosWithSel.length} scenarios`,
            });
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error("Error fetching production scenarios from API:", error);
          // Fall back to local generation
        }
      }

      // If API failed or no URL, generate locally
      const localScenarios = generateProductionScenarios(samples, dataSource.toLowerCase());
      const scenariosWithSel = localScenarios.map(s => ({ ...s, Sel: false }));
      setScenarios(scenariosWithSel);
      
      toast({
        title: "Production Scenarios Generated Locally",
        description: `Generated ${scenariosWithSel.length} scenarios with ${periods} periods each`,
      });
    } catch (error) {
      console.error("Error generating production scenarios:", error);
      toast({
        title: "Error",
        description: "Failed to get production scenarios. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const runAlgorithm = async () => {
    const selectedScenarios = scenarios.filter(s => s.Sel);
    
    if (selectedScenarios.length === 0) {
      toast({
        title: "No Scenarios Selected",
        description: "Please select at least one production scenario.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Try to calculate schedules from API first
      if (apiUrl) {
        try {
          const response = await fetch(`${apiUrl}/GetOrders`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              scenarios: selectedScenarios, 
              algorithmType 
            }),
          });
          
          if (response.ok) {
            const result = await response.json();
            setManualSchedules(result);
            
            toast({
              title: "Order Schedules Calculated via API",
              description: `Created ${result.length} order schedules`,
            });
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error("Error calculating order schedules from API:", error);
          // Fall back to local calculation
        }
      }

      // If API failed or no URL, calculate locally
      const newSchedules = calculateOrderSchedules(selectedScenarios, algorithmType);
      setManualSchedules(newSchedules);
      
      toast({
        title: "Order Schedules Calculated Locally",
        description: `Created ${newSchedules.length} order schedules`,
      });
    } catch (error) {
      console.error("Error calculating order schedules:", error);
      toast({
        title: "Algorithm Error",
        description: "Failed to calculate order schedules. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setScenarios(scenarios.map(scenario => ({
      ...scenario,
      Sel: checked
    })));
  };

  const handleToggleScenario = (mpn: string, checked: boolean) => {
    setScenarios(scenarios.map(scenario => 
      scenario.MPN === mpn 
        ? { ...scenario, Sel: checked } 
        : scenario
    ));
    
    // Update selectAll based on whether all scenarios are now selected
    const allSelected = scenarios.every(s => 
      (s.MPN === mpn ? checked : s.Sel)
    );
    setSelectAll(allSelected);
  };

  return (
    <div className="space-y-6">
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
                  onClick={getProductionScenarios} 
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-auto"
                >
                  {loading ? "Loading..." : "Get Production Scenarios"}
                </Button>
                
                <Button 
                  onClick={runAlgorithm} 
                  disabled={loading || scenarios.length === 0}
                  className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-auto"
                >
                  {loading ? "Calculating..." : "Calculate Order Schedules"}
                </Button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-xl text-gray-500">
                Loading...
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {scenarios.length > 0 && (
                <div className="border rounded-lg overflow-x-auto">
                  <ProductionScenarioTable 
                    scenarios={scenarios} 
                    selectAll={selectAll}
                    onSelectAllChange={handleToggleSelectAll}
                    onScenarioSelectChange={handleToggleScenario}
                  />
                </div>
              )}
              
              {manualSchedules.length > 0 && (
                <div className="border rounded-lg overflow-x-auto mt-8">
                  <h3 className="text-lg font-semibold p-4">Order Schedules</h3>
                  <ManualOrderScheduleTable 
                    schedules={manualSchedules} 
                    onSchedulesChange={setManualSchedules}
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ManualTab;
