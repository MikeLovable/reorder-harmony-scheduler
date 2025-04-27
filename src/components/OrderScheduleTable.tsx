
import React from 'react';
import { ProductionScenario, OrderSchedule } from '../types';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead,
  TableRow as ShadcnTableRow
} from '@/components/ui/table';
import TableRow from './TableRow';
import TableHeaderComponent from './TableHeader';

interface OrderScheduleTableProps {
  scenarios: ProductionScenario[];
  schedules: OrderSchedule[];
}

const OrderScheduleTable: React.FC<OrderScheduleTableProps> = ({ scenarios, schedules }) => {
  return (
    <div className="overflow-x-auto max-w-full">
      <Table className="w-full border-collapse border border-gray-300 text-sm">
        <TableHeader>
          <TableHeaderComponent />
        </TableHeader>
        <TableBody>
          {scenarios.map((scenario, index) => (
            <TableRow 
              key={scenario.MPN} 
              scenario={scenario} 
              schedule={schedules[index]} 
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrderScheduleTable;
