
import React from 'react';
import { ProductionScenario, OrderSchedule } from '../types';
import TableHeader from './TableHeader';
import TableRow from './TableRow';

interface OrderScheduleTableProps {
  scenarios: ProductionScenario[];
  schedules: OrderSchedule[];
}

const OrderScheduleTable: React.FC<OrderScheduleTableProps> = ({ scenarios, schedules }) => {
  return (
    <div className="overflow-x-auto max-w-full">
      <table className="border-collapse border border-gray-300 text-sm w-full">
        <TableHeader />
        <tbody>
          {scenarios.map((scenario, index) => (
            <TableRow 
              key={scenario.MPN} 
              scenario={scenario} 
              schedule={schedules[index]} 
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderScheduleTable;
