
// Dynamic configuration values - these are managed by AppConfigContext
// Legacy constant exports for backward compatibility
export const PERIODS = 12; // Default value, actual value comes from AppConfigContext
export const SAMPLES = 20; // Default value, actual value comes from AppConfigContext

export type ProductionScenario = {
  Sel?: boolean;
  MPN: string;
  InvTgt: number;
  SStok: number;
  LdTm: number;
  MOQ: number;
  PkQty: number;
  Rqt: number[];
  Rec: number[];
  Inv?: number[];
};

export type OrderSchedule = {
  MPN: string;
  InvTgt: number;
  SStok: number;
  LdTm: number;
  MOQ: number;
  PkQty: number;
  Rqt: number[];
  InRec: number[];
  Ord: number[];
  Rec: number[];
  Inv: number[];
  Notes: string;
};

export type ProductionScenarioArray = ProductionScenario[];
export type OrderScheduleArray = OrderSchedule[];
