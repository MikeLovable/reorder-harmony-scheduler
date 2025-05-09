
import React from 'react';
import { TableHead, TableRow } from '@/components/ui/table';
import { PERIODS } from '../types';

const TableHeader: React.FC = () => {
  const weeks = Array.from({ length: PERIODS }, (_, i) => i);

  return (
    <TableRow>
      <TableHead className="border px-2 py-1 font-medium">MPN</TableHead>
      <TableHead className="border px-2 py-1 font-medium">MPN Attributes</TableHead>
      <TableHead className="border px-2 py-1 font-medium">Notes</TableHead>
      <TableHead className="border px-2 py-1 font-medium">Dir</TableHead>
      <TableHead className="border px-2 py-1 font-medium">KPI</TableHead>
      {weeks.map((week) => (
        <TableHead key={`week-${week}`} className="border px-2 py-1 font-medium text-center">
          Week {week}
        </TableHead>
      ))}
    </TableRow>
  );
};

export default TableHeader;
