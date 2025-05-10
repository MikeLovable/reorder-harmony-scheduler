
import React from 'react';
import { OrderSchedule } from '@/types';
import { 
  Table,
  TableHeader,
  TableBody
} from '@/components/ui/table';
import { useManualSchedules } from '@/hooks/useManualSchedules';
import ManualTableRow from './ManualTableRow';
import TableHeaderComponent from './TableHeader';
import { useAppConfig } from '@/hooks/useAppConfig';

interface ManualOrderScheduleTableProps {
  schedules: OrderSchedule[];
  onSchedulesChange: (schedules: OrderSchedule[]) => void;
}

const ManualOrderScheduleTable: React.FC<ManualOrderScheduleTableProps> = ({ 
  schedules,
  onSchedulesChange
}) => {
  const { periods } = useAppConfig();
  
  // Update shared context
  const { setSchedules } = useManualSchedules();
  React.useEffect(() => {
    setSchedules(schedules);
  }, [schedules, setSchedules]);
  
  const handleOrderChange = (mpn: string, periodIndex: number, value: number) => {
    const updatedSchedules = schedules.map(schedule => {
      if (schedule.MPN === mpn) {
        const newOrders = [...schedule.Ord];
        newOrders[periodIndex] = value;
        
        // Re-calculate receipts (they arrive LdTm periods later)
        const newReceipts = [...schedule.Rec];
        const ldTm = schedule.LdTm;
        if (periodIndex + ldTm < newReceipts.length) {
          newReceipts[periodIndex + ldTm] = value;
        }
        
        // Re-calculate inventory based on new orders/receipts
        const newInventory = [...schedule.Inv];
        for (let i = 1; i < newInventory.length; i++) {
          if (i > periodIndex) {
            // Start recalculation from the period after the changed order
            newInventory[i] = Math.max(0, 
              newInventory[i-1] + newReceipts[i-1] - schedule.Rqt[i-1]
            );
          }
        }
        
        return {
          ...schedule,
          Ord: newOrders,
          Rec: newReceipts,
          Inv: newInventory
        };
      }
      return schedule;
    });
    
    onSchedulesChange(updatedSchedules);
  };

  return (
    <div className="w-full overflow-x-auto border rounded-lg">
      <Table>
        <TableHeader>
          <TableHeaderComponent />
        </TableHeader>
        <TableBody>
          {schedules.map((schedule) => (
            <ManualTableRow 
              key={schedule.MPN}
              schedule={schedule}
              onOrderChange={handleOrderChange}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ManualOrderScheduleTable;
