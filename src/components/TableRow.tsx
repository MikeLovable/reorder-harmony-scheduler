
import React from 'react';
import { ProductionScenario, OrderSchedule } from '../types';
import { TableCell, TableRow as ShadcnTableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface TableRowProps {
  scenario: ProductionScenario;
  schedule: OrderSchedule;
}

const TableRow: React.FC<TableRowProps> = ({ scenario, schedule }) => {
  const getMPNAttributes = (scenario: ProductionScenario): string => {
    return `InvTgt[${scenario.InvTgt}] SStok[${scenario.SStok}] LdTm[${scenario.LdTm}] MOQ[${scenario.MOQ}] PkQty[${scenario.PkQty}]`;
  };
  
  // Function to determine cell color based on inventory level
  const getInvCellColor = (inv: number, invTgt: number, sstok: number): string => {
    if (inv <= 0) return 'bg-red-100';
    if (inv < sstok) return 'bg-orange-100';
    if (inv > invTgt * 3) return 'bg-yellow-100';
    if (inv > invTgt * 1.5) return 'bg-blue-50';
    return '';
  };

  return (
    <>
      {/* Input: Requirements Row */}
      <ShadcnTableRow className="border hover:bg-gray-50">
        <TableCell rowSpan={2} className="border px-2 py-1 align-top text-xs font-medium">
          {scenario.MPN}
        </TableCell>
        <TableCell rowSpan={2} className="border px-2 py-1 align-top text-xs">
          {getMPNAttributes(scenario)}
        </TableCell>
        <TableCell rowSpan={2} className="border px-2 py-1 align-top text-xs max-w-xs">
          {schedule.Notes}
        </TableCell>
        <TableCell className="border px-2 py-1 font-semibold text-xs bg-blue-50 text-center">In:</TableCell>
        {scenario.Rqt.map((val, index) => (
          <TableCell key={`in-rqt-${index}`} className="border px-1 py-0.5 text-center text-xs bg-blue-50">
            {val}
          </TableCell>
        ))}
      </ShadcnTableRow>
      
      {/* Input: Receiving Row */}
      <ShadcnTableRow className="border hover:bg-gray-50">
        <TableCell className="border px-2 py-1 hidden"></TableCell> {/* Hidden cell for "In:" label since it's merged */}
        {scenario.Rec.map((val, index) => (
          <TableCell key={`in-rec-${index}`} className="border px-1 py-0.5 text-center text-xs bg-green-50">
            {val}
          </TableCell>
        ))}
      </ShadcnTableRow>
      
      {/* Output: Requirements Row */}
      <ShadcnTableRow className="border hover:bg-gray-50">
        <TableCell rowSpan={4} className="border px-2 py-1 align-top text-xs font-medium hidden">
          {/* Hidden cell for MPN since it's merged with input rows */}
        </TableCell>
        <TableCell rowSpan={4} className="border px-2 py-1 align-top text-xs hidden">
          {/* Hidden cell for attributes since it's merged with input rows */}
        </TableCell>
        <TableCell rowSpan={4} className="border px-2 py-1 align-top text-xs max-w-xs hidden">
          {/* Hidden cell for notes since it's merged with input rows */}
        </TableCell>
        <TableCell className="border px-2 py-1 font-semibold text-xs bg-yellow-50 text-center">Out:</TableCell>
        {schedule.Rqt.map((val, index) => (
          <TableCell key={`out-rqt-${index}`} className="border px-1 py-0.5 text-center text-xs bg-blue-50">
            {val}
          </TableCell>
        ))}
      </ShadcnTableRow>
      
      {/* Output: Orders Row */}
      <ShadcnTableRow className="border hover:bg-gray-50">
        <TableCell className="border px-2 py-1 hidden"></TableCell> {/* Hidden cell for "Out:" label since it's merged */}
        {schedule.Ord.map((val, index) => (
          <TableCell key={`ord-${index}`} className={cn(
            "border px-1 py-0.5 text-center text-xs bg-orange-50",
            val > 0 ? "font-bold" : ""
          )}>
            {val}
          </TableCell>
        ))}
      </ShadcnTableRow>
      
      {/* Output: Receiving Row */}
      <ShadcnTableRow className="border hover:bg-gray-50">
        <TableCell className="border px-2 py-1 hidden"></TableCell> {/* Hidden cell for "Out:" label since it's merged */}
        {schedule.Rec.map((val, index) => (
          <TableCell key={`out-rec-${index}`} className="border px-1 py-0.5 text-center text-xs bg-green-50">
            {val}
          </TableCell>
        ))}
      </ShadcnTableRow>
      
      {/* Output: Inventory Row */}
      <ShadcnTableRow className="border hover:bg-gray-50">
        <TableCell className="border px-2 py-1 hidden"></TableCell> {/* Hidden cell for "Out:" label since it's merged */}
        {schedule.Inv.map((val, index) => (
          <TableCell 
            key={`inv-${index}`} 
            className={cn(
              "border px-1 py-0.5 text-center text-xs",
              getInvCellColor(val, scenario.InvTgt, scenario.SStok)
            )}
          >
            {val}
          </TableCell>
        ))}
      </ShadcnTableRow>
    </>
  );
};

export default TableRow;
