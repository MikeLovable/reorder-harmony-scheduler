
import React from 'react';
import { TableHead, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

const TableHeader: React.FC = () => {
  // Generate week numbers for column headers
  const weekNumbers = Array.from({ length: 13 }, (_, i) => i);

  return (
    <>
      {/* First row - Main sections */}
      <TableRow>
        <TableHead rowSpan={6} className="border px-2 py-1 font-medium text-center">MPN</TableHead>
        <TableHead rowSpan={6} className="border px-2 py-1 font-medium text-center">MPN Attributes</TableHead>
        <TableHead rowSpan={6} className="border px-2 py-1 font-medium text-center">Notes</TableHead>
        <TableHead colSpan={26} className="border px-2 py-1 font-medium bg-blue-50 text-center">In: Production Scenario</TableHead>
      </TableRow>
      
      {/* Second row - Input section subsections */}
      <TableRow>
        <TableHead colSpan={13} className="border px-2 py-1 font-medium bg-blue-100 text-center">Requirements (Rqt)</TableHead>
        <TableHead colSpan={13} className="border px-2 py-1 font-medium bg-green-100 text-center">Receiving (Rec)</TableHead>
      </TableRow>
      
      {/* Third row - Input section week headers */}
      <TableRow>
        {weekNumbers.map((week) => (
          <TableHead key={`rqt-week-${week}`} className="border px-1 py-0.5 font-medium bg-blue-50 text-xs text-center">{`W${week}`}</TableHead>
        ))}
        {weekNumbers.map((week) => (
          <TableHead key={`rec-week-${week}`} className="border px-1 py-0.5 font-medium bg-green-50 text-xs text-center">{`W${week}`}</TableHead>
        ))}
      </TableRow>
      
      {/* Output Section Header */}
      <TableRow>
        <TableHead colSpan={52} className="border px-2 py-1 font-medium bg-yellow-50 text-center">Out: Order Schedule</TableHead>
      </TableRow>
      
      {/* Output Section Subsections */}
      <TableRow>
        <TableHead colSpan={13} className="border px-2 py-1 font-medium bg-blue-100 text-center">Requirements (Rqt)</TableHead>
        <TableHead colSpan={13} className="border px-2 py-1 font-medium bg-orange-100 text-center">Orders (Ord)</TableHead>
        <TableHead colSpan={13} className="border px-2 py-1 font-medium bg-green-100 text-center">Receiving (Rec)</TableHead>
        <TableHead colSpan={13} className="border px-2 py-1 font-medium bg-purple-100 text-center">Inventory (Inv)</TableHead>
      </TableRow>
      
      {/* Output Section Week Headers */}
      <TableRow>
        {weekNumbers.map((week) => (
          <TableHead key={`out-rqt-week-${week}`} className="border px-1 py-0.5 font-medium bg-blue-50 text-xs text-center">{`W${week}`}</TableHead>
        ))}
        {weekNumbers.map((week) => (
          <TableHead key={`ord-week-${week}`} className="border px-1 py-0.5 font-medium bg-orange-50 text-xs text-center">{`W${week}`}</TableHead>
        ))}
        {weekNumbers.map((week) => (
          <TableHead key={`out-rec-week-${week}`} className="border px-1 py-0.5 font-medium bg-green-50 text-xs text-center">{`W${week}`}</TableHead>
        ))}
        {weekNumbers.map((week) => (
          <TableHead key={`inv-week-${week}`} className="border px-1 py-0.5 font-medium bg-purple-50 text-xs text-center">{`W${week}`}</TableHead>
        ))}
      </TableRow>
    </>
  );
};

export default TableHeader;
