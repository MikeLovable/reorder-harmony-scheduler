
import React from 'react';

const TableHeader: React.FC = () => {
  // Generate week numbers for column headers
  const weekNumbers = Array.from({ length: 13 }, (_, i) => i);

  return (
    <thead>
      <tr className="bg-gray-100 text-sm">
        <th rowSpan={3} className="border px-2 py-1 font-medium">MPN</th>
        <th rowSpan={3} className="border px-2 py-1 font-medium">MPN Attributes</th>
        <th rowSpan={3} className="border px-2 py-1 font-medium">Notes</th>
        <th colSpan={26} className="border px-2 py-1 font-medium bg-blue-50">In: Production Scenario</th>
      </tr>
      <tr className="bg-gray-100 text-sm">
        <th colSpan={13} className="border px-2 py-1 font-medium bg-blue-100">Requirements (Rqt)</th>
        <th colSpan={13} className="border px-2 py-1 font-medium bg-green-100">Receiving (Rec)</th>
      </tr>
      <tr className="bg-gray-100 text-xs">
        {weekNumbers.map((week) => (
          <th key={`rqt-week-${week}`} className="border px-2 py-1 font-medium bg-blue-50">{`W${week}`}</th>
        ))}
        {weekNumbers.map((week) => (
          <th key={`rec-week-${week}`} className="border px-2 py-1 font-medium bg-green-50">{`W${week}`}</th>
        ))}
      </tr>
      
      {/* Out: Order Schedule header */}
      <tr className="bg-gray-100 text-sm">
        <th colSpan={3} className="border px-2 py-1 font-medium"></th>
        <th colSpan={52} className="border px-2 py-1 font-medium bg-yellow-50">Out: Order Schedule</th>
      </tr>
      <tr className="bg-gray-100 text-sm">
        <th colSpan={3} className="border-r"></th>
        <th colSpan={13} className="border px-2 py-1 font-medium bg-blue-100">Requirements (Rqt)</th>
        <th colSpan={13} className="border px-2 py-1 font-medium bg-orange-100">Orders (Ord)</th>
        <th colSpan={13} className="border px-2 py-1 font-medium bg-green-100">Receiving (Rec)</th>
        <th colSpan={13} className="border px-2 py-1 font-medium bg-purple-100">Inventory (Inv)</th>
      </tr>
      <tr className="bg-gray-100 text-xs">
        <th colSpan={3} className="border-r"></th>
        {weekNumbers.map((week) => (
          <th key={`out-rqt-week-${week}`} className="border px-1 py-0.5 font-medium bg-blue-50">{`W${week}`}</th>
        ))}
        {weekNumbers.map((week) => (
          <th key={`ord-week-${week}`} className="border px-1 py-0.5 font-medium bg-orange-50">{`W${week}`}</th>
        ))}
        {weekNumbers.map((week) => (
          <th key={`out-rec-week-${week}`} className="border px-1 py-0.5 font-medium bg-green-50">{`W${week}`}</th>
        ))}
        {weekNumbers.map((week) => (
          <th key={`inv-week-${week}`} className="border px-1 py-0.5 font-medium bg-purple-50">{`W${week}`}</th>
        ))}
      </tr>
    </thead>
  );
};

export default TableHeader;
