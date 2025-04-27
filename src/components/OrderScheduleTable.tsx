
import React from 'react';
import { ProductionScenario, OrderSchedule } from '../types';
import { 
  Table,
  TableHeader,
  TableBody
} from '@/components/ui/table';
import TableRow from './TableRow';
import TableHeaderComponent from './TableHeader';

interface OrderScheduleTableProps {
  scenarios: ProductionScenario[];
  schedules: OrderSchedule[];
}

const OrderScheduleTable: React.FC<OrderScheduleTableProps> = ({ scenarios, schedules }) => {
  return (
    <div className="w-full overflow-x-auto border rounded-lg">
      <Table>
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
