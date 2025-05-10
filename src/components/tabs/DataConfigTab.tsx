
import React, { useState } from 'react';
import { PERIODS, SAMPLES, ProductionScenarioArray } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { toast } from '@/components/ui/use-toast';
import { generateProductionScenarios } from '@/utils/dataGenerator';

const algorithmDescriptions = [
  { name: 'Mock', description: 'Simple mock implementation for testing purposes.' },
  { name: 'Algo1', description: 'Basic algorithm that maintains inventory target levels.' },
  { name: 'Algo2', description: 'Enhanced algorithm with look-ahead capabilities for better planning.' },
  { name: 'AlgoRealistic', description: 'Most sophisticated algorithm with lead time prediction and emergency orders.' }
];

const DataConfigTab: React.FC = () => {
  const [periodsInput, setPeriodsInput] = useState<string>(PERIODS.toString());
  const [samplesInput, setSamplesInput] = useState<string>(SAMPLES.toString());
  const [customerScenarios, setCustomerScenarios] = useState<string>(() => {
    const scenarios = generateProductionScenarios(SAMPLES, 'customer');
    return JSON.stringify(scenarios, null, 2);
  });

  const handleSavePeriods = () => {
    const newPeriods = parseInt(periodsInput);
    if (isNaN(newPeriods) || newPeriods <= 0) {
      toast({
        title: "Invalid Value",
        description: "Please enter a positive integer for PERIODS",
        variant: "destructive",
      });
      return;
    }

    // In a production app, we would update the global state here
    toast({
        title: "Periods Updated",
        description: `PERIODS value set to ${newPeriods}`,
    });
  };

  const handleSaveSamples = () => {
    const newSamples = parseInt(samplesInput);
    if (isNaN(newSamples) || newSamples <= 0) {
      toast({
        title: "Invalid Value",
        description: "Please enter a positive integer for SAMPLES",
        variant: "destructive",
      });
      return;
    }
    
    // In a production app, we would update the global state here
    toast({
        title: "Samples Updated",
        description: `SAMPLES value set to ${newSamples}`,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Algorithm Descriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Algorithm</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {algorithmDescriptions.map((algo) => (
                <TableRow key={algo.name}>
                  <TableCell className="font-medium">{algo.name}</TableCell>
                  <TableCell>{algo.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <label htmlFor="periods" className="whitespace-nowrap">PERIODS:</label>
                <Input
                  id="periods"
                  type="number"
                  value={periodsInput}
                  onChange={(e) => setPeriodsInput(e.target.value)}
                />
                <Button onClick={handleSavePeriods}>Save</Button>
              </div>

              <div className="flex items-center space-x-2">
                <label htmlFor="samples" className="whitespace-nowrap">SAMPLES:</label>
                <Input
                  id="samples"
                  type="number"
                  value={samplesInput}
                  onChange={(e) => setSamplesInput(e.target.value)}
                />
                <Button onClick={handleSaveSamples}>Save</Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="customer-scenarios" className="block font-medium">
                Customer-configured Production Scenarios for demo:
              </label>
              <Textarea
                id="customer-scenarios"
                value={customerScenarios}
                onChange={(e) => setCustomerScenarios(e.target.value)}
                className="min-h-[400px] font-mono text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataConfigTab;
