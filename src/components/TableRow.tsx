
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
  
  const getInvCellColor = (inv: number, invTgt: number, sstok: number): string => {
    if (inv === 0) return 'bg-red-100';
    if (inv < sstok) return 'bg-yellow-100';
    if (inv > invTgt * 3) return 'bg-blue-100';
    return '';
  };

  // Common cell style for data cells
  const cellStyle = "border px-2 py-1 text-sm text-right";
  const headerCellStyle = "border px-2 py-1 text-sm font-medium bg-gray-50";

  return (
    <>
      {/* Input Requirements Row */}
      <ShadcnTableRow>
        {/* First row header cells */}
        <TableCell rowSpan={6} className={headerCellStyle}>
          {scenario.MPN}
        </TableCell>
        <TableCell rowSpan={6} className={headerCellStyle}>
          {getMPNAttributes(scenario)}
        </TableCell>
        <TableCell rowSpan={6} className={headerCellStyle}>
          {schedule.Notes}
        </TableCell>
        <TableCell className={headerCellStyle}>In: Rqt</TableCell>
        {scenario.Rqt.map((val, i) => (
          <TableCell key={`in-rqt-${i}`} className={cellStyle}>{val}</TableCell>
        ))}
      </ShadcnTableRow>

      {/* Input Receiving Row */}
      <ShadcnTableRow>
        <TableCell className={headerCellStyle}>In: Rec</TableCell>
        {scenario.Rec.map((val, i) => (
          <TableCell key={`in-rec-${i}`} className={cellStyle}>{val}</TableCell>
        ))}
      </ShadcnTableRow>

      {/* Output Requirements Row */}
      <ShadcnTableRow>
        <TableCell className={headerCellStyle}>Out: Rqt</TableCell>
        {schedule.Rqt.map((val, i) => (
          <TableCell key={`out-rqt-${i}`} className={cellStyle}>{val}</TableCell>
        ))}
      </ShadcnTableRow>

      {/* Output Orders Row */}
      <ShadcnTableRow>
        <TableCell className={headerCellStyle}>Out: Ord</TableCell>
        {schedule.Ord.map((val, i) => (
          <TableCell key={`out-ord-${i}`} className={cn(cellStyle, val > 0 && "font-bold bg-green-50")}>
            {val}
          </TableCell>
        ))}
      </ShadcnTableRow>

      {/* Output Receiving Row */}
      <ShadcnTableRow>
        <TableCell className={headerCellStyle}>Out: Rec</TableCell>
        {schedule.Rec.map((val, i) => (
          <TableCell key={`out-rec-${i}`} className={cellStyle}>{val}</TableCell>
        ))}
      </ShadcnTableRow>

      {/* Output Inventory Row */}
      <ShadcnTableRow className="border-b-2">
        <TableCell className={headerCellStyle}>Out: Inv</TableCell>
        {schedule.Inv.map((val, i) => (
          <TableCell 
            key={`out-inv-${i}`} 
            className={cn(cellStyle, getInvCellColor(val, scenario.InvTgt, scenario.SStok))}
          >
            {val}
          </TableCell>
        ))}
      </ShadcnTableRow>
    </>
  );
};

export default TableRow;
