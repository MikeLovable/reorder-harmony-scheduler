
import React from 'react';
import { ProductionScenario, OrderSchedule } from '../types';
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
  const getInvCellColor = (inv: number, invTgt: number): string => {
    if (inv <= 0) return 'bg-red-100';
    if (inv < scenario.SStok) return 'bg-orange-100';
    if (inv > invTgt * 3) return 'bg-yellow-100';
    if (inv > invTgt * 1.5) return 'bg-blue-50';
    return '';
  };

  return (
    <>
      {/* In: Production Scenario Row */}
      <tr className="border hover:bg-gray-50">
        <td rowSpan={5} className="border px-2 py-1 align-top text-xs font-medium">
          {scenario.MPN}
        </td>
        <td rowSpan={5} className="border px-2 py-1 align-top text-xs">
          {getMPNAttributes(scenario)}
        </td>
        <td rowSpan={5} className="border px-2 py-1 align-top text-xs max-w-xs">
          {schedule.Notes}
        </td>
        <td className="border px-2 py-1 font-semibold text-xs bg-blue-50">In:</td>
        {/* No actual data in this row */}
      </tr>
      
      {/* Requirements Row */}
      <tr className="border hover:bg-gray-50">
        {scenario.Rqt.map((val, index) => (
          <td key={`rqt-${index}`} className="border px-1 py-0.5 text-center text-xs bg-blue-50">
            {val}
          </td>
        ))}
        {scenario.Rec.map((val, index) => (
          <td key={`rec-${index}`} className="border px-1 py-0.5 text-center text-xs bg-green-50">
            {val}
          </td>
        ))}
      </tr>
      
      {/* Out: Order Schedule Row */}
      <tr className="border hover:bg-gray-50">
        <td className="border px-2 py-1 font-semibold text-xs bg-yellow-50">Out:</td>
        {/* No actual data in this row */}
      </tr>
      
      {/* Rqt Row */}
      <tr className="border hover:bg-gray-50">
        {schedule.Rqt.map((val, index) => (
          <td key={`out-rqt-${index}`} className="border px-1 py-0.5 text-center text-xs bg-blue-50">
            {val}
          </td>
        ))}
        {schedule.Ord.map((val, index) => (
          <td key={`ord-${index}`} className={cn(
            "border px-1 py-0.5 text-center text-xs bg-orange-50",
            val > 0 ? "font-bold" : ""
          )}>
            {val}
          </td>
        ))}
        {schedule.Rec.map((val, index) => (
          <td key={`out-rec-${index}`} className="border px-1 py-0.5 text-center text-xs bg-green-50">
            {val}
          </td>
        ))}
        {schedule.Inv.map((val, index) => (
          <td 
            key={`inv-${index}`} 
            className={cn(
              "border px-1 py-0.5 text-center text-xs",
              getInvCellColor(val, scenario.InvTgt)
            )}
          >
            {val}
          </td>
        ))}
      </tr>
    </>
  );
};

export default TableRow;
