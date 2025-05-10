
import React from 'react';
import { ProductionScenario } from '@/types';
import { 
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { useAppConfig } from '@/hooks/useAppConfig';

interface ProductionScenarioTableProps {
  scenarios: ProductionScenario[];
  selectAll: boolean;
  onSelectAllChange: (checked: boolean) => void;
  onScenarioSelectChange: (mpn: string, checked: boolean) => void;
}

const ProductionScenarioTable: React.FC<ProductionScenarioTableProps> = ({ 
  scenarios, 
  selectAll,
  onSelectAllChange,
  onScenarioSelectChange
}) => {
  const { periods } = useAppConfig();
  const weeks = Array.from({ length: periods }, (_, i) => i);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Checkbox 
              checked={selectAll} 
              onCheckedChange={onSelectAllChange}
              aria-label="Select all scenarios"
            />
          </TableHead>
          <TableHead className="border px-2 py-1 font-medium">MPN</TableHead>
          <TableHead className="border px-2 py-1 font-medium">MPN Attributes</TableHead>
          <TableHead className="border px-2 py-1 font-medium">Dir</TableHead>
          <TableHead className="border px-2 py-1 font-medium">KPI</TableHead>
          {weeks.map((week) => (
            <TableHead key={`week-${week}`} className="border px-2 py-1 font-medium text-center">
              Week {week}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {scenarios.map((scenario) => (
          <React.Fragment key={scenario.MPN}>
            {/* Requirements Row */}
            <TableRow>
              <TableCell rowSpan={3} className="border px-2 py-1 align-middle">
                <Checkbox 
                  checked={scenario.Sel} 
                  onCheckedChange={(checked) => onScenarioSelectChange(scenario.MPN, !!checked)}
                  aria-label={`Select ${scenario.MPN}`}
                />
              </TableCell>
              <TableCell rowSpan={3} className="border px-2 py-1 font-medium">{scenario.MPN}</TableCell>
              <TableCell rowSpan={3} className="border px-2 py-1 text-sm">
                {`LdTm[${scenario.LdTm}], MOQ[${scenario.MOQ}],
PkQty[${scenario.PkQty}],
InvTgt[${scenario.InvTgt}], SStok[${scenario.SStok}]`}
              </TableCell>
              <TableCell rowSpan={3} className="border px-2 py-1 text-sm font-medium text-left">In</TableCell>
              <TableCell className="border px-2 py-1 text-sm font-medium">Rqt</TableCell>
              {scenario.Rqt.map((val, i) => (
                <TableCell key={`rqt-${i}`} className="border px-2 py-1 text-sm text-right">{val}</TableCell>
              ))}
            </TableRow>

            {/* Receiving Row */}
            <TableRow>
              <TableCell className="border px-2 py-1 text-sm font-medium">Rec</TableCell>
              {scenario.Rec.map((val, i) => (
                <TableCell key={`rec-${i}`} className="border px-2 py-1 text-sm text-right">{val}</TableCell>
              ))}
            </TableRow>

            {/* Inventory Row */}
            <TableRow className="border-b-2">
              <TableCell className="border px-2 py-1 text-sm font-medium">Inv</TableCell>
              {scenario.Inv ? scenario.Inv.map((val, i) => (
                <TableCell key={`inv-${i}`} className="border px-2 py-1 text-sm text-right">{val}</TableCell>
              )) : (
                Array(periods + 1).fill(0).map((_, i) => (
                  <TableCell key={`inv-${i}`} className="border px-2 py-1 text-sm text-right">
                    {i === 0 ? "N/A" : "N/A"}
                  </TableCell>
                ))
              )}
            </TableRow>
          </React.Fragment>
        ))}
      </TableBody>
    </Table>
  );
};

export default ProductionScenarioTable;
