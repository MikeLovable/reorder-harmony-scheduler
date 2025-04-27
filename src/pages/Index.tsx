
import React, { useEffect, useState } from 'react';
import { ProductionScenario, OrderSchedule } from '../types';
import { generateProductionScenarios } from '../utils/dataGenerator';
import { calculateOrderSchedule } from '../utils/reorderAlgorithm';
import OrderScheduleTable from '../components/OrderScheduleTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';

const Index = () => {
  const [scenarios, setScenarios] = useState<ProductionScenario[]>([]);
  const [schedules, setSchedules] = useState<OrderSchedule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Generate data and calculate schedules
  const generateData = () => {
    setLoading(true);
    
    // Generate 100 production scenarios
    const newScenarios = generateProductionScenarios(100);
    setScenarios(newScenarios);
    
    // Calculate order schedules for each scenario
    const newSchedules = newScenarios.map(scenario => calculateOrderSchedule(scenario));
    setSchedules(newSchedules);
    
    setCurrentPage(1);
    setLoading(false);
  };

  // Generate data on component mount
  useEffect(() => {
    generateData();
  }, []);

  // Get current items for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentScenarios = scenarios.slice(indexOfFirstItem, indexOfLastItem);
  const currentSchedules = schedules.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(scenarios.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[95%] mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-800">Reorder Algorithm Scheduler</CardTitle>
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
                  <OrderScheduleTable 
                    scenarios={currentScenarios} 
                    schedules={currentSchedules} 
                  />
                </div>
                
                <div className="mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => paginate(Math.max(1, currentPage - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNumber;
                        
                        if (totalPages <= 5) {
                          pageNumber = i + 1;
                        } else if (currentPage <= 3) {
                          pageNumber = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNumber = totalPages - 4 + i;
                        } else {
                          pageNumber = currentPage - 2 + i;
                        }
                        
                        return (
                          <PaginationItem key={pageNumber}>
                            <PaginationLink 
                              isActive={currentPage === pageNumber}
                              onClick={() => paginate(pageNumber)}
                            >
                              {pageNumber}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
                
                <div className="mt-6 text-sm text-gray-500 bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="font-semibold mb-2">Color Legend:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
