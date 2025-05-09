
import React from 'react';
import { ProductionScenario, OrderSchedule } from '../types';
import { TableCell, TableRow as ShadcnTableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface TableRowProps {
  scenario: ProductionScenario;
  schedule: OrderSchedule;
}

const TableRow: React.FC<TableRowProps> = ({ scenario, schedule }) => {
  const getMPNAttributes = (schedule: OrderSchedule): string => {
    return `LdTm[${schedule.LdTm}], MOQ[${schedule.MOQ}],
PkQty[${schedule.PkQty}],
InvTgt[${schedule.InvTgt}], SStok[${schedule.SStok}]`;
  };
  
  const getInvCellColor = (inv: number, invTgt: number): string => {
    if (inv === 0) return 'bg-red-100';
    if (inv > invTgt * 3) return 'bg-yellow-100';
    return '';
  };

  // Common cell styles
  const cellStyle = "border px-2 py-1 text-sm text-right";
  const headerCellStyle = "border px-2 py-1 text-sm font-medium bg-gray-50";
  const directionCellStyle = "border px-2 py-1 text-sm font-medium text-left";

  return (
    <>
      {/* Input Requirements Row */}
      <ShadcnTableRow>
        <TableCell rowSpan={6} className={headerCellStyle}>{schedule.MPN}</TableCell>
        <TableCell rowSpan={6} className={headerCellStyle}>{getMPNAttributes(schedule)}</TableCell>
        <TableCell rowSpan={6} className={headerCellStyle}>{schedule.Notes}</TableCell>
        <TableCell className={directionCellStyle}>In</TableCell>
        <TableCell className={headerCellStyle}>Rqt</TableCell>
        {schedule.Rqt.map((val, i) => (
          <TableCell key={`in-rqt-${i}`} className={cellStyle}>{val}</TableCell>
        ))}
      </ShadcnTableRow>

      {/* Input Receiving Row */}
      <ShadcnTableRow>
        <TableCell className={directionCellStyle}>In</TableCell>
        <TableCell className={headerCellStyle}>Rec</TableCell>
        {schedule.InRec.map((val, i) => (
          <TableCell key={`in-rec-${i}`} className={cellStyle}>{val}</TableCell>
        ))}
      </ShadcnTableRow>

      {/* Input Inventory Row */}
      <ShadcnTableRow>
        <TableCell className={directionCellStyle}>In</TableCell>
        <TableCell className={headerCellStyle}>Inv</TableCell>
        {schedule.Rqt.map((_, i) => (
          <TableCell key={`in-inv-${i}`} className={cellStyle}>
            {i === 0 && scenario.Inv ? scenario.Inv[0] : "N/A"}
          </TableCell>
        ))}
      </ShadcnTableRow>

      {/* Output Requirements Row */}
      <ShadcnTableRow>
        <TableCell className={directionCellStyle}>Out</TableCell>
        <TableCell className={headerCellStyle}>Rqt</TableCell>
        {schedule.Rqt.map((val, i) => (
          <TableCell key={`out-rqt-${i}`} className={cellStyle}>{val}</TableCell>
        ))}
      </ShadcnTableRow>

      {/* Output Orders Row */}
      <ShadcnTableRow>
        <TableCell className={directionCellStyle}>Out</TableCell>
        <TableCell className={headerCellStyle}>Ord</TableCell>
        {schedule.Ord.map((val, i) => (
          <TableCell key={`out-ord-${i}`} className={cn(cellStyle, val > 0 && "font-bold bg-green-50")}>
            {val > 0 ? val : ""}
          </TableCell>
        ))}
      </ShadcnTableRow>

      {/* Output Receiving Row */}
      <ShadcnTableRow>
        <TableCell className={directionCellStyle}>Out</TableCell>
        <TableCell className={headerCellStyle}>Rec</TableCell>
        {schedule.Rec.map((val, i) => (
          <TableCell key={`out-rec-${i}`} className={cn(cellStyle, val > 0 && "bg-green-50")}>
            {val > 0 ? val : ""}
          </TableCell>
        ))}
      </ShadcnTableRow>

      {/* Output Inventory Row */}
      <ShadcnTableRow className="border-b-2">
        <TableCell className={directionCellStyle}>Out</TableCell>
        <TableCell className={headerCellStyle}>Inv</TableCell>
        {schedule.Inv.map((val, i) => (
          <TableCell 
            key={`out-inv-${i}`} 
            className={cn(cellStyle, getInvCellColor(val, schedule.InvTgt))}
          >
            {val}
          </TableCell>
        ))}
      </ShadcnTableRow>
    </>
  );
};

export default TableRow;
