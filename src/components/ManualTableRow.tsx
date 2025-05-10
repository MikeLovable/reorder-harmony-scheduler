
import React from 'react';
import { OrderSchedule } from '@/types';
import { TableCell, TableRow as ShadcnTableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ManualTableRowProps {
  schedule: OrderSchedule;
  onOrderChange: (mpn: string, periodIndex: number, value: number) => void;
}

const ManualTableRow: React.FC<ManualTableRowProps> = ({ schedule, onOrderChange }) => {
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

  const handleOrderChange = (periodIndex: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(event.target.value) || 0;
    onOrderChange(schedule.MPN, periodIndex, newValue);
  };

  // Common cell styles
  const cellStyle = "border px-2 py-1 text-sm text-right";
  const headerCellStyle = "border px-2 py-1 text-sm font-medium bg-gray-50";
  const directionCellStyle = "border px-2 py-1 text-sm font-medium text-left";

  return (
    <>
      {/* Input Requirements Row */}
      <ShadcnTableRow>
        <TableCell rowSpan={7} className={headerCellStyle}>{schedule.MPN}</TableCell>
        <TableCell rowSpan={7} className={headerCellStyle}>{getMPNAttributes(schedule)}</TableCell>
        <TableCell rowSpan={7} className={headerCellStyle}>{schedule.Notes}</TableCell>
        <TableCell rowSpan={3} className={directionCellStyle}>In</TableCell>
        <TableCell className={headerCellStyle}>Rqt</TableCell>
        {schedule.Rqt.map((val, i) => (
          <TableCell key={`in-rqt-${i}`} className={cellStyle}>{val}</TableCell>
        ))}
      </ShadcnTableRow>

      {/* Input Receiving Row */}
      <ShadcnTableRow>
        <TableCell className={headerCellStyle}>Rec</TableCell>
        {schedule.InRec.map((val, i) => (
          <TableCell key={`in-rec-${i}`} className={cellStyle}>{val}</TableCell>
        ))}
      </ShadcnTableRow>

      {/* Input Inventory Row */}
      <ShadcnTableRow>
        <TableCell className={headerCellStyle}>Inv</TableCell>
        {schedule.Rqt.map((_, i) => (
          <TableCell key={`in-inv-${i}`} className={cellStyle}>
            {i === 0 && schedule.Inv ? schedule.Inv[0] : "N/A"}
          </TableCell>
        ))}
      </ShadcnTableRow>

      {/* Output Requirements Row */}
      <ShadcnTableRow>
        <TableCell rowSpan={4} className={directionCellStyle}>Out</TableCell>
        <TableCell className={headerCellStyle}>Rqt</TableCell>
        {schedule.Rqt.map((val, i) => (
          <TableCell key={`out-rqt-${i}`} className={cellStyle}>{val}</TableCell>
        ))}
      </ShadcnTableRow>

      {/* Output Orders Row - EDITABLE */}
      <ShadcnTableRow>
        <TableCell className={headerCellStyle}>Ord</TableCell>
        {schedule.Ord.map((val, i) => (
          <TableCell key={`out-ord-${i}`} className={cn(cellStyle, "p-0")}>
            <Input
              type="number"
              className="h-8 text-right border-none"
              value={val || ''}
              onChange={(e) => handleOrderChange(i, e)}
            />
          </TableCell>
        ))}
      </ShadcnTableRow>

      {/* Output Receiving Row */}
      <ShadcnTableRow>
        <TableCell className={headerCellStyle}>Rec</TableCell>
        {schedule.Rec.map((val, i) => (
          <TableCell key={`out-rec-${i}`} className={cn(cellStyle, val > 0 && "bg-green-50")}>
            {val > 0 ? val : ""}
          </TableCell>
        ))}
      </ShadcnTableRow>

      {/* Output Inventory Row */}
      <ShadcnTableRow className="border-b-2">
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

export default ManualTableRow;
