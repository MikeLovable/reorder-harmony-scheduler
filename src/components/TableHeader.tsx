
import React from 'react';
import { TableHead, TableRow } from '@/components/ui/table';

const TableHeader: React.FC = () => {
  // Generate week numbers for column headers (0-12)
  const weeks = Array.from({ length: 13 }, (_, i) => i);

  return (
    <>
      {/* Main header row */}
      <TableRow>
        <TableHead rowSpan={2} className="border px-2 py-1 font-medium">MPN</TableHead>
        <TableHead rowSpan={2} className="border px-2 py-1 font-medium">MPN Attributes</TableHead>
        <TableHead rowSpan={2} className="border px-2 py-1 font-medium">Notes</TableHead>
        {weeks.map((week) => (
          <TableHead key={`week-${week}`} className="border px-2 py-1 font-medium text-center">
            Week {week}
          </TableHead>
        ))}
      </TableRow>
    </>
  );
};

export default TableHeader;
